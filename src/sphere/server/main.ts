/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import express from 'express';
import { configure, startup, newStartupContext } from '@onexas/sphere/client/startup';
import { mainRenderer, notfound, favicon } from './main-renderers';
import { loggerMiddleware } from './middlewares/logger';
import bodyParser from 'body-parser';
import Loadable from '@onexas/react-loadable';
import { getLogger, setConfig as setLoggerConfig } from '@onexas/sphere/client/utils/logger';
import { config as dotenvConfig, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { newConfig } from '@onexas/sphere/client/config';
import { existsSync, readFileSync } from 'fs';
import { join as pathJoin } from 'path';
import nodeFormData from 'form-data';
import nodeFetch from 'node-fetch';
import http from 'http';
import https from 'https';
import { StartupOption } from '@onexas/sphere/client/startup';

const logger = getLogger('main');

//apply at server only (client has it already) for coordinate api run in ssr
(global as any).FormData = nodeFormData;
(global as any).__FETCH_API = nodeFetch;

const ENV_SERVER_PREFIX = 'SPHERE_SERVER_';
const ENV_CLIENT_PREFIX = 'SPHERE_CLIENT_';

function mergeEnvConfig(envPrefix: string, config: DotenvParseOutput) {
    for (let name in process.env) {
        if (name.startsWith && name.startsWith(envPrefix)) {
            const value = process.env[name];
            const key = name.substring(envPrefix.length);
            logger.info(`Use Env(${envPrefix}): ${key}=${value}`);
            config[key] = value;
        }
    }
    return config;
}

const serverEnvPath = pathJoin(process.cwd(), 'server.env');
let serverEnv: DotenvConfigOutput;
let serverEnvParsed: any;
if (existsSync(serverEnvPath)) {
    serverEnv = dotenvConfig({ path: serverEnvPath });
    if (serverEnv.error) {
        throw new Error('./server.env config error');
    }
    serverEnvParsed = serverEnv.parsed;
} else {
    logger.warn('no server.env found');
    serverEnvParsed = {};
}
const serverConfig = newConfig(mergeEnvConfig(ENV_SERVER_PREFIX, serverEnvParsed));
setLoggerConfig(serverConfig);

export interface ApplicationCallback {
    (param: { application: express.Application }): void;
}

function escapeRegex(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function main(
    opt: {
        applicationCallback?: ApplicationCallback;
    } & StartupOption = {}
) {
    logger.info('Booting server...');
    logger.info('Server config ', serverConfig);

    logger.debug('sphere server main script starting up...');

    const clientEnvPath = pathJoin(process.cwd(), 'client.env');
    let clientEnvParsed: DotenvParseOutput;
    if (existsSync(clientEnvPath)) {
        const clientEnv = dotenvConfig({ path: clientEnvPath });
        if (clientEnv.error) {
            throw new Error('./client.env config error');
        }
        clientEnvParsed = clientEnv.parsed;
    } else {
        logger.warn('no client.env found');
        clientEnvParsed = {};
    }
    const clientConfig = newConfig(mergeEnvConfig(ENV_CLIENT_PREFIX, clientEnvParsed));

    logger.info('Client config ', clientConfig);

    configure();
    opt.configures &&
        opt.configures.forEach((configure) => {
            configure();
        });    

    let startupContext = newStartupContext(clientConfig);
    opt.contextContributors &&
        opt.contextContributors.forEach((contextContributor) => {
            startupContext = contextContributor(startupContext);
        });

    startup(startupContext);
    opt.startups &&
        opt.startups.forEach((startup) => {
            startup(startupContext);
        });

    const application: express.Application = express();

    let port: number = serverEnvParsed.PORT;
    let httpsPort: number = serverEnvParsed.HTTPS_PORT;

    if (!port && !httpsPort) {
        port = 80;
        httpsPort = 0;
    }

    const bindIps: string[] = serverEnvParsed.BIND_IP
        ? (serverEnvParsed.BIND_IP as string)
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v)
        : ['0.0.0.0'];

    application.use(bodyParser.urlencoded({ extended: true }));
    application.use(bodyParser.json());

    opt.applicationCallback && opt.applicationCallback({ application });

    application.use('/public', express.static('public', { fallthrough: true }));

    //TODO https://stackoverflow.com/questions/15463199/how-to-set-custom-favicon-in-express
    application.use('/favicon.ico', favicon);

    'js,jpg,png,json,svg,ico,css'.split(',').forEach((ext) => {
        ext = escapeRegex(ext);
        application.use(new RegExp(`.*(\\.${ext}\\?\\w*|\\.${ext}\\??)`), notfound);
    });

    application.use(loggerMiddleware);

    //we don't support view, e.g. app.render() it use dynamic/variable module, which is wrong in webpack
    application.set('view', () => {
        throw new Error("Doesn't support View");
    });

    application.get(
        '*',
        mainRenderer(
            clientConfig,
            startupContext.i18nRegister,
            startupContext.i18nLoaderRegister,
            startupContext.routeRegister,
            startupContext.storeRegister,
            startupContext.menuRegister
        )
    );

    Loadable.preloadAll()
        .then(() => {
            //listen when loadable is ready in server, so we can then provide server side rendering
            if (port) {
                try {
                    bindIps.forEach((ip) => {
                        http.createServer(application).listen(port, ip, function () {
                            logger.info(`Listening HTTP on ${ip}:${port}`);
                        });
                    });
                } catch (e) {
                    logger.error(e);
                    throw e;
                }
            }
            if (httpsPort) {
                const httpsCrt = serverEnvParsed.HTTPS_CRT;
                const httpsKey = serverEnvParsed.HTTPS_KEY;
                try {
                    if (!httpsCrt) {
                        throw new Error('HTTPS_CRT is not defined');
                    }
                    if (!httpsKey) {
                        throw new Error('HTTPS_KEY is not defined');
                    }
                    const options = {
                        key: readFileSync(httpsKey),
                        cert: readFileSync(httpsCrt),
                    };
                    bindIps.forEach((ip) => {
                        https.createServer(options, application).listen(httpsPort, ip, function () {
                            logger.info(`* Listening HTTPS on ${ip}:${httpsPort}!`);
                        });
                    });
                } catch (e) {
                    if (e.code && e.code === 'ENOENT') {
                        logger.error(`Booting HTTPS fail, wrong file ${e.path}`);
                    } else {
                        logger.error('Booting HTTPS fail');
                    }
                    throw e;
                }
            }
        })
        .catch((err) => {
            logger.error(err);
            process.exit(1);
        });
}

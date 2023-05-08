/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import Loadable from '@onexas/react-loadable';
import { getBundles } from '@onexas/react-loadable/webpackext';
import {
    COOKIE_DOMAIN,
    COOKIE_PATH,
    DEFAULT_LOCALE,
} from '@onexas/sphere/client/config/config';
import { COOKIE_NAME_LOCALE } from '@onexas/sphere/client/constants';
import { I18nLoaderRegister, I18nRegister } from '@onexas/sphere/client/i18n';
import { MenuRegister } from '@onexas/sphere/client/menus/menus';
import { RouteRegister } from '@onexas/sphere/client/routes';
import { Favicon } from '@onexas/sphere/client/assets/images';
import {
    default as SwitchRoute,
    initI18nLoadable,
} from '@onexas/sphere/client/routes/SwitchRoute';
import { StoreRegister } from '@onexas/sphere/client/stores';
import { Config, Cookies, CookieSetOption, Depot } from '@onexas/sphere/client/types';
import { basex58 } from '@onexas/sphere/client/utils/basex';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import { typeOfString } from '@onexas/sphere/client/utils/object';
import { escapeRegx } from '@onexas/sphere/client/utils/regexp';
import ServerStyleSheets from '@mui/styles/ServerStyleSheets';
import { Request, Response } from 'express';
import { existsSync, readFileSync, readFile } from 'fs';
import { createMemoryHistory } from 'history';
import { join as pathJoin } from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

const mainCssModule = require('@onexas/sphere/client/assets/scss/main.scss');
const mainStyle = mainCssModule.default[0][1];

const logger = getLogger('main');

const loadableRegx = /^loadable-.*\.js$/;
const essentialRegx = /.*\.js$/;

const staticCss = existsSync(pathJoin(process.cwd(), 'public/static.css'));
const staticJs = existsSync(pathJoin(process.cwd(), 'public/static.js'));

let workingFolder: string;

function getWorkingFolder() {
    if (workingFolder) {
        return workingFolder;
    }
    workingFolder = pathJoin('.');
    logger.debug('sphere server working folder : ', workingFolder);
    return workingFolder;
}

function parseRequestHeaderLanguage(req: Request): string {
    try {
        const locales = req.headers['accept-language'].split(',');
        return locales[0].split(';')[0];
    } catch (e) {
        return null;
    }
}

function parseRequestCookies(req: Request): Map<string, string> {
    const map = new Map();
    const str: string = req.headers.cookie || '';
    if (str) {
        str.split(';')
            .map((item) => {
                return item.split('=');
            })
            .forEach((items) => {
                map.set(decodeURIComponent(items[0].trim()), decodeURIComponent(items[1].trim()));
            });
    }
    return map;
}

function parseRequestHost(req: Request): string {
    let name =
        (req.headers['x-forwarded-host'] as string) ||
        (req.headers['host'] as string) ||
        req.hostname;
    if (typeOfString(name)) {
        //trim port
        const i = name.indexOf(':');
        if (i >= 0) {
            name = name.substring(0, i);
        }
        return name;
    }
    return 'unknown-host';
}

class ServerCookies implements Cookies {
    private cookieMap: Map<string, string>;
    updatedCookieMap: Map<string, string>;
    updatedOptionMap: Map<string, CookieSetOption>;
    constructor(cookieMap: Map<string, string>) {
        this.cookieMap = cookieMap;
        this.updatedCookieMap = new Map();
        this.updatedOptionMap = new Map();
    }
    get(key: string, defaultVal?: string): string {
        if (this.updatedCookieMap.has(key)) {
            return this.updatedCookieMap.get(key) || defaultVal;
        }
        return this.cookieMap.get(key) || defaultVal;
    }
    set(key: string, val: string, option?: CookieSetOption): void {
        this.updatedCookieMap.set(key, val);
        if (option) {
            this.updatedOptionMap.set(key, option);
        }
    }
    remove(key: string, option?: CookieSetOption): void {
        this.updatedCookieMap.delete(key);
        this.cookieMap.delete(key);
    }
}

//a simple map implementtion for server request
class ServerDepot implements Depot {
    map = new Map<string, string>();

    get(key: string, defaultVal?: string): string {
        let v = this.map.get(key);
        return v ? v : defaultVal;
    }
    set(key: string, value: string): void {
        this.map.set(key, value);
    }
    remove(key: string): void {
        this.map.set(key, undefined);
    }
    clear(): void {
        this.map.clear();
    }
}

type ENV_VAR = {
    regexp: RegExp;
    value: string;
};

const ENV_REQUEST_HOST_NAME = new RegExp(escapeRegx('${REQUEST_HOST_NAME}'), 'g');

export function mainRenderer(
    clientConfig: Config,
    i18nRegister: I18nRegister,
    i18nLoaderRegister: I18nLoaderRegister,
    routeRegister: RouteRegister,
    storeRegister: StoreRegister,
    menuRegister: MenuRegister
): (req: Request, res: Response) => Promise<void> {
    const essentialBundleJs: Set<string> = (() => {
        const manifestJson = readFileSync(
            pathJoin(getWorkingFolder(), 'manifest.json'),
            'utf8'
        );
        const manifest: {
            [key: string]: string;
        } = JSON.parse(manifestJson);
        const entryPoints = [];
        for (const [key, value] of Object.entries(manifest)) {
            if (essentialRegx.test(key) && !loadableRegx.test(key)) entryPoints.push(value);
        }
        return new Set<string>(entryPoints);
    })();

    logger.debug('essentialBundleJs', essentialBundleJs);

    initI18nLoadable(i18nLoaderRegister);

    const reactLoadable = JSON.parse(
        readFileSync(pathJoin(getWorkingFolder(), 'react-loadable.json'), 'utf8')
    );

    return async function (req: Request, res: Response) {
        try {
            const cookies = new ServerCookies(parseRequestCookies(req));
            let locale: string = cookies.get(COOKIE_NAME_LOCALE);
            if (!locale) {
                locale = parseRequestHeaderLanguage(req) || clientConfig.get(DEFAULT_LOCALE);
                cookies.set(COOKIE_NAME_LOCALE, locale);
            }
            const localDepot = new ServerDepot();
            const sessionDepot = new ServerDepot();

            const collectModules: string[] = [];
            const collectSheets = new ServerStyleSheets();
            const context: any = {};
            const history = createMemoryHistory();

            // https://reactjs.org/docs/react-dom.html#hydrate
            const body = renderToString(
                collectSheets.collect(
                    <Loadable.Capture
                        report={(moduleName) => {
                            logger.debug('collect module ', moduleName);
                            collectModules.push(moduleName);
                        }}
                    >
                        <div suppressHydrationWarning={true}>
                            <StaticRouter location={req.url} context={context}>
                                <SwitchRoute
                                    config={clientConfig}
                                    routeRegister={routeRegister}
                                    storeRegister={storeRegister}
                                    i18nRegister={i18nRegister}
                                    menuRegister={menuRegister}
                                    cookies={cookies}
                                    localDepot={localDepot}
                                    sessionDepot={sessionDepot}
                                    history={history}
                                />
                            </StaticRouter>
                        </div>
                    </Loadable.Capture>
                )
            );
            const reqHost = parseRequestHost(req);
            const cookieDomain = clientConfig.get(COOKIE_DOMAIN, reqHost);
            const cookiePath = clientConfig.get(COOKIE_PATH, '/');
            //set any cookie update back to client
            cookies.updatedCookieMap.forEach((value, key) => {
                const opt = cookies.updatedOptionMap.get(key);
                res.cookie(key, value, {
                    domain: cookieDomain,
                    path: cookiePath,
                    ...opt,
                });
            });

            if (context.url) {
                res.writeHead(302, {
                    Location: context.url,
                });
            } else {
                const loadableBundleJs: Set<string> = (() => {
                    return new Set<string>(
                        getBundles(reactLoadable, collectModules)
                            .filter((bundle) => bundle.file.endsWith('.js'))
                            .map((bundle) => bundle.publicPath)
                    );
                })();

                logger.debug('loadableBundleJs', loadableBundleJs);

                const usedStyle = collectSheets.toString();
                let __ENV = clientConfig.stringify();
                //replace any known EL
                const envVars: ENV_VAR[] = [{ regexp: ENV_REQUEST_HOST_NAME, value: reqHost }];
                envVars.forEach((v) => {
                    __ENV = __ENV.replace(v.regexp, v.value);
                });
                const html = `<!DOCTYPE html>
    <html>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta charSet='utf-8' />
        <link rel='icon' href='/favicon.ico'/>
        <script>
          window.__ENV = '${basex58.encode(Buffer.from(__ENV, 'utf8'))}';
        </script>
        <style type="text/css" id="jss-server-side-1">${mainStyle}</style>
        <style type="text/css" id="jss-server-side-2">${usedStyle}</style>
        ${staticCss ? `<link rel='stylesheet' href='/public/static.css'/>` : ``}
      </head>
      <body>
        <div id="root">${body}</div>
        ${Array.from(essentialBundleJs)
                        .map((js: string) => `<script src="${js}"></script>`)
                        .join('\n')}
        ${Array.from(loadableBundleJs)
                        .map((js: string) => `<script src="${js}"></script>`)
                        .join('\n')}
        ${staticJs ? `<script src='/public/static.js'/></script>` : ``}            
      </body>
    </html>`.trim();
                res.write(html);
            }
            res.end();
        } catch (e) {
            logger.error(req.url, e);
            if (e.stack) {
                logger.error(e.stack);
            }
            res.status(500).send(e.message);
        }
    };
}

export async function notfound(req: Request, res: Response) {
    res.status(404).send('no such resource ' + req.baseUrl);
}

export async function favicon(req: Request, res: Response) {
    res.sendFile(pathJoin(process.cwd(), Favicon))
}
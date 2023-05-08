/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import { basex58 } from '@onexas/sphere/client/utils/basex';
import { getLogger, setConfig as setLoggerConfig } from '@onexas/sphere/client/utils/logger';
import { typeOfString } from '@onexas/sphere/client/utils/object';
import Loadable from '@onexas/react-loadable';
import React from 'react';
import ReactDOM from 'react-dom';
import { newConfig } from './config';
import { mainRenderer } from './main-renderers';
import { newStartupContext, configure, startup, StartupOption } from './startup';

const logger = getLogger('main');

let env: any = {};
// eslint-disable-next-line no-undef
if (typeOfString(__ENV)) {
    // eslint-disable-next-line no-undef
    env = JSON.parse(basex58.decode(__ENV).toString('utf8'));
}
const clientConfig = newConfig(env);
setLoggerConfig(clientConfig);

export function main(opt: StartupOption = {}) {
    logger.debug('sphere client main script is starting up...');

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
    Loadable.preloadReady().then(() => {
        ReactDOM.hydrate(
            React.createElement(
                mainRenderer(
                    startupContext.config,
                    startupContext.i18nRegister,
                    startupContext.i18nLoaderRegister,
                    startupContext.routeRegister,
                    startupContext.storeRegister,
                    startupContext.menuRegister
                ),
                null
            ),
            document.getElementById('root')
        );
    });
}

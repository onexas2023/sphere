/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { StoreRegister } from '@onexas/sphere/client/stores';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import { loadStyles } from '@onexas/sphere/client/utils/ui';
import Loadable from '@onexas/react-loadable';
import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import UniversalCookies from 'universal-cookie';
import { I18nLoaderRegister, I18nRegister } from './i18n';
import { RouteRegister } from './routes';
import { initI18nLoadable, SwitchRoute } from './routes/SwitchRoute';
import { Config, Cookies, CookieSetOption, Depot } from './types';
import { COOKIE_DOMAIN, COOKIE_PATH } from './config';
import { MenuRegister } from './menus/menus';

loadStyles(require('@onexas/sphere/client/assets/scss/main.scss'));

const logger = getLogger('main');

//remove uncessary ssr styles
function removeJssServerSide() {
    const jssStyles = document.querySelectorAll('style[id^="jss-server-side-"');
    if (jssStyles) {
        jssStyles.forEach((e) => {
            e.parentNode.removeChild(e);
        });
    }
}

class ClientCookies implements Cookies {
    cookies: UniversalCookies;
    path: string;
    domain: string;
    constructor(cookies: UniversalCookies, domain: string, path: string) {
        this.cookies = cookies;
        this.domain = domain;
        this.path = path;
    }

    get(key: string, defaultVal?: string): string {
        const val = this.cookies.get(key);
        return val || defaultVal;
    }
    set(key: string, val: string, option?: CookieSetOption): void {
        this.cookies.set(key, val, {
            domain: this.domain,
            path: this.path,
            ...option,
        });
    }
    remove(key: string, option?: CookieSetOption): void {
        this.cookies.remove(key, {
            domain: this.domain,
            path: this.path,
            ...option,
        });
    }
}

class ClientLocalDepot implements Depot {
    get(key: string, defaultVal?: string): string {
        let v = localStorage.getItem(key);
        return v ? v : defaultVal;
    }
    set(key: string, value: string): void {
        localStorage.setItem(key, value);
    }
    remove(key: string): void {
        localStorage.removeItem(key);
    }
    clear(): void {
        localStorage.clear();
    }
}
class ClientSessionDepot implements Depot {
    get(key: string, defaultVal?: string): string {
        let v = sessionStorage.getItem(key);
        return v ? v : defaultVal;
    }
    set(key: string, value: string): void {
        sessionStorage.setItem(key, value);
    }
    remove(key: string): void {
        sessionStorage.removeItem(key);
    }
    clear(): void {
        sessionStorage.clear();
    }
}

export function mainRenderer(
    config: Config,
    i18nRegister: I18nRegister,
    i18nLoaderRegister: I18nLoaderRegister,
    routeRegister: RouteRegister,
    storeRegister: StoreRegister,
    menuRegister: MenuRegister
): () => React.ReactElement {
    logger.debug('Client config ', config);
    initI18nLoadable(i18nLoaderRegister);
    return () => {
        removeJssServerSide();

        const cookies = new ClientCookies(
            new UniversalCookies(),
            config.get(COOKIE_DOMAIN),
            config.get(COOKIE_PATH, '/')
        );

        const localDepot = new ClientLocalDepot();
        const sessionDepot = new ClientSessionDepot();

        const history = createBrowserHistory();
        //we use our created history, don't use browserroute
        //https://github.com/brickspert/blog/issues/3
        //https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/modules/BrowserRouter.js
        return (
            <Loadable.Capture report={(moduleName) => {}}>
                <div suppressHydrationWarning={true}>
                    <Router history={history}>
                        <SwitchRoute
                            config={config}
                            routeRegister={routeRegister}
                            storeRegister={storeRegister}
                            i18nRegister={i18nRegister}
                            menuRegister={menuRegister}
                            cookies={cookies}
                            localDepot={localDepot}
                            sessionDepot={sessionDepot}
                            history={history}
                        />
                    </Router>
                </div>
            </Loadable.Capture>
        );
    };
}

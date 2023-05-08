/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import {
    PATH_LOGIN as ROUTE_PATH_LOGIN,
    PATH_MY_ACCOUNT,
} from '@onexas/sphere/client/routes/paths';
import { Config, ICONDEF_PREFIX } from '@onexas/sphere/client/types';
import { VERSION } from '@onexas/sphere/client/ver';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import {
    coerceToBoolean,
    coerceToNumber,
    coerceToString,
} from '@onexas/sphere/client/utils/object';
import { homeAppLink } from '@onexas/sphere/client/icons';

const logger = getLogger('config');

/**
 * the default sphere config by js (not by json), so we can do some code link process.env.xxx === "true" here
 */
export const APP_CODE = 'APP_CODE';
export const APP_NAME = 'APP_NAME';
export const COORDINATE_API_BASE_PATH = 'COORDINATE_API_BASE_PATH';
export const DEFAULT_LOCALE = 'DEFAULT_LOCALE';
export const DEFAULT_THEME = 'DEFAULT_THEME';
export const SUPPORTED_LOCALES = 'SUPPORTED_LOCALES';
export const SUPPORTED_THEMES = 'SUPPORTED_THEMES';
export const SUPPORTED_TIMEZONES = 'SUPPORTED_TIMEZONES';

export const URI_LOGIN_LOGO = "URI_LOGIN_LOGO";

export const PATH_HOME = 'PATH_HOME';
export const PATH_LOGIN = 'PATH_LOGIN';
export const APPLINKS = 'APPLINKS';
export const APPLINKS_ON_APPBAR = 'APPLINKS_ON_APPBAR';

export const SITE_URL = 'SITE_URL';
export const SITE_URL_NAME = 'SITE_URL_NAME';
export const SITE_NAME = 'SITE_NAME';
export const SITE_COPY_RIGHT = 'SITE_CR';
export const SUPPORT_URL = 'SUPPORT_URL';
export const SITE_VERSION = 'SITE_VERSION';

export const COOKIE_DOMAIN = 'COOKIE_DOMAIN';
export const COOKIE_PATH = 'COOKIE_PATH';
export const PREFS_PAGESIZES = 'PREFS_PAGESIZES';

export const defaultConfig: any = {};

defaultConfig[APP_CODE] = 'sphere';
defaultConfig[APP_NAME] = 'sphere';
defaultConfig[SUPPORTED_LOCALES] = 'en,zh-TW';
defaultConfig[DEFAULT_LOCALE] = 'en';
defaultConfig[SUPPORTED_THEMES] = 'light,dark';
defaultConfig[DEFAULT_THEME] = 'light';

defaultConfig[PATH_HOME] = PATH_MY_ACCOUNT;
defaultConfig[PATH_LOGIN] = ROUTE_PATH_LOGIN;

defaultConfig[APPLINKS] = 'sphere';
defaultConfig[APPLINKS + '.sphere.name'] = 'Sphere';
defaultConfig[APPLINKS + '.sphere.image'] = ICONDEF_PREFIX + JSON.stringify(homeAppLink);
defaultConfig[APPLINKS + '.sphere.href'] = '/';

defaultConfig[PREFS_PAGESIZES] = '20,50,100,200';

defaultConfig[COORDINATE_API_BASE_PATH] = 'http://localhost:8088';

defaultConfig[SITE_VERSION] = VERSION;

const globalDefaultConfig: any = {};

class ConfigImpl implements Config {
    private config: any;

    production: boolean;

    constructor(config: any = {}) {
        this.config = { ...config };
        //build time result
        this.production = process.env.NODE_ENV === 'production';
    }

    private _get(key: string, defaultVal?: any): any {
        let val: any;
        /*eslint no-prototype-builtins: "off"*/
        if (this.config.hasOwnProperty(key)) {
            val = this.config[key];
        } else if (globalDefaultConfig.hasOwnProperty(key)) {
            val = globalDefaultConfig[key];
        }
        if (!val) {
            val = defaultVal;
        }
        return val;
    }

    get(key: string, defaultVal?: string): string {
        return coerceToString(this._get(key, defaultVal));
    }

    getBoolean(key: string, defaultVal?: boolean): boolean {
        return coerceToBoolean(this._get(key, defaultVal));
    }

    getNumber(key: string, defaultVal?: number): number {
        return coerceToNumber(this._get(key, defaultVal));
    }

    stringify() {
        return JSON.stringify(this.config);
    }
}

export function newConfig(config: any = {}): Config {
    return new ConfigImpl(config);
}

export function setGlobalDefault(defaultConfigSet: any) {
    for (const p in defaultConfigSet) {
        if (globalDefaultConfig.hasOwnProperty(p)) {
            logger.debug('Repace default config', p, defaultConfigSet[p]);
        } else {
            logger.debug('Set default config', p, defaultConfigSet[p]);
        }
        globalDefaultConfig[p] = defaultConfigSet[p];
    }
}

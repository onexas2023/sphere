/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { DEFAULT_LOCALE } from '@onexas/sphere/client/config/config';
import { Config, Cookies, I18n, I18nTrackable } from '@onexas/sphere/client/types';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import { mergeDeep, typeOfString } from '@onexas/sphere/client/utils/object';
import i18next from 'i18next';
import { action, makeObservable, observable } from 'mobx';

const logger = getLogger('i18n');

function handleReturnObjects(i18nexti18n: i18next.i18n, key: string, options: any = {}) {
    const { returnObjects, ...other } = options;
    const val = i18nexti18n.t(key, { returnObjects: true, ...other });
    if (returnObjects || typeOfString(val)) {
        return val;
    }
    return val['@'] ? val['@'] : key;
}

class I18nTrackableImpl implements I18nTrackable {
    private i18nexti18n: i18next.i18n;

    constructor(i18nexti18n: i18next.i18n) {
        this.i18nexti18n = i18nexti18n;
    }

    l(key: string, options?: any) {
        return handleReturnObjects(this.i18nexti18n, key, options);
    }
    e(key: string) {
        return this.i18nexti18n.exists(key);
    }
}

class I18nImpl implements I18n {
    private i18nexti18n: i18next.i18n;
    private cookies: Cookies;
    private changeLocaleCallback: (locale: string) => void;

    @observable
    private _t: I18nTrackable;
    get t() {
        return this._t;
    }

    @observable
    private _locale: string;
    get locale() {
        return this._locale;
    }

    constructor(
        cookies: Cookies,
        i18nexti18n: i18next.i18n,
        changeLocaleCallback?: (locale: string) => void
    ) {
        this.cookies = cookies;
        this.i18nexti18n = i18nexti18n;
        this._locale = i18nexti18n.language;
        this._t = new I18nTrackableImpl(i18nexti18n);
        this.changeLocaleCallback = changeLocaleCallback;

        makeObservable(this);
    }

    l(key: string, options?: any) {
        return handleReturnObjects(this.i18nexti18n, key, options);
    }
    e(key: string) {
        return this.i18nexti18n.exists(key);
    }

    @action
    changeLocale(locale: string) {
        this._locale = locale;
        if (this.i18nexti18n.languages.some((l) => l === locale)) {
            this.i18nexti18n.changeLanguage(locale);
            this._t = new I18nTrackableImpl(this.i18nexti18n);
        }
        if (this.changeLocaleCallback) {
            this.changeLocaleCallback(locale);
        }
    }
}

export class I18nRegister {
    private translationMap: Map<string, any> = new Map();

    register(locale: string, translation: any) {
        logger.debug('Register i18n', locale, translation);
        if (this.translationMap.has(locale)) {
            this.translationMap.set(
                locale,
                mergeDeep(this.translationMap.get(locale), translation)
            );
        } else {
            this.translationMap.set(locale, mergeDeep({}, translation));
        }
    }

    has(locale: string): boolean {
        return this.translationMap.has(locale);
    }

    create(
        config: Config,
        cookies: Cookies,
        locale: string,
        changeLocale: (locale: string) => void
    ): I18n {
        const resources: i18next.Resource = {};
        const defaultLocale: string = config.get(DEFAULT_LOCALE);

        const locales: string[] = [defaultLocale, locale];

        locales.forEach((l) => {
            if (!resources[l]) {
                resources[l] = {
                    translation: this.translationMap.get(l),
                };
            }
        });

        const i18n = i18next.createInstance();
        i18n.init({
            lng: locale,
            debug: config.getBoolean('debug.i18next', false),
            fallbackLng: defaultLocale,
            resources: resources,
            returnObjects: true,
            interpolation: {
                escapeValue: false,
            },
        });

        return new I18nImpl(cookies, i18n, changeLocale);
    }
}

export type I18nLoader = {
    loader: () => Promise<any>;
    modules: string[];
};

export class I18nLoaderRegister {
    private _loadersMap: Map<string, I18nLoader[]> = new Map();

    register(locale: string, loader: I18nLoader) {
        let ls = this._loadersMap.get(locale);
        if (!ls) {
            this._loadersMap.set(locale, (ls = []));
        }
        ls.push(loader);
    }

    get loadersMap() {
        return new Map(this._loadersMap);
    }
}

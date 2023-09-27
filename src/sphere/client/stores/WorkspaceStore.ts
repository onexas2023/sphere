/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import {
    Authentication,
    buildApiConfiguration,
    CoordinateAuthApi,
    CoordinatePreferenceApi,
    DOMAIN_LOCAL,
} from '@onexas/sphere/client/api';
import { PATH_LOGIN } from '@onexas/sphere/client/config';
import { DEFAULT_LOCALE, DEFAULT_THEME, SUPPORTED_LOCALES, SUPPORTED_TIMEZONES } from '@onexas/sphere/client/config/config';
import {
    COOKIE_NAME_AUTH,
    COOKIE_NAME_LOCALE,
    COOKIE_NAME_THEME,
    LOCAL_DEPOT_NAME_LAST_AUID,
    LOCAL_DEPOT_NAME_PRI_PREFS,
    LOCAL_DEPOT_NAME_PUB_PREFS,
    PARAM_BACK_PATH,
    SESSION_DEPOT_NAME_MENU,
} from '@onexas/sphere/client/constants';
import {
    DynamicLabel,
    FilterObserver,
    hasWindow,
    Message,
    MessageLevel,
    PermissionGrant,
    PermissionGrants,
    StateSyncer,
    Unregister,
} from '@onexas/sphere/client/types';
import { AppError, ERR_IGNORABLE, isAppError } from '@onexas/sphere/client/utils/app';
import { envTimezoneName, envTimezoneNames } from '@onexas/sphere/client/utils/datetime';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import { checkPermissionGrants } from '@onexas/sphere/client/utils/security';
import { History } from 'history';
import { computed, makeObservable, observable } from 'mobx';
import AbstractStore from './AbstractStore';
import { StoreCreateContext } from './register';

const CFG_PREFIX = 'sphere.workspaceStore.';
const CFG_MSG_SIZE = CFG_PREFIX + 'maxMessageSize';

const USER_PREFERENCEKEY = "sphere-user";

const logger = getLogger('store.workspace');

type FilterObserverWrap = {
    observer?: FilterObserver;
};

type WorkspacePreferences = {
    loginDomain: string;
    locale: string;
    themeName: string
    pageSize: number;
    dateFormat: string;
    timeFormat: string;
    timeSecondFormat: string;
    timezone: string;
    autoReloadSecond: number;
    vingReloadSecond: number;
};

interface SearchParams {
    get(name: string): string;
    has(name: string): boolean;
}

class SearchParamsImpl implements SearchParams {
    urlsp: URLSearchParams;
    constructor() {
        this.urlsp = hasWindow && new URL(window.location.href).searchParams;
    }
    get(name: string): string {
        return this.urlsp ? this.urlsp.get(name) : null;
    }
    has(name: string): boolean {
        return this.urlsp && this.urlsp.has(name);
    }
}

//clear after logout or different user alias
const LOGOUT_COOKIE_CLEAR_LIST = [COOKIE_NAME_AUTH, COOKIE_NAME_LOCALE, COOKIE_NAME_THEME];
const LOGOUT_LOCAL_DEPOT_CLEAR_LIST = [LOCAL_DEPOT_NAME_LAST_AUID, LOCAL_DEPOT_NAME_PRI_PREFS];
const LOGOUT_SESSION_DEPOT_CLEAR_LIST = [SESSION_DEPOT_NAME_MENU];

const staticDefaultPreferences: WorkspacePreferences = {
    loginDomain: DOMAIN_LOCAL,
    locale: "",
    themeName: "",
    pageSize: 20,
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    timeSecondFormat: 'HH:mm:ss',
    timezone: envTimezoneName,
    autoReloadSecond: 10,
    vingReloadSecond: 5,
};

export default class WorkspaceStore extends AbstractStore {
    static readonly NAME = 'workspaceStore';

    @observable
    authentication: Authentication;

    @observable
    messages: Message[] = [];

    @observable
    private _filterObservers: FilterObserverWrap[] = [];

    @observable
    private _filter: string = '';

    @observable
    title: DynamicLabel;

    @observable
    private _urlSearchParams: SearchParams;

    @observable
    private _windowLocation: Location;

    @observable
    private _pubPreferences: WorkspacePreferences;

    @observable
    private _priPreferences: WorkspacePreferences;

    readonly supportedLocales: string[];
    readonly supportedTimezones: string[];

    private history: History;
    private nexMessageId: number = 0;

    private defaultPreferences: WorkspacePreferences;

    private stateSyncer?: StateSyncer;

    setStateSyncer(syncer: StateSyncer) {
        this.stateSyncer = syncer;
    }

    @computed
    get preferredPageSize() {
        return this.preferences.pageSize;
    }
    set preferredPageSize(preferredPageSize: number) {
        this.preferences = { ...this.preferences, pageSize: preferredPageSize };
    }

    @computed
    get preferredAutoReloadSecond() {
        return this.preferences.autoReloadSecond;
    }
    set preferredAutoReloadSecond(preferredAutoReloadSecond: number) {
        this.preferences = {
            ...this.preferences,
            autoReloadSecond: preferredAutoReloadSecond,
        };
    }

    @computed
    get preferredVingReloadSecond() {
        return this.preferences.vingReloadSecond;
    }
    set preferredVingReloadSecond(preferredVingReloadSecond: number) {
        this.preferences = {
            ...this.preferences,
            vingReloadSecond: preferredVingReloadSecond,
        };
    }
    @computed
    get preferredDateFormat() {
        return this.preferences.dateFormat;
    }
    set preferredDateFormat(preferredDateFormat: string) {
        this.preferences = { ...this.preferences, dateFormat: preferredDateFormat };
    }

    @computed
    get preferredTimeFormat() {
        return this.preferences.timeFormat;
    }
    set preferredTimeFormat(preferredTimeFormat: string) {
        this.preferences = { ...this.preferences, timeFormat: preferredTimeFormat };
    }

    @computed
    get preferredDateTimeFormat() {
        return this.preferredDateFormat + ' ' + this.preferredTimeFormat;
    }

    @computed
    get preferredTimeSecondFormat() {
        return this.preferences.timeSecondFormat;
    }
    set preferredTimeSecondFormat(preferredTimeSecondFormat: string) {
        this.preferences = {
            ...this.preferences,
            timeSecondFormat: preferredTimeSecondFormat,
        };
    }

    @computed
    get preferredTimezone() {
        return this.preferences.timezone;
    }
    set preferredTimezone(timezone: string) {
        this.preferences = { ...this.preferences, timezone };
    }

    @computed
    get loginDomain() {
        return this.preferences.loginDomain;
    }
    set loginDomain(loginDomain: string) {
        this.preferences = { ...this.preferences, loginDomain };
    }

    @computed
    get locale() {
        return this.preferences.locale;
    }
    set locale(locale: string) {
        this.preferences = { ...this.preferences, locale };
    }

    @computed
    get themeName() {
        return this.preferences.themeName;
    }
    set themeName(themeName: string) {
        this.preferences = { ...this.preferences, themeName };
    }

    @computed
    get anyFilterObserver() {
        return this._filterObservers.length > 0;
    }

    @computed
    get filter() {
        return this._filter;
    }
    set filter(filter: string) {
        this._filter = filter;
        this._filterObservers.forEach((o) => {
            o.observer && o.observer(this._filter);
        });
    }

    constructor(param: StoreCreateContext & { history: History }) {
        super(param);
        this.history = param.history;

        let c = this.config.get(SUPPORTED_LOCALES);
        this.supportedLocales = c ? c.split(',') : [];
        c = this.config.get(SUPPORTED_TIMEZONES);
        this.supportedTimezones = c ? c.split(',') : envTimezoneNames;

        const prefs = this.defaultPreferences = { ...staticDefaultPreferences };
        prefs.locale = this.config.get(DEFAULT_LOCALE);
        prefs.themeName = this.config.get(DEFAULT_THEME);

        let text = this.localDepot.get(LOCAL_DEPOT_NAME_PRI_PREFS);
        if (text) {
            try {
                const obj = JSON.parse(text);
                const pp = { ...prefs } as any;
                for (const p in pp) {
                    pp[p] = obj[p] ? obj[p] : pp[p];
                }
                this._priPreferences = pp;
            } catch (e) {
                logger.warn(e);
            }

            logger.debug('private preferences', this._priPreferences);
        }

        text = this.localDepot.get(LOCAL_DEPOT_NAME_PUB_PREFS);
        if (text) {
            try {
                const obj = JSON.parse(text);
                const pp = { ...prefs } as any;
                for (const p in pp) {
                    pp[p] = obj[p] ? obj[p] : pp[p];
                }
                this._pubPreferences = pp;
            } catch (e) {
                logger.warn(e);
            }
        } else {
            this._pubPreferences = { ...prefs };
        }
        logger.debug('pub preferences', this._pubPreferences);

        this._urlSearchParams = new SearchParamsImpl();
        this._windowLocation = hasWindow && window.location;

        makeObservable(this);
    }

    clearUserData() {
        LOGOUT_COOKIE_CLEAR_LIST.forEach((n) => {
            this.cookies.remove(n);
        });
        LOGOUT_LOCAL_DEPOT_CLEAR_LIST.forEach((n) => {
            this.localDepot.remove(n);
        });
        LOGOUT_SESSION_DEPOT_CLEAR_LIST.forEach((n) => {
            this.sessionDepot.remove(n);
        });

        this._priPreferences = undefined;
    }

    async logout(backpath?: string) {
        this.clearUserData();

        let path = this.config.get(PATH_LOGIN);
        if (backpath) {
            path += '?' + PARAM_BACK_PATH + '=' + backpath;
        }
        this.redirect(path);

        this.authentication = null;
    }

    async login(account: string, password: string, domain?: string) {
        return new CoordinateAuthApi(buildApiConfiguration(this.storeHolder))
            .authenticate({
                request: {
                    account,
                    password,
                    domain,
                },
            })
            .then((res) => {
                if (res.aliasUid !== this.localDepot.get(LOCAL_DEPOT_NAME_LAST_AUID)) {
                    this.clearUserData();
                }
                this.cookies.set(COOKIE_NAME_AUTH, res.token);
                this.localDepot.set(LOCAL_DEPOT_NAME_LAST_AUID, res.aliasUid);
                this.authentication = res;
                return this.loadServerUserPreference();
            })
    }

    get authenticatable(): boolean {
        return this.cookies.get(COOKIE_NAME_AUTH) ? true : false;
    }

    @computed
    get urlSearchParams() {
        return this._urlSearchParams;
    }

    @computed
    get windowLocation() {
        return this._windowLocation;
    }

    async loadServerUserPreference() {
        return new CoordinatePreferenceApi(buildApiConfiguration(this.storeHolder)).findPreference({
            key: USER_PREFERENCEKEY
        }).then((res) => {
            let preferences: WorkspacePreferences;
            if (res) {
                try {
                    const obj = JSON.parse(res);
                    const pp = { ...this.defaultPreferences } as any;
                    for (const p in pp) {
                        pp[p] = obj[p] ? obj[p] : pp[p];
                    }
                    this._priPreferences = preferences = pp;
                } catch (e) {
                    logger.warn(e);
                }
            }
            if (!preferences) {
                preferences = { ...this._pubPreferences };
                this._priPreferences = preferences;
            }
            this.localDepot.set(LOCAL_DEPOT_NAME_PRI_PREFS, JSON.stringify(preferences));

            if (!(this.locale !== preferences.locale || this.themeName !== preferences.themeName)) {
                return this.refresh();
            }
        })
    }
    async saveServerUserPreference() {
        const value = JSON.stringify({...this._priPreferences});
        return new CoordinatePreferenceApi(buildApiConfiguration(this.storeHolder)).updatePreference({
            key: USER_PREFERENCEKEY,
            value
        })
    }

    async authenticate() {
        const token = this.cookies.get(COOKIE_NAME_AUTH);
        if (token) {
            return new CoordinateAuthApi(buildApiConfiguration(this.storeHolder))
                .authenticate({
                    request: {
                        token,
                    },
                })
                .then((res) => {
                    const lauid = this.localDepot.get(LOCAL_DEPOT_NAME_LAST_AUID);
                    if (res.aliasUid !== lauid) {
                        this.clearUserData();
                    }
                    this.cookies.set(COOKIE_NAME_AUTH, res.token);
                    this.localDepot.set(LOCAL_DEPOT_NAME_LAST_AUID, res.aliasUid);
                    this.authentication = res;
                    //don't always load user preference in token mode
                    if (res.aliasUid !== lauid || !this._priPreferences) {
                        return this.loadServerUserPreference();
                    }
                });
        } else {
            throw new AppError("can't find any token, please login again");
        }
    }

    async notify(text: string, level: MessageLevel = MessageLevel.Info) {
        const { config, messages } = this;
        const timestamp = new Date().getTime();
        messages.push({
            key: '_' + ++this.nexMessageId,
            shown: 0,
            text,
            level,
            timestamp,
        });
        const max = config.getNumber(CFG_MSG_SIZE, 15);
        const l = messages.length;
        if (l > max) {
            this.messages = messages.slice(l - max);
        }
    }

    async removeMessage(key: string) {
        this.messages = this.messages.filter((m) => m.key !== key);
    }

    private get preferences() {
        return this._priPreferences || this._pubPreferences;
    }

    private set preferences(preferences: WorkspacePreferences) {
        if (this._priPreferences) {
            this._priPreferences = preferences;
            this.localDepot.set(LOCAL_DEPOT_NAME_PRI_PREFS, JSON.stringify(preferences));
        } else {
            this._pubPreferences = preferences;
            this.localDepot.set(LOCAL_DEPOT_NAME_PUB_PREFS, JSON.stringify(preferences));
        }
    }

    async redirect(path: string, evt?: any) {
        if (evt && this._open(path, evt)) {
            return;
        }
        if (hasWindow) {
            window.location.assign(path);
        }
    }

    async reroute(path: string, evt?: any) {
        if (evt && this._open(path, evt)) {
            return;
        }
        this.history.push(path);
    }

    open(path: string, evt?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (hasWindow) {
                resolve(window.open(path, '_blank'));
            }
            return resolve(null);
        });
    }

    private _open(path: string, evt?: any) {
        if (hasWindow && evt.ctrlKey) {
            return window.open(path, '_blank');
        }
        return null;
    }

    async reload() {
        if (hasWindow) {
            window.location.reload();
        }
    }

    async refresh() {
        this.stateSyncer?.sync();
    }

    async hintReroute() {
        this._urlSearchParams = new SearchParamsImpl();
        this._windowLocation = hasWindow && window.location;
    }

    errorHandler = (err: any): void => {
        //TODO a register to register different error handler
        //coordinate api request error
        if (isAppError(err)) {
            //we throw some skip err, so just ignore it.
            const appErr = err as AppError;
            if (appErr.code <= ERR_IGNORABLE) {
                logger.debug(appErr.message);
            } else {
                logger.error(err.message);
                this.notify(err.message, MessageLevel.Error);
            }
        } else if (err.url && err.status && err.status >= 400) {
            //assume it is a response
            const res = err as Response;
            if (res.status === 401) {
                this.reload();
                return;
            }
            const level =
                res.status < 500 && res.status > 400 ? MessageLevel.Warning : MessageLevel.Error;
            res.json()
                .then((json) => {
                    if (json.msg) {
                        this.notify(json.msg, level);
                    } else {
                        throw new AppError('unknown msg');
                    }
                })
                .catch((e) => {
                    const text = res.statusText ? res.statusText : 'Http error : ' + res.status;
                    this.notify(text, level);
                });
        } else if (err.message) {
            //type error
            logger.error(err);
            this.notify(err.message, MessageLevel.Error);
        } else {
            logger.error('Unhandled error', err);
        }
    };

    checkPermissionGrants(grants: PermissionGrants | PermissionGrant[]) {
        return (
            this.authentication &&
            this.authentication.permissions &&
            checkPermissionGrants(grants, this.authentication.permissions)
        );
    }

    registerFilterObserver(observer?: FilterObserver): Unregister {
        const wrap = {
            observer,
        };
        this._filterObservers.push(wrap);
        return () => {
            this._filterObservers = this._filterObservers.filter((o) => {
                o !== wrap;
            });
            if (this._filterObservers.length === 0) {
                this._filter = '';
            }
        };
    }
}

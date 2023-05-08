/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */

import {
    Authentication,
    buildApiConfiguration,
    CoordinateAuthApi,
} from '@onexas/sphere/client/api';
import { PATH_LOGIN } from '@onexas/sphere/client/config';
import { SUPPORTED_LOCALES, SUPPORTED_TIMEZONES } from '@onexas/sphere/client/config/config';
import {
    COOKIE_NAME_AUTH,
    COOKIE_NAME_LOCALE,
    COOKIE_NAME_THEME,
    LOCAL_DEPOT_NAME_LAST_AID,
    LOCAL_DEPOT_NAME_PREFS,
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
    Unregister,
} from '@onexas/sphere/client/types';
import { AppError, ERR_IGNORABLE, isAppError } from '@onexas/sphere/client/utils/app';
import { basex58 } from '@onexas/sphere/client/utils/basex';
import { envTimezoneName, envTimezoneNames } from '@onexas/sphere/client/utils/datetime';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import { checkPermissionGrants } from '@onexas/sphere/client/utils/security';
import { History } from 'history';
import { computed, makeObservable, observable } from 'mobx';
import AbstractStore from './AbstractStore';
import { StoreCreateContext } from './register';

const CFG_PREFIX = 'sphere.workspaceStore.';
const CFG_MSG_SIZE = CFG_PREFIX + 'maxMessageSize';

const logger = getLogger('store.workspace');

type FilterObserverWrap = {
    observer?: FilterObserver;
};

type Preferences = {
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
const LOGOUT_LOCAL_DEPOT_CLEAR_LIST = [LOCAL_DEPOT_NAME_LAST_AID, LOCAL_DEPOT_NAME_PREFS];
const LOGOUT_SESSION_DEPOT_CLEAR_LIST = [SESSION_DEPOT_NAME_MENU];

const defaultPreferences: Preferences = {
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
    private _preferences: Preferences;

    readonly supportedLocales: string[];
    readonly supportedTimezones: string[];

    private history: History;
    private nexMessageId: number = 0;

    private tempAuthCookieName: string;

    @computed
    get preferredPageSize() {
        return this._preferences.pageSize;
    }
    set preferredPageSize(preferredPageSize: number) {
        this.updatePreferences({ ...this._preferences, pageSize: preferredPageSize });
    }

    @computed
    get preferredAutoReloadSecond() {
        return this._preferences.autoReloadSecond;
    }
    set preferredAutoReloadSecond(preferredAutoReloadSecond: number) {
        this.updatePreferences({
            ...this._preferences,
            autoReloadSecond: preferredAutoReloadSecond,
        });
    }

    @computed
    get preferredVingReloadSecond() {
        return this._preferences.vingReloadSecond;
    }
    set preferredVingReloadSecond(preferredVingReloadSecond: number) {
        this.updatePreferences({
            ...this._preferences,
            vingReloadSecond: preferredVingReloadSecond,
        });
    }
    @computed
    get preferredDateFormat() {
        return this._preferences.dateFormat;
    }
    set preferredDateFormat(preferredDateFormat: string) {
        this.updatePreferences({ ...this._preferences, dateFormat: preferredDateFormat });
    }

    @computed
    get preferredTimeFormat() {
        return this._preferences.timeFormat;
    }
    set preferredTimeFormat(preferredTimeFormat: string) {
        this.updatePreferences({ ...this._preferences, timeFormat: preferredTimeFormat });
    }

    @computed
    get preferredDateTimeFormat() {
        return this.preferredDateFormat + ' ' + this.preferredTimeFormat;
    }

    @computed
    get preferredTimeSecondFormat() {
        return this._preferences.timeSecondFormat;
    }
    set preferredTimeSecondFormat(preferredTimeSecondFormat: string) {
        this.updatePreferences({
            ...this._preferences,
            timeSecondFormat: preferredTimeSecondFormat,
        });
    }

    @computed
    get preferredTimezone() {
        return this._preferences.timezone;
    }
    set preferredTimezone(timezone: string) {
        this.updatePreferences({ ...this._preferences, timezone: timezone });
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

        const prefs = this.localDepot.get(LOCAL_DEPOT_NAME_PREFS);
        if (prefs) {
            try {
                const obj = JSON.parse(basex58.decode(prefs).toString('utf8'));
                const pp = { ...defaultPreferences } as any;
                for (const p in pp) {
                    pp[p] = obj[p] ? obj[p] : pp[p];
                }
                this._preferences = pp;
            } catch (e) {
                logger.warn(e);
            }
        } else {
            this._preferences = { ...defaultPreferences };
        }
        logger.debug('preferences', this._preferences);

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

        this._preferences = { ...defaultPreferences };
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
                if (res.aliasUid !== this.localDepot.get(LOCAL_DEPOT_NAME_LAST_AID)) {
                    this.clearUserData();
                }
                this.cookies.set(COOKIE_NAME_AUTH, res.token);
                this.localDepot.set(LOCAL_DEPOT_NAME_LAST_AID, res.aliasUid);
                this.authentication = res;
            });
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
                    if (res.aliasUid !== this.localDepot.get(LOCAL_DEPOT_NAME_LAST_AID)) {
                        this.clearUserData();
                    }
                    this.cookies.set(COOKIE_NAME_AUTH, res.token);
                    this.localDepot.set(LOCAL_DEPOT_NAME_LAST_AID, res.aliasUid);
                    this.authentication = res;
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

    private updatePreferences(preferences: Preferences) {
        this._preferences = preferences;
        this.localDepot.set(
            LOCAL_DEPOT_NAME_PREFS,
            basex58.encode(Buffer.from(JSON.stringify(preferences), 'utf8'))
        );
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

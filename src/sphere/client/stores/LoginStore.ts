/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import {
    buildApiConfiguration,
    DOMAIN_LOCAL,
    UDomain,
    CoordinateMetainfoApi,
} from '@onexas/sphere/client/api';
import { action, makeObservable, observable } from 'mobx';
import { WorkspaceStore } from '.';
import AbstractStore from './AbstractStore';
import { StoreCreateContext } from './register';

export type LoginStoreErrors = {
    account: string;
    password: string;
    result: string;
};

export default class LoginStore extends AbstractStore {
    static readonly NAME = 'loginStore';

    //private observed field
    @observable
    account: string;
    @observable
    password: string;
    @observable
    domain: string;
    @observable
    errors: LoginStoreErrors;
    @observable
    domains: UDomain[] = [];
    @observable
    logining: boolean = false;

    constructor(param: StoreCreateContext) {
        super(param);
        this.reset();
        makeObservable(this);
    }

    protected doStopObserver() {
        super.doStopObserver();
        this.reset();
    }

    @action
    reset() {
        this.account = '';
        this.password = '';
        this.domain = this.storeHolder.get(WorkspaceStore).loginDomain || DOMAIN_LOCAL;
        this.errors = {
            account: '',
            password: '',
            result: '',
        };
    }

    async login() {
        this.logining = true;
        let { account, password, domain } = this;
        return this.storeHolder
            .get(WorkspaceStore)
            .login(account, password, domain)
            .finally(() => {
                this.logining = false;
            });
    }

    async fetchDomain() {
        return new CoordinateMetainfoApi(buildApiConfiguration(this.storeHolder))
            .listDomain()
            .then((res) => {
                const domains: UDomain[] = [];
                res.forEach((domain) => domains.push(domain));
                this.domains = domains;
                return res;
            });
    }
}

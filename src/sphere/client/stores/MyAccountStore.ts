/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import {
    buildApiConfiguration,
    UUserOrganization,
    CoordinateOrganizationApi,
    CoordinateProfileApi,
} from '@onexas/sphere/client/api';
import {
    Email,
    GroupValidate,
    LengthValidate,
    ReuqiredNotStrict,
} from '@onexas/sphere/client/utils/validator';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { WorkspaceStore } from '.';
import AbstractStore from './AbstractStore';
import { StoreCreateContext } from './register';

export const displayNameValidate = new GroupValidate(
    ReuqiredNotStrict,
    new LengthValidate({ min: 2, max: 100 })
);

export const emailValidate = new GroupValidate(
    ReuqiredNotStrict,
    Email,
    new LengthValidate({ max: 256 })
);

export const passwordValidate = new GroupValidate(
    ReuqiredNotStrict,
    new LengthValidate({ min: 4, max: 30 })
);

type Errors = {
    displayName: string;
    email: string;
    phone: string;
    address: string;
    oldPassword: string;
    newPassword: string;
    newPasswordConfirmation: string;
};

export default class MyAccountStore extends AbstractStore {
    static readonly NAME = 'myAccountStore';

    @observable
    displayName: string;

    @observable
    email: string;

    @observable
    account: string;

    @observable
    domain: string;

    @observable
    oldPassword: string;

    @observable
    newPassword: string;

    @observable
    newPasswordConfirmation: string;

    @observable
    organizations: UUserOrganization[];

    @observable
    errors: Errors;

    @observable
    updatingProfile: boolean;
    @observable
    updatingPassword: boolean;

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
        this.displayName = '';
        this.email = '';
        this.account = '';
        this.domain = '';
        this.oldPassword = '';
        this.newPassword = '';
        this.newPasswordConfirmation = '';
        this.organizations = null;
        this.errors = {
            displayName: '',
            email: '',
            phone: '',
            address: '',
            oldPassword: '',
            newPassword: '',
            newPasswordConfirmation: '',
        };
    }

    async fetchProfile() {
        return new CoordinateProfileApi(buildApiConfiguration(this.storeHolder))
            .getProfile()
            .then((res) => {
                runInAction(() => {
                    this.displayName = res.displayName;
                    this.account = res.account;
                    this.domain = res.domain;
                    this.email = res.email ? res.email : '';
                });
                return res;
            });
    }

    async updateProfile() {
        this.updatingProfile = true;
        return new CoordinateProfileApi(buildApiConfiguration(this.storeHolder))
            .updateProfile({
                profile: {
                    displayName: this.displayName,
                    email: this.email,
                },
            })
            .then((res) => {
                runInAction(() => {
                    this.displayName = res.displayName;
                    this.account = res.account;
                    this.domain = res.domain;
                    this.email = res.email;
                    this.storeHolder.get(
                        WorkspaceStore
                    ).authentication.displayName = this.displayName;
                });
                return res;
            })
            .finally(() => {
                this.updatingProfile = false;
            });
    }

    async updatePassword() {
        this.updatingPassword = true;
        return new CoordinateProfileApi(buildApiConfiguration(this.storeHolder))
            .updatePassword({
                password: {
                    oldPassword: this.oldPassword,
                    newPassword: this.newPassword,
                },
            })
            .then((res) => {
                runInAction(() => {
                    this.oldPassword = '';
                    this.newPassword = '';
                    this.newPasswordConfirmation = '';
                });
                return res;
            })
            .finally(() => {
                this.updatingPassword = false;
            });
    }

    async fetchOrganizations() {
        return new CoordinateOrganizationApi(buildApiConfiguration(this.storeHolder))
            .listOrganization()
            .then((res) => {
                runInAction(() => {
                    this.organizations = [...res];
                });
                return res;
            });
    }
}

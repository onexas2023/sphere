/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import {
    buildApiConfiguration,
    OrganizationUserRelationType,
    Response,
    UOrganizationUserFilter,
    UOrganizationUserListPage,
    UOrganizationUserRelation,
    UUserOrganization,
    CoordinateOrganizationApi,
} from '@onexas/sphere/client/api';
import { DEFAULT_SKIPPABLE_DEFERRED } from '@onexas/sphere/client/constants';
import { AppError, SkippablePromiseQueue } from '@onexas/sphere/client/utils/app';
import { action, makeObservable, observable } from 'mobx';
import AbstractStore from './AbstractStore';
import { StoreCreateContext } from './register';

export default class AnOrganizationStore extends AbstractStore {
    static readonly NAME = 'anOrganizationStore';

    @observable
    code: string;

    @observable
    organization: UUserOrganization | 404 | 403;

    @observable
    members: UOrganizationUserListPage;

    private fetchMemberQueue: SkippablePromiseQueue;

    constructor(param: StoreCreateContext) {
        super(param);
        this.fetchMemberQueue = new SkippablePromiseQueue({
            timeout: DEFAULT_SKIPPABLE_DEFERRED,
            last: true,
        });
        this.reset();
        makeObservable(this);
    }

    protected doStopObserver() {
        super.doStopObserver();
        this.reset();
    }

    @action
    reset() {
        this.code = '';
        this.organization = null;
        this.members = null;
    }

    async fetchOrganization() {
        const code = this.code;
        return new CoordinateOrganizationApi(buildApiConfiguration(this.storeHolder))
            .getOrganization({
                code: code,
            })
            .then((res) => {
                if (this.code === code) {
                    this.organization = res;
                }
                return res;
            })
            .catch((err) => {
                if (err.status === 403 || err.status === 404) {
                    this.organization = err.status;
                    return this.organization;
                }
                throw err;
            });
    }

    async fetchMembers(filter?: UOrganizationUserFilter) {
        const code = this.code;
        return this.fetchMemberQueue.queue(() => {
            return new CoordinateOrganizationApi(buildApiConfiguration(this.storeHolder))
                .listOrganizationUser({
                    code,
                    filter,
                })
                .then((res) => {
                    if (this.code === code) {
                        this.members = res;
                    }
                    return res;
                });
        });
    }

    async updateMembers(members: {
        aliasUids: string[] | true;
        exceptAliasUid?: string;
        role: OrganizationUserRelationType;
    }): Promise<Response> {
        const { exceptAliasUid, role } = members;
        let { aliasUids } = members;
        const code = this.code;
        if (Array.isArray(aliasUids)) {
            if (exceptAliasUid) {
                aliasUids = aliasUids.filter((uid) => {
                    return uid !== exceptAliasUid;
                });
            }
            const roles: UOrganizationUserRelation[] = aliasUids.map((uid) => {
                return {
                    aliasUid: uid,
                    type: role,
                } as UOrganizationUserRelation;
            });
            return new CoordinateOrganizationApi(buildApiConfiguration(this.storeHolder))
                .addOrganizationUser({
                    code: code,
                    list: roles,
                })
                .then((res) => {
                    return res;
                });
        } else if (aliasUids === true) {
            return new CoordinateOrganizationApi(buildApiConfiguration(this.storeHolder))
                .listOrganizationUser({
                    code: code,
                })
                .then((res) => {
                    return this.updateMembers({
                        aliasUids: res.items.map((e) => e.aliasUid),
                        exceptAliasUid,
                        role,
                    });
                });
        }
        throw new AppError(`wrong arguments ${JSON.stringify(members)}`);
    }

    async removeMembers(members: {
        aliasUids: string[] | true;
        exceptAliasUid?: string;
    }): Promise<Response> {
        const { exceptAliasUid } = members;
        const code = this.code;
        let { aliasUids } = members;
        if (Array.isArray(aliasUids)) {
            if (exceptAliasUid) {
                aliasUids = aliasUids.filter((uid) => {
                    return uid !== exceptAliasUid;
                });
            }
            return new CoordinateOrganizationApi(buildApiConfiguration(this.storeHolder))
                .removeOrganizationUsers({
                    code: code,
                    list: aliasUids,
                })
                .then((res) => {
                    return res;
                });
        } else if (aliasUids === true) {
            return new CoordinateOrganizationApi(buildApiConfiguration(this.storeHolder))
                .listOrganizationUser({
                    code: code,
                })
                .then((res) => {
                    return this.removeMembers({
                        aliasUids: res.items.map((e) => e.aliasUid),
                        exceptAliasUid,
                    });
                });
        }
        throw new AppError(`wrong arguments ${JSON.stringify(members)}`);
    }

    async addMembers(members: {
        aliasUids: string[];
        role: OrganizationUserRelationType;
    }): Promise<Response> {
        const { aliasUids, role } = members;
        const code = this.code;
        return new CoordinateOrganizationApi(buildApiConfiguration(this.storeHolder))
            .addOrganizationUser({
                code: code,
                list: aliasUids.map((uid) => {
                    return {
                        aliasUid: uid,
                        type: role,
                    } as UOrganizationUserRelation;
                }),
            })
            .then((res) => {
                return res;
            });
    }
}

/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { Store, StoreHolder, StoreClass } from '@onexas/sphere/client/types';
import { AppError } from '@onexas/sphere/client/utils/app';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import { action, makeObservable, observable } from 'mobx';
import { typeOfString } from '@onexas/sphere/client/utils/object';

const logger = getLogger('store');

export default class StoreHolderImpl implements StoreHolder {
    @observable
    private storeMap: Map<string, Store> = new Map();

    constructor() {
        makeObservable(this);
    }

    @action
    put(name: string, store: Store): void {
        if (this.storeMap.has(name)) {
            logger.debug('Replace store ', name);
        } else {
            logger.debug('Put store ', name);
        }
        this.storeMap.set(name, store);
    }

    asProps(...names: string[]): any {
        const obj: any = {};
        const ns = !names ? null : new Set<string>(names);
        this.storeMap.forEach((v, k) => {
            if (!names || ns.has(k)) {
                obj[k] = v;
            }
        });
        return obj;
    }

    get<S extends Store>(name: string | StoreClass<S>): S {
        let n;
        if (typeOfString(name)) {
            n = name;
        } else {
            n = name.NAME;
        }

        const s = this.storeMap.get(n) as S;

        if (!s) {
            throw new AppError(`store ${name} not found`);
        }
        return s;
    }

    getIfAny<S extends Store>(name: string | StoreClass<S>): S {
        let n;
        if (typeOfString(name)) {
            n = name;
        } else {
            n = name.NAME;
        }

        const s = this.storeMap.get(n) as S;
        return s;
    }
}

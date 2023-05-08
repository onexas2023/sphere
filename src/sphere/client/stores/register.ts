/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { Config, Cookies, Depot, Store, StoreHolder } from '@onexas/sphere/client/types';
import StoreHolderImpl from './StoreHolderImpl';
import { History } from 'history';
import WorkspaceStore from './WorkspaceStore';
import { getLogger } from '@onexas/sphere/client/utils/logger';

const logger = getLogger('store');

export type StoreCreateContext = {
    config: Config;
    cookies: Cookies;
    localDepot: Depot;
    sessionDepot: Depot;
    storeHolder: StoreHolder;
    history: History;
    stopDefer?: number;
};

export interface StoreCreate {
    name: string;
    create(ctx: StoreCreateContext): Store;
}

export class StoreRegister {
    private creates: StoreCreate[] = new Array();

    register(create: StoreCreate) {
        logger.debug('Register store', create.name);
        this.creates.push(create);
    }
    create(param: {
        config: Config;
        cookies: Cookies;
        localDepot: Depot;
        sessionDepot: Depot;
        history: History;
    }): StoreHolder {
        const { config, cookies, localDepot, sessionDepot, history } = param;
        const storeHolder = new StoreHolderImpl();

        const ctx: StoreCreateContext = {
            config,
            cookies,
            localDepot,
            sessionDepot,
            storeHolder,
            history,
        };
        //init worksapce first
        this.creates.forEach((create) => {
            if (WorkspaceStore.NAME === create.name) {
                storeHolder.put(WorkspaceStore.NAME, create.create(ctx));
            }
        });

        //init another by proxy
        this.creates.forEach((create) => {
            if (WorkspaceStore.NAME !== create.name) {
                storeHolder.put(create.name, create.create(ctx));
            }
        });
        return storeHolder;
    }
}

/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { SESSION_DEPOT_NAME_MENU } from '@onexas/sphere/client/constants';
import { MenuGroup } from '@onexas/sphere/client/menus/menus';
import { Unregister } from '@onexas/sphere/client/types';
import { basex58 } from '@onexas/sphere/client/utils/basex';
import { getLogger } from '@onexas/sphere/client/utils/logger';
import { action, computed, makeObservable, observable } from 'mobx';
import AbstractStore from './AbstractStore';
import { StoreCreateContext } from './register';

const logger = getLogger('store.menu');

type MenuPrefs = {
    open: boolean;
    // width?: number;//TODO
};

export default class MenuStore extends AbstractStore {
    static readonly NAME = 'menuStore';

    @observable
    private _groups: MenuGroup[];

    @observable
    private _prefs: MenuPrefs = {
        open: false,
    };

    @observable
    animate: boolean;

    @observable
    scrolled: boolean;

    @computed
    get groups() {
        return [...this._groups];
    }
    set groups(groups: MenuGroup[]) {
        if (groups) {
            this._groups = [...groups];
        } else {
            this._groups = [];
        }
    }

    constructor(param: StoreCreateContext) {
        super(param);

        const text = this.sessionDepot.get(SESSION_DEPOT_NAME_MENU);
        if (text) {
            try {
                const obj = JSON.parse(basex58.decode(text).toString('utf8'));
                const pp = { ...this._prefs } as any;
                for (const p in pp) {
                    pp[p] = obj[p] ? obj[p] : pp[p];
                }
                this._prefs = pp;
            } catch (e) {
                logger.warn(e);
            }
        }

        this.reset();
        makeObservable(this);
    }

    protected doStartObserver() {
        super.doStartObserver();
    }

    protected doStopObserver() {
        super.doStopObserver();
        this.reset();
    }

    @action
    reset() {
        this._groups = [];
    }

    @computed
    get visible() {
        return this._groups && this._groups.some((g) => g.menus && g.menus.length > 0);
    }
    @computed
    get open() {
        return this._prefs.open;
    }
    set open(open: boolean) {
        this.updatePrefs({ ...this._prefs, open });
    }

    private updatePrefs(prefs: MenuPrefs) {
        this._prefs = prefs;
        this.sessionDepot.set(
            SESSION_DEPOT_NAME_MENU,
            basex58.encode(Buffer.from(JSON.stringify(prefs), 'utf8'))
        );
    }

    @computed
    get mergedGroups() {
        return mergeGroups(...this.groups);
    }

    clear() {
        this._groups = [];
    }

    push(...groups: MenuGroup[]): Unregister {
        this._groups = [...this._groups, ...groups];
        return () => {
            this._groups = this._groups.filter((c) => !groups.some((v) => c === v));
        };
    }

    pop(length = 1): MenuGroup[] {
        const l = this._groups.length;
        if (length <= 0) {
            return [];
        } else if (length >= l) {
            const r = [...this._groups];
            this._groups = [];
            return r;
        }

        const poped = this._groups.slice(l - length, length);
        this._groups = this._groups.slice(0, l - length);
        return poped;
    }

    getGroup(name: String) {
        const groups = this.getGroups(name);
        if (groups.length > 0) {
            return groups[0];
        }
        return null;
    }
    getGroups(name: String) {
        return this._groups.filter((g) => g.name === name);
    }

    refresh() {
        this._groups = [...this._groups];
    }
}

function sortGroup(g1: MenuGroup, g2: MenuGroup) {
    return g1.priority - g2.priority;
}

function mergeGroups(...groups: MenuGroup[]): MenuGroup[] {
    const map = new Map<string, MenuGroup>();
    groups.forEach((g) => {
        let merged = map.get(g.name);
        if (!merged) {
            map.set(g.name, (merged = new MenuGroup(g.name, g.label, g.priority)));
            merged.menus = [...g.menus];
        } else {
            if (g.priority > merged.priority) {
                //use the higher label
                merged.label = g.label;
                merged.priority = g.priority;
                merged.menus = [...g.menus, ...merged.menus];
            } else {
                merged.menus = [...merged.menus, ...g.menus];
            }
        }
    });
    return Array.from(map.values()).sort(sortGroup);
}

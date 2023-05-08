/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import {
    DynamicAction,
    DynamicBoolean,
    DynamicIcon,
    DynamicLabel,
    I18n,
    MenuFactory,
    StoreHolder,
    Unregister,
} from '@onexas/sphere/client/types';
import { uuid } from '@onexas/sphere/client/utils/uid';
import { computed, makeObservable, observable } from 'mobx';

export const MAIN_GROUP = 'main';
export const MAIN_PRIORITY = 100;

export class Menu {
    readonly name: string;

    readonly label: DynamicLabel;

    readonly action: DynamicAction;

    readonly IconComponent?: DynamicIcon;

    readonly visible: DynamicBoolean;

    constructor(
        name: string = uuid(),
        label: DynamicLabel,
        action: DynamicAction,
        IconComponent?: DynamicIcon,
        visible?: DynamicBoolean
    ) {
        this.name = name;
        this.label = label;
        this.action = action;
        this.IconComponent = IconComponent;
        this.visible = visible || true;
    }
}

export type DynamicMenu = Menu | ((storeHolder: StoreHolder, i18n: I18n) => Menu[]);

export class MenuGroup {
    readonly name: string;

    @observable
    private _label: DynamicLabel;

    @observable
    private _menus: DynamicMenu[];

    @observable
    private _priority: number;

    @computed
    get label() {
        return this._label;
    }
    set label(label: DynamicLabel) {
        this._label = label;
    }
    @computed
    get priority() {
        return this._priority;
    }
    set priority(priority: number) {
        this._priority = priority;
    }
    @computed
    get menus() {
        return [...this._menus];
    }
    set menus(menus: DynamicMenu[]) {
        if (menus) {
            this._menus = [...menus];
        } else {
            this._menus = [];
        }
    }

    constructor(name: string = MAIN_GROUP, label: DynamicLabel = '', priority = MAIN_PRIORITY) {
        this.name = name;
        this._label = label;
        this._menus = [];
        this._priority = priority;

        makeObservable(this);
    }

    clear() {
        this._menus = [];
    }

    push(...menus: DynamicMenu[]): Unregister {
        this._menus = [...this._menus, ...menus];
        return () => {
            this._menus = this._menus.filter((c) => !menus.some((v) => c === v));
        };
    }

    pop(length = 1): DynamicMenu[] {
        const l = this._menus.length;
        if (length <= 0) {
            return [];
        } else if (length >= l) {
            const r = [...this._menus];
            this._menus = [];
            return r;
        }

        const poped = this._menus.slice(l - length, length);
        this._menus = this._menus.slice(0, l - length);
        return poped;
    }
}

export interface MenuBuilder {
    (storeHolder: StoreHolder): MenuGroup[];
}

export class MenuRegister implements MenuFactory {
    private map = new Map<string, MenuBuilder[]>();

    register(name: string, ...builders: MenuBuilder[]) {
        let bs = this.map.get(name);
        if (!bs) {
            this.map.set(name, (bs = []));
        }
        bs.push(...builders);
    }

    get(name: string): MenuBuilder {
        return (storeHolder: StoreHolder) => {
            let bs = this.map.get(name);
            let mg: MenuGroup[] = [];
            if (bs) {
                bs.forEach((b) => {
                    mg.push(...b(storeHolder));
                });
            }
            return mg;
        };
    }
    build(name: string, storeHolder: StoreHolder) {
        return this.get(name)(storeHolder);
    }
}

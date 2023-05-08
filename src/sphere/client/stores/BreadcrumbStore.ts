/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { DynamicAction, DynamicLabel, Unregister } from '@onexas/sphere/client/types';
import { action, computed, makeObservable, observable } from 'mobx';
import AbstractStore from './AbstractStore';
import { StoreCreateContext } from './register';

export class Breadcrumb {
    @observable
    readonly label: DynamicLabel;

    @observable
    readonly action?: DynamicAction;

    constructor(label: DynamicLabel, action?: DynamicAction) {
        this.label = label;
        this.action = action;

        makeObservable(this);
    }
}

export default class BreadcrumbStore extends AbstractStore {
    static readonly NAME = 'breadcrumbStore';

    @observable
    private _crumbs: Breadcrumb[];

    constructor(param: StoreCreateContext) {
        super(param);
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
        this._crumbs = [];
    }

    @computed
    get crumbs() {
        return [...this._crumbs];
    }
    set crumbs(crumbs: Breadcrumb[]) {
        if (crumbs) {
            this._crumbs = [...crumbs];
        } else {
            this._crumbs = [];
        }
    }

    clear() {
        this._crumbs = [];
    }

    push(...crumbs: Breadcrumb[]): Unregister {
        this._crumbs = [...this._crumbs, ...crumbs];
        return () => {
            this._crumbs = this._crumbs.filter((c) => !crumbs.some((v) => c === v));
        };
    }

    pop(length = 1): Breadcrumb[] {
        const l = this._crumbs.length;
        if (length <= 0) {
            return [];
        } else if (length >= l) {
            const r = [...this._crumbs];
            this._crumbs = [];
            return r;
        }

        const poped = this._crumbs.slice(l - length, length);
        this._crumbs = this._crumbs.slice(0, l - length);
        return poped;
    }
}

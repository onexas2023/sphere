/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import {
    Config,
    Cookies,
    Store,
    StoreHolder,
    Unregister,
    StoreClass,
    Depot,
} from '@onexas/sphere/client/types';
import { StoreCreateContext } from './register';

export default abstract class AbstractStore implements Store {
    readonly config: Config;
    readonly cookies: Cookies;
    readonly localDepot: Depot;
    readonly sessionDepot: Depot;
    readonly storeHolder: StoreHolder;
    readonly stopDefer: number;

    private _observerCount = 0;

    private _timeouts: any[] = [];
    private _intervals: any[] = [];

    constructor(param: StoreCreateContext) {
        this.config = param.config;
        this.cookies = param.cookies;
        this.localDepot = param.localDepot;
        this.sessionDepot = param.sessionDepot;
        this.storeHolder = param.storeHolder;
        this.stopDefer = param.stopDefer || 100;
    }

    private clearTimer() {
        this._timeouts.forEach((t) => clearTimeout(t));
        this._timeouts = [];
        this._intervals.forEach((t) => clearInterval(t));
        this._intervals = [];
    }
    /**
     * Override this mothod to provide the lifecycle-time when any observer to this store
     * You should write call to safeTimeout or safeInterval here
     */
    protected doStartObserver() {}
    /**
     * Override this mothod to provide the lifecycle-time when no observer on this store
     * to clear unnecessary resource.
     * You don't need to clear timer of safeTimeout or safeInterval, they will be clear automaticated.
     */
    protected doStopObserver() {}

    protected safeTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): any {
        const timer = setTimeout(callback, ms, args);
        this._timeouts.push(timer);
        return timer;
    }
    protected clearSafeTimeout(timer: any) {
        const l = this._timeouts.length;
        this._timeouts = this._timeouts.filter((t) => t !== timer);
        if (l !== this._timeouts.length) {
            clearTimeout(timer);
        }
    }
    protected safeInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): any {
        const timer = setInterval(callback, ms, args);
        this._intervals.push(timer);
        return timer;
    }
    protected clearSafeInterval(timer: any) {
        const l = this._intervals.length;
        this._intervals = this._intervals.filter((t) => t !== timer);
        if (l !== this._intervals.length) {
            clearInterval(timer);
        }
    }

    /**
     * Register a observer hint, the store will start any auto-task when any one observer it.
     * Call unregister when you don't need it.
     * In general it is called by disposeOnUnmount(component, store.registerObserver()) in component's componentDidMount
     */
    registerObserver(): Unregister {
        if (this._observerCount === 0) {
            this.doStartObserver();
        }
        this._observerCount++;

        return () => {
            const f = () => {
                this._observerCount--;
                if (this._observerCount === 0) {
                    this.clearTimer();
                    this.doStopObserver();
                }
            };
            if (this.stopDefer >= 0) {
                setTimeout(f, this.stopDefer);
            } else {
                f();
            }
        };
    }

    protected getStore<S extends Store>(name: string | StoreClass<S>): S {
        return this.storeHolder.get(name);
    }
}

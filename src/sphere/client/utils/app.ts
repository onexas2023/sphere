/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { typeOfFunction, typeOfObjectNotNull } from '@onexas/sphere/client/utils/object';

export const ERR_IGNORABLE = -1000;
export const ERR_IGNORABLE_SKIP = ERR_IGNORABLE - 1;
export const ERR_IGNORABLE_UI_NOT_LIVE = ERR_IGNORABLE - 2;

export function isAppError(err: any) {
    return typeOfObjectNotNull(err) && 'code' in err && 'message' in err;
}

export class AppError {
    readonly code: number;
    readonly message: string;
    constructor(message: string, code: number = 0) {
        this.message = message;
        this.code = code;
    }
}

export interface PromiseProcess<T = any> {
    (): Promise<T>;
}
export function sequential<T>(...processes: PromiseProcess<T>[]): Promise<T> {
    return cancelableSequential(null, ...processes);
}

export function cancelableSequential<T>(
    canceler: () => boolean,
    ...processes: PromiseProcess<T>[]
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        try {
            if (!processes || processes.length === 0 || (canceler && canceler())) {
                resolve(null);
            }
            const [proc, ...rest] = processes;
            const promise = proc();

            promise
                .then((v) => {
                    if (!rest || rest.length === 0 || (canceler && canceler())) {
                        resolve(v);
                    } else {
                        return cancelableSequential(canceler, ...rest).then((v) => {
                            resolve(v);
                        });
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        } catch (err) {
            reject(err);
        }
    });
}

export function parallel<T>(...processes: PromiseProcess<T>[]): Promise<T[]> {
    const r: Promise<T>[] = [];
    processes.forEach((p) => {
        r.push(p());
    });
    return Promise.all<T>(r);
}

type SkippablePromiseQueueOption = {
    timeout?: number;
    last?: boolean;
};

type SkippablePromiseQueueElement<T> = {
    process: PromiseProcess<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    skippedValue: T;
};

export class SkippablePromiseQueue {
    private elements: SkippablePromiseQueueElement<any>[] = [];
    private opt: SkippablePromiseQueueOption;

    constructor(opt?: SkippablePromiseQueueOption) {
        this.opt = { ...opt };
    }

    queue<T>(process: PromiseProcess<T>, skippedValue?: T): Promise<T> {
        return this._queue<T>(process, skippedValue, this.opt.timeout);
    }

    private _queue<T>(process: PromiseProcess<T>, skippedValue?: T, timeout?: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.elements.push({
                process,
                resolve,
                reject,
                skippedValue,
            });

            if (this.elements.length === 1) {
                const e0 = this.elements[0];

                const exec = () => {
                    e0.process()
                        .then((r) => {
                            e0.resolve(r);
                        })
                        .catch((err) => {
                            e0.reject(err);
                        })
                        .finally(() => {
                            //comsume rest in queue
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const [first, ...rest] = this.elements;
                            const { last: runLast } = this.opt;
                            this.elements = [];

                            rest.forEach((e, i, arr) => {
                                if (runLast && i === arr.length - 1) {
                                    this._queue(e.process, e.skippedValue, 0)
                                        .then((r) => {
                                            e.resolve(r);
                                        })
                                        .catch((err) => {
                                            e.reject(err);
                                        });
                                } else if (e.skippedValue === undefined) {
                                    e.reject(
                                        new AppError('skip of skippable-queue', ERR_IGNORABLE_SKIP)
                                    );
                                } else {
                                    e.resolve(e.skippedValue);
                                }
                            });
                        });
                };

                if (timeout > 0) {
                    setTimeout(exec, timeout);
                } else {
                    exec();
                }
            }
        });
    }
}

export interface Equals<T> {
    (obj1: T, obj2: T): boolean;
}

//use array to simple implement it
export class EqualsSet<T> {
    private _innerImpl: T[];

    private _equals: Equals<T>;

    constructor(equals: Equals<T> | EqualsSet<T>) {
        this._innerImpl = [];
        if (typeOfFunction(equals)) {
            this._equals = equals;
        } else {
            this._equals = equals._equals;
            equals._innerImpl.forEach((v) => {
                this._innerImpl.push(v);
            });
        }
    }

    add(value: T) {
        if (!this._innerImpl.some((v) => this._equals(v, value))) {
            this._innerImpl.push(value);
        }
        return this;
    }
    clear(): void {
        this._innerImpl = [];
    }
    delete(value: T): boolean {
        const l = this._innerImpl.length;
        this._innerImpl = this._innerImpl.filter((v) => {
            return !this._equals(v, value);
        });
        return l !== this._innerImpl.length;
    }
    has(value: T): boolean {
        return this._innerImpl.some((v) => this._equals(v, value));
    }
    get size() {
        return this._innerImpl.length;
    }

    forEach(callbackfn: (value: T, size: number, set: EqualsSet<T>) => void, thisArg?: any): void {
        const wrap = (value: T, size: number, array: T[]) => {
            callbackfn(value, size, this);
        };
        this._innerImpl.forEach(wrap, thisArg);
    }

    toArray(): T[] {
        return [...this._innerImpl];
    }

    toSet(): Set<T> {
        return new Set<T>(this._innerImpl);
    }
}

/**
 * a simple util to return a promised value
 */
export async function promiseValue<T>(value: T) {
    return value;
}

export async function promiseFunction<T>(fn: () => T) {
    return fn();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function promiseVoid<Void>() {
    return promiseValue(null);
}

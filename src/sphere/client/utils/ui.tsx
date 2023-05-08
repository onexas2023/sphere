/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { fasCheckCircle } from '@onexas/sphere/client/icons';
import { fasExclamationCircle } from '@onexas/sphere/client/icons';
import { fasSpinner } from '@onexas/sphere/client/icons';
import { FontAwesomeIcon } from '@onexas/sphere/client/icons';
import { DEFAULT_PROGRESS_DEFERRED } from '@onexas/sphere/client/constants';
import { CssClasses } from '@onexas/sphere/client/styles';
import { hasWindow } from '@onexas/sphere/client/types';
import InputAdornment from '@mui/material/InputAdornment';
import nprogress from 'nprogress';
import React from 'react';
import { AppError, cancelableSequential, parallel, PromiseProcess } from './app';
import { uuid } from './uid';
import { setTimeout } from 'timers';

let progress = 0;

function normalizeId(obj: any) {
    const t = typeof obj;
    switch (t) {
        case 'number':
            return obj;
        case 'string':
            // "public/sourcemaps/public/vendors.main.js.map" > public_sourcemaps_public_vendors_main_js_map
            return obj.match(/[A-Za-z0-9]+/g).join('_');
        default:
            throw new AppError('Not Support Type: ' + t);
    }
}

export function loadStylesId(loadedCssModule: any) {
    return 'loadStyles_' + normalizeId(loadedCssModule[0][0]);
}

export function loadStyles(loadedCssModule: any) {
    if (hasWindow) {
        if (loadedCssModule.default) {
            loadedCssModule = loadedCssModule.default;
        }

        const id = loadStylesId(loadedCssModule);
        const loaded = document.querySelector('#' + id);
        if (!loaded) {
            var head = document.getElementsByTagName('head')[0];
            var s = document.createElement('style');
            s.setAttribute('type', 'text/css');
            s.setAttribute('id', id);
            s.appendChild(document.createTextNode(loadedCssModule[0][1]));
            head.appendChild(s);
        }
    }
}

loadStyles(require('nprogress/nprogress.css'));

export function isProgressing() {
    return hasWindow ? nprogress.isStarted() : false;
}

export function noSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
}

export function withProgress<T>(
    promise: Promise<T>,
    deferred = DEFAULT_PROGRESS_DEFERRED
): Promise<T> {
    return withSequentialProgress([() => promise], deferred);
}

export function withSequentialProgress<T>(
    processes: PromiseProcess<T>[],
    deferred = DEFAULT_PROGRESS_DEFERRED
): Promise<T> {
    return withCancelableSequentialProgress(null, processes, deferred);
}

export function withCancelableSequentialProgress<T>(
    cancaler: () => boolean,
    processes: PromiseProcess<T>[],
    deferred = DEFAULT_PROGRESS_DEFERRED
): Promise<T> {
    if (!hasWindow) {
        return cancelableSequential(cancaler, ...processes);
    }

    progress = progress <= 0 ? 1 : progress + 1;
    let timer: any;
    if (!nprogress.isStarted()) {
        timer = setTimeout(() => {
            timer = null;
            if (progress > 0) {
                nprogress.start();
            }
        }, deferred);
    }
    const done = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        progress = progress > 1 ? progress - 1 : 0;
        if (progress === 0) {
            nprogress.done();
        }
    };
    return cancelableSequential(cancaler, ...processes)
        .catch((e) => {
            done();
            throw e;
        })
        .then((t: T) => {
            done();
            return t;
        });
}

export function withParallelProgress<T>(
    processes: PromiseProcess<T>[],
    deferred = DEFAULT_PROGRESS_DEFERRED
): Promise<T[]> {
    if (!hasWindow) {
        return parallel(...processes);
    }

    progress = progress <= 0 ? 1 : progress + 1;
    let timer: any;
    if (!nprogress.isStarted()) {
        timer = setTimeout(() => {
            timer = null;
            if (progress > 0) {
                nprogress.start();
            }
        }, deferred);
    }
    const done = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        progress = progress > 1 ? progress - 1 : 0;
        if (progress === 0) {
            nprogress.done();
        }
    };
    return parallel(...processes)
        .catch((e) => {
            done();
            throw e;
        })
        .then((t: T[]) => {
            done();
            return t;
        });
}

function defaultErrorHandler(err: any) {
    throw err;
}

/**
 * a helper for a component
 */
export class Ally<P = any, S = any> {
    private _errorHandler: (err: any) => void;
    private _component: React.Component<P, S>;
    private _didMount = false;
    private _willUnmount = false;
    private _oDidMount: () => void;
    private _oWillUnmount: () => void;

    private _timeoutMap = new Map<number, any>();
    private _intervalMap = new Map<number, any>();
    private _continuousMap = new Map<number, any>();
    private _nextId = 1;

    private _initFetching: boolean = false;

    constructor(component: React.Component<P, S>, state?: S) {
        this._component = component;
        this._oDidMount = component.componentDidMount;
        this._oWillUnmount = component.componentWillUnmount;

        component.componentDidMount = this.componentDidMount;
        component.componentWillUnmount = this.componentWillUnmount;

        if (!component.state) {
            component.state = state ? state : ({} as S);
        } else if (state) {
            component.state = { ...component.state, ...state };
        }
        this._errorHandler = defaultErrorHandler;
    }

    private clearTimer() {
        this._timeoutMap.forEach((t) => clearTimeout(t));
        this._timeoutMap.clear();
        this._continuousMap.forEach((t) => clearTimeout(t));
        this._continuousMap.clear();
        this._intervalMap.forEach((t) => clearInterval(t));
        this._intervalMap.clear();
    }

    safeTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number {
        const id = this._nextId++;
        const timeoutWrap = (...args: any[]) => {
            if (!this.live) {
                return;
            }
            callback(args);
        };
        const timer = setTimeout(timeoutWrap, ms, args);
        this._timeoutMap.set(id, timer);
        return id;
    }
    clearSafeTimeout(id: number) {
        const timer = this._timeoutMap.get(id);
        if (timer) {
            clearTimeout(timer);
            this._timeoutMap.delete(id);
        }
    }
    safeInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): number {
        const id = this._nextId++;
        const intervalWrap = (...args: any[]) => {
            if (!this.live) {
                return;
            }
            callback(args);
        };
        const timer = setInterval(intervalWrap, ms, args);
        this._intervalMap.set(id, timer);
        return id;
    }
    clearSafeInterval(id: number) {
        const timer = this._intervalMap.get(id);
        if (timer) {
            clearInterval(timer);
            this._intervalMap.delete(id);
        }
    }
    /**
     * a interval like timeout, but unlike interval repeat a fixed time duration.
     * it trigger timeout again after the previous timeout call finished.
     */
    safeContinuous(callback: (...args: any[]) => Promise<any>, ms: number, ...args: any[]): number {
        const thix = this;
        const id = this._nextId++;

        const continuousWrap = (...args: any[]) => {
            if (!this.live) {
                return;
            }
            const p = callback(args);
            if (p) {
                p.finally(() => {
                    if (thix._continuousMap.has(id)) {
                        const timer = setTimeout(continuousWrap, ms, args);
                        thix._continuousMap.set(id, timer);
                    }
                });
            } else {
                throw 'bad implementation that return a null not a promise';
            }
        };

        const timer = setTimeout(continuousWrap, ms, args);
        this._continuousMap.set(id, timer);
        return id;
    }
    clearSafeContinuous(id: number) {
        const timer = this._continuousMap.get(id);
        if (timer) {
            clearTimeout(timer);
            this._continuousMap.delete(id);
        }
    }

    //use arrow for bind this
    componentDidMount = () => {
        this._didMount = true;
        if (this._oDidMount) {
            this._oDidMount.apply(this._component);
        }
    };
    //use arrow for bind this
    componentWillUnmount = () => {
        this.clearTimer();
        this._willUnmount = true;
        if (this._oWillUnmount) {
            this._oWillUnmount.apply(this._component);
        }
    };

    get live() {
        return this._didMount && !this._willUnmount;
    }

    get didMount() {
        return this._didMount;
    }

    get willUnmount() {
        return this._willUnmount;
    }

    get state(): S {
        return this._component.state;
    }
    set state(state: S) {
        if (this.live) {
            this._component.setState(state);
        }
    }

    initFetch<T>(initProcesses: () => PromiseProcess<T>[]) {
        if (this.live && !this._initFetching) {
            const ps = initProcesses();
            let hitErr = true;
            if (ps && ps.length > 0) {
                this._initFetching = true;
                this.withSequentialProgress(ps, (res) => {
                    hitErr = false;
                    return res;
                }).finally(() => {
                    if (!hitErr) {
                        //loop the init fetch until it stable (return ps is null or zero)
                        this._initFetching = false;
                        new Promise(() => {
                            this.initFetch(initProcesses);
                        });
                    }
                });
            }
        }
    }

    /**
     * @param then execute after promise, will not execute if live is false after promise
     */
    withProgress<T>(
        promise: Promise<T>,
        then = (res: T) => {
            return res;
        }
    ) {
        return withProgress(promise).then(then).catch(this._errorHandler);
    }

    /**
     * @param then execute after all processes, will not execute if live is false after promise
     */
    withSequentialProgress<T>(
        processes: PromiseProcess<T>[],
        then = (res: T) => {
            return res;
        }
    ) {
        const canceler = () => {
            return !this.live;
        };
        return withCancelableSequentialProgress(canceler, processes)
            .then(then)
            .catch(this._errorHandler);
    }

    /**
     * @param then execute after all processes, will not execute if live is false after promise
     */
    withParallelProgress<T>(
        processes: PromiseProcess<T>[],
        then = (res: T[]) => {
            return res;
        }
    ) {
        return withParallelProgress(processes).then(then).catch(this._errorHandler);
    }

    errorHandler(errorHandler: (err: any) => void) {
        this._errorHandler = errorHandler;
        return this;
    }
}

export type SizeProp =
    | 'xs'
    | 'lg'
    | 'sm'
    | '1x'
    | '2x'
    | '3x'
    | '4x'
    | '5x'
    | '6x'
    | '7x'
    | '8x'
    | '9x'
    | '10x';

export function CheckAvailableAdornment(props: {
    checking: boolean;
    available: boolean;
    classes: CssClasses;
    size?: SizeProp;
}) {
    let { checking, available, classes, size = 'lg' } = props;
    return (
        <InputAdornment position="end">
            {(() => {
                if (checking) {
                    return <FontAwesomeIcon icon={fasSpinner} spin={checking} size={size} />;
                }
                if (available === null) {
                    return (
                        <FontAwesomeIcon
                            icon={fasSpinner}
                            className={classes.statusUnknown}
                            size={size}
                        />
                    );
                } else if (available === true) {
                    return (
                        <FontAwesomeIcon
                            icon={fasCheckCircle}
                            className={classes.statusPassed}
                            size={size}
                        />
                    );
                } else {
                    return (
                        <FontAwesomeIcon
                            icon={fasExclamationCircle}
                            className={classes.statusError}
                            size={size}
                        />
                    );
                }
            })()}
        </InputAdornment>
    );
}

export function isWindowScrollOnBottom(accure?: number) {
    return (
        window.innerHeight + document.documentElement.scrollTop ===
        document.scrollingElement.scrollHeight - (accure ? accure : 0)
    );
}

export function isWindowHasVScroll() {
    return window.innerHeight < document.scrollingElement.scrollHeight;
}

const downloadUid = 'download-' + uuid();

export function downloadBlob(name: string, blob: Blob) {
    const uid = downloadUid + '-lob';
    let alink = window.document.getElementById(uid) as HTMLAnchorElement;
    if (!alink) {
        alink = document.createElement('a');
        alink.id = uid;
        alink.style.display = 'none';
        document.body.appendChild(alink);
    }
    let url = window.URL.createObjectURL(blob);
    alink.href = url;
    alink.download = name;
    alink.click();
    setTimeout(() => {
        window.URL.revokeObjectURL(url);
    }, 1000);
}

export function downloadUrl(name: string, url: string) {
    const uid = downloadUid + '-url';
    let alink = window.document.getElementById(uid) as HTMLAnchorElement;
    if (!alink) {
        alink = document.createElement('a');
        alink.id = uid;
        alink.style.display = 'none';
        alink.target = '_blank';
        document.body.appendChild(alink);
    }
    alink.href = url;
    alink.download = name;
    alink.click();
}

export function uploadProxy(callback: (uploaded: File, content: Uint8Array) => void) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
        const input = evt.target;
        if (input.files && input.files.length > 0) {
            const uploaded = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const buffer = reader.result as ArrayBuffer;
                callback(uploaded, new Uint8Array(buffer));
            };
            reader.readAsArrayBuffer(uploaded);

            //fix for trigger change for upload same file again.
            evt.target.value = '';
        }
    };
}

export function uploadProxyX(
    handleOnLoad: (file: File, content: Uint8Array, crunkIdx: number) => Promise<void>,
    onEof: (file: File) => void,
    option?: {
        onError?: (file: File, err: Error, crunkIdx: number) => void;
        onAbort?: (file: File, crunkIdx: number) => void;
        crunkSize?: number;
    }
) {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
        const input = evt.target;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            let crunkIdx = 0;
            let offset = 0;
            const { onError, onAbort, crunkSize = 1024 * 1024 } = option || {};

            const reader = new FileReader();

            reader.onload = () => {
                const buffer = reader.result as ArrayBuffer;
                offset += buffer.byteLength;
                handleOnLoad(file, new Uint8Array(buffer), crunkIdx++).then(() => {
                    continueReading();
                });
            };
            if (onError) {
                reader.onerror = () => {
                    onError(file, reader.error, crunkIdx);
                };
            }
            if (onAbort) {
                reader.onabort = () => {
                    onAbort(file, crunkIdx);
                };
            }

            const continueReading = () => {
                if (offset >= file.size) {
                    // the offset same as file size
                    onEof(file);
                    return;
                }
                var slice = file.slice(offset, offset + crunkSize);
                reader.readAsArrayBuffer(slice);
            };

            continueReading();

            //fix for trigger change for upload same file again.
            evt.target.value = '';
        }
    };
}

export function copyToClipboard(text: string) {
    const listener = (e: ClipboardEvent) => {
        e.clipboardData.setData('text/plain', text);
        e.preventDefault();
        document.removeEventListener('copy', listener);
    };
    window.document.addEventListener('copy', listener);
    window.document.execCommand('copy');
}

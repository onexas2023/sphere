/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { basex58 } from './basex';

export function uuid(): string {
    let d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        //use high-precision timer if available
        d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

export function uid(): string {
    return basex58.encode(Buffer.from(uuid(), 'utf8'));
}

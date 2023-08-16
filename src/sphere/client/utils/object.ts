/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

export function coerceToString(obj: any): string {
    if (isNullUndef(obj)) {
        return null;
    }
    switch (typeof obj) {
        case 'string':
            return obj;
        default:
            return obj.toString();
    }
}

export function coerceToNumber(obj: any): number {
    if (isNullUndef(obj)) {
        return null;
    }
    switch (typeof obj) {
        case 'number':
            return obj;
        case 'string':
            return parseFloat(obj);
        case 'boolean':
            return obj ? 1 : 0;
        default:
            return NaN;
    }
}

export function coerceToBoolean(obj: any): boolean {
    if (isNullUndef(obj)) {
        return null;
    }
    switch (typeof obj) {
        case 'boolean':
            return obj;
        case 'string':
            obj = obj.toLowerCase();
            return 'true' === obj || 'yes' === obj;
        case 'number':
            return obj === 0 ? false : true;
        default:
            return true;
    }
}

export function typeOfObject<T>(obj: T | number | string | boolean | Function | null): obj is T {
    return typeof obj === 'object' && !Array.isArray(obj);
}
export function typeOfObjectNotNull<T>(
    obj: T | number | string | boolean | Function | null
): obj is T {
    return typeOfObject(obj) && obj !== null;
}

export function typeOfString(obj: any): obj is string {
    return typeof obj === 'string';
}

export function typeOfNumber(obj: any): obj is number {
    return typeof obj === 'number';
}
export function typeOfNumberNotNaN(obj: any): obj is number {
    return typeof obj === 'number' && !isNaN(obj);
}

export function typeOfBoolean(obj: any): obj is boolean {
    return typeof obj === 'boolean';
}
export function typeOfBooleanTrue(obj: any): obj is boolean {
    return typeof obj === 'boolean' && obj;
}
export function typeOfBooleanFalse(obj: any): obj is boolean {
    return typeof obj === 'boolean' && !obj;
}

export function typeOfFunction(obj: any): obj is Function {
    return typeof obj === 'function';
}

export function isNullUndef(obj: any) {
    return obj === null || typeof obj === 'undefined';
}

export function isMap(obj: any): obj is Map<any, any> {
    return typeof obj === 'object' && obj instanceof Map;
}
export function isSet(obj: any): obj is Set<any> {
    return typeof obj === 'object' && obj instanceof Set;
}
export function isArray(obj: any): obj is Array<any> {
    return Array.isArray(obj);
}

//not a value for a empty string confuse react component workaround
export const NaV = '!!!NaV!!!';

export function notNaV(value: any) {
    return value && value !== NaV;
}
export function isNaV(value: any) {
    return !value || value === NaV;
}
export function trim(value: any, defval = '') {
    if (value !== NaV && typeof value === 'string') {
        return value.trim();
    }
    return defval;
}

export function mergeDeep<T>(target: Partial<T>, ...sources: Partial<T>[]): T {
    if (!sources.length) return target as T;
    const source = sources.shift();

    if (typeOfObject(target) && typeOfObject(source)) {
        for (const key in source) {
            if (typeOfObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    mergeDeep(target, ...sources);
    return target as T;
}

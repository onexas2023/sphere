/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable no-undef  */
import {
    coerceToBoolean,
    coerceToNumber,
    coerceToString,
    mergeDeep,
} from '@onexas/sphere/client/utils/object';

describe('utils/object test', () => {
    it('test coerceToBoolean ', () => {
        expect(coerceToBoolean(null)).toBeNull();
        expect(coerceToBoolean(true)).toBeTruthy();
        expect(coerceToBoolean('true')).toBeTruthy();
        expect(coerceToBoolean('yes')).toBeTruthy();
        expect(coerceToBoolean(1)).toBeTruthy();
        expect(coerceToBoolean(0)).toBeFalsy();
    });
    it('test coerceToNumber ', () => {
        expect(coerceToNumber(null)).toBeNull();
        expect(coerceToNumber(123)).toBe(123);
        expect(coerceToNumber('123')).toBe(123);
        expect(coerceToNumber(true)).toBe(1);
        expect(coerceToNumber(false)).toBe(0);
        expect(coerceToNumber([123])).toBeNaN();
    });
    it('test coerceToString ', () => {
        expect(coerceToString(null)).toBeNull();
        expect(coerceToString('123')).toBe('123');
        expect(coerceToString(123)).toBe('123');
        expect(coerceToString(true)).toBe('true');
        expect(coerceToString([123, 456])).toBe('123,456');
    });

    it('test snapshot ', () => {
        expect(coerceToString('124')).toMatchSnapshot();
    });

    it('test mregeDeep ', () => {
        const a = { name: 'dennis', address: { street: 'main' } };
        const b = { age: 24 };
        const c = mergeDeep({}, a, b);
        const d = mergeDeep(a, b);

        expect(c.name === 'dennis').toBeTruthy();
        expect(c.age === 24).toBeTruthy();
        expect(c.address.street === 'main').toBeTruthy();

        expect(d.name === 'dennis').toBeTruthy();
        expect(d.age === 24).toBeTruthy();
        expect(d.address.street === 'main').toBeTruthy();
        expect(d === a).toBeTruthy();
    });
});

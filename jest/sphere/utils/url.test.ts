/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

/* eslint-disable @typescript-eslint/no-unused-vars  */
/* eslint-disable no-undef  */
import { parseSearch } from '@onexas/sphere/client/utils/url';

describe('utils/url test', () => {
    it('test parseQuery get ', () => {
        const q = parseSearch('?backurl=/projects/1234&aaaa=bbbb');
        expect(q.get('backurl')).toBe('/projects/1234');
        expect(q.get('aaaa')).toBe('bbbb');
        expect(q.get('cccc')).toBeUndefined;
    });
    it('test queryString is empty', () => {
        const q = parseSearch('');
        expect(q.get('backurl')).toBeUndefined;
    });
});

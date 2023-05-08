/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

export const PATH_LOGIN = '/login';
export const PATH_MY_ACCOUNT = '/myaccount';
export const PATH_AN_ORGANIZATION = '/org/:organizationCode';

export function buildPath(
    path: string = '',
    params: any = {},
    queryString?: string,
    hashString?: string
) {
    for (const p in params) {
        let pp = params[p];
        if (typeof pp === 'string' || typeof pp === 'number') {
            path = path.replace(`:${p}`, encodeURIComponent(pp));
        }
    }
    if (queryString) {
        path = path + (path.indexOf('?') < 0 ? '?' : '&') + queryString;
    }
    if (hashString) {
        path = path + (hashString.indexOf('#') === 0 ? '' : '#') + hashString;
    }
    return path;
}

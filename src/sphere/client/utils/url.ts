/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

export function parseSearch(urlSearch: string) {
    const m = new Map();
    var pairs = (urlSearch[0] === '?' ? urlSearch.substr(1) : urlSearch).split('&');
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        m.set(pair[0], pair[1] || '');
    }
    return m;
}

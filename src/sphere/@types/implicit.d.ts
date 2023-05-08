/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

/* eslint-disable no-undef  */
declare const __ENV: string;
declare const __FETCH_API: Function;

/**
 * for coordinate-api-sdk after upgrade to typescript 3.9
 */
declare interface GlobalFetch {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import base from 'base-x';
/**
 * WARNING:
 * base-x is NOT RFC3548 compliant, it cannot be used for base16 (hex), base32, or base64 encoding in a standards compliant manner.
 * use only for encode/decode by same encoder/decoder
 */
const BASEX58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const basex58 = base(BASEX58);
export function encodeBasex58(value: string) {
    return basex58.encode(Buffer.from(value, 'utf8'));
}
export function decodeBasex58(value: string) {
    return basex58.decode(value).toString('utf8');
}

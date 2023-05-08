/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

const digitalDegrees = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
export const DIGITAL_DEGREE_0 = 0;
export const DIGITAL_DEGREE_K = 1;
export const DIGITAL_DEGREE_M = 2;
export const DIGITAL_DEGREE_G = 3;
export const DIGITAL_DEGREE_T = 4;
export const DIGITAL_DEGREE_P = 5;
export const DIGITAL_DEGREE_E = 6;
export const DIGITAL_DEGREE =
    DIGITAL_DEGREE_0 |
    DIGITAL_DEGREE_K |
    DIGITAL_DEGREE_M |
    DIGITAL_DEGREE_G |
    DIGITAL_DEGREE_T |
    DIGITAL_DEGREE_P |
    DIGITAL_DEGREE_E;
export function getShortDigitalString(
    value: number,
    unit: string = '',
    startDegree: typeof DIGITAL_DEGREE = DIGITAL_DEGREE_0,
    endDegree: typeof DIGITAL_DEGREE = DIGITAL_DEGREE_E,
    radix: number = 1024,
    radixIndicate: string = 'i',
    format: Intl.NumberFormat = new Intl.NumberFormat('en-us', { maximumFractionDigits: 2 })
) {
    let v = value;
    let degree = startDegree;
    while (v >= radix && degree < endDegree && degree < digitalDegrees.length - 1) {
        v = v / radix;
        degree++;
    }
    return (
        format.format(v) +
        (digitalDegrees[degree] ? ' ' + digitalDegrees[degree] : '') +
        (degree > 0 ? radixIndicate : '') +
        unit
    );
}
export function toNumberArray(text: string): number[] {
    let unitCodeText = unescape(encodeURIComponent(this.text));
    let arr: number[] = [];
    for (var i = 0; i < unitCodeText.length; i++) {
        arr.push(unitCodeText.charCodeAt(i));
    }
    return arr;
}
export function fromNumberArray(arr: number[]): string {
    let unitCodeText = String.fromCharCode.apply(null, arr);
    let text = decodeURIComponent(escape(unitCodeText));
    return text;
}

const numUnitRegx = /^([0-9]+)([a-zA-Z]*)$/;
export function coercePrefixNumer(text: string) {
    if (!text || !numUnitRegx.test(text)) {
        return undefined;
    }

    const arr = numUnitRegx.exec(text);
    if (arr && arr.length === 3) {
        let num = parseInt(arr[1]);
        const unit = arr[2];
        switch (unit) {
            case 'Ei':
                num *= 1024;
            // fallsthrough
            case 'Pi':
                num *= 1024;
            // fallsthrough
            case 'Ti':
                num *= 1024;
            // fallsthrough
            case 'Gi':
                num *= 1024;
            // fallsthrough
            case 'Mi':
                num *= 1024;
            // fallsthrough
            case 'Ki':
                num *= 1024;
                break;
            case 'E':
                num *= 1000;
            // fallsthrough
            case 'P':
                num *= 1000;
            // fallsthrough
            case 'T':
                num *= 1000;
            // fallsthrough
            case 'G':
                num *= 1000;
            // fallsthrough
            case 'M':
                num *= 1000;
            // fallsthrough
            case 'K':
                num *= 1000;
                break;
            case '':
                break;
            default:
                return undefined;
        }
        return num;
    }
    return undefined;
}

export function coercePrefixMi(text: string) {
    if (!text || !numUnitRegx.test(text)) {
        return undefined;
    }

    const arr = numUnitRegx.exec(text);
    if (arr && arr.length === 3) {
        let num = parseInt(arr[1]);
        const unit = arr[2];
        switch (unit) {
            case 'Ei':
                num *= 1024;
            // fallsthrough
            case 'Pi':
                num *= 1024;
            // fallsthrough
            case 'Ti':
                num *= 1024;
            // fallsthrough
            case 'Gi':
                num *= 1024;
            // fallsthrough
            case 'Mi':
                break;
            case '':
                break;
            default:
                return undefined;
        }
        return num;
    }
    return undefined;
}

export function coercePrefixMinute(text: string) {
    if (!text || !numUnitRegx.test(text)) {
        return undefined;
    }

    const arr = numUnitRegx.exec(text);
    if (arr && arr.length === 3) {
        let num = parseInt(arr[1]);
        const unit = arr[2];
        switch (unit) {
            case 'd':
                num *= 24;
            // fallsthrough
            case 'h':
                num *= 60;
            // fallsthrough
            case 'm':
            case '':
                break;
            default:
                return undefined;
        }
        return num;
    }
    return undefined;
}

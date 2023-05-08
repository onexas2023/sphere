/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { I18n } from '@onexas/sphere/client/types';

// import theMoment from 'moment/moment';
import theMoment from 'moment-timezone';
import { isNullUndef } from './object';

//GMT+08:00,GMT+08,GMT+8
const javaGMTRegx = /^gmt[+-][0-1]?[\d]:?[\d]?[\d]?$/i;
//cache
const normalizedMap = new Map<string, string>();
export function normalizeToMomentTimezone(timezone: string) {
    let norminized = timezone;
    if (timezone) {
        if (normalizedMap.has(timezone)) {
            return normalizedMap.get(timezone);
        } else if (javaGMTRegx.test(timezone)) {
            //transfer javaGTM to moment Etc/GMT
            //[+/-] in etc/gmt definitation is reversed
            let t = ['Etc/GMT', timezone.charAt(3) === '+' ? '-' : '+']; //Etc/GMT[+-]
            let idx = timezone.indexOf(':');
            t.push(parseInt(timezone.substring(4, idx < 0 ? timezone.length : idx)).toString());
            norminized = t.join('');
        }
        normalizedMap.set(timezone, norminized);
    }
    return norminized;
}

const envTimezoneNames = theMoment.tz.names();
//possible null
const envTimezoneName = theMoment.tz.guess();
const envTimezone = theMoment.tz.zone;

export { envTimezoneNames, envTimezoneName, envTimezone };

export function moment(timestamp?: number, timezone?: string, i18n?: I18n) {
    if (isNullUndef(timestamp)) {
        timestamp = new Date().getTime();
    }

    let mm = theMoment(timestamp);
    if (timezone) {
        mm = mm.tz(normalizeToMomentTimezone(timezone)) || mm;
    } else if (envTimezoneName) {
        mm = mm.tz(normalizeToMomentTimezone(envTimezoneName)) || mm;
    }
    if (i18n) {
        mm = mm.locale(momentLocale(i18n)) || mm;
    }
    return mm;
}

export function momentFromString(str: string, format: string, timezone?: string, i18n?: I18n) {
    let mm = theMoment(str, format);
    if (timezone) {
        mm = mm.tz(normalizeToMomentTimezone(timezone));
    } else {
        mm = mm.tz(normalizeToMomentTimezone(envTimezoneName));
    }
    if (i18n) {
        mm = mm.locale(momentLocale(i18n));
    }
    return mm;
}

function momentLocale(i18n: I18n) {
    return i18n.locale.toLowerCase();
}

export function sameDate(timestamp1: number, timestamp2: number, timezone?: string) {
    return moment(timestamp1, timezone).isSame(timestamp2, 'date');
}

export function fromNow(
    timestamp: number,
    preferredTimeFormat = 'LT',
    preferredDateFormat = 'll',
    timezone?: string,
    i18n?: I18n
) {
    const now = new Date().getTime();

    const diff = now - timestamp;
    const seconds = Math.ceil(diff / 1000);

    let str = i18n ? i18n.l('time.ago') : 'ago';

    if (seconds < 0) {
        return 0 + ' ' + (i18n ? i18n.l('time.seconds') : 'seconds') + ' ' + str;
    }
    if (seconds <= 3600) {
        //in hours
        const s = seconds % 60;
        const m = Math.floor(seconds / 60);
        if (s > 0) {
            str = s + ' ' + (i18n ? i18n.l('time.seconds') : 'seconds') + ' ' + str;
        }
        if (m > 0) {
            str = m + ' ' + (i18n ? i18n.l('time.minutes') : 'minutes') + ' ' + str;
        }
        return str;
    } else if (sameDate(now, timestamp, timezone)) {
        //in day
        return moment(timestamp, timezone, i18n).format(preferredTimeFormat);
    } else {
        return moment(timestamp, timezone, i18n).format(
            preferredDateFormat + ' ' + preferredTimeFormat
        );
    }
}

const noDigitalNumberFormat = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
});

export function humanTimeAmount(timeAmount: number, i18n: I18n, zeroPadding?: boolean) {
    let t = Math.floor(timeAmount / 1000);
    let seconds = t % 60;
    t = Math.floor(t / 60);
    let minutes = t % 60;
    t = Math.floor(t / 60);
    let hours = t;

    let arr: any[] = [];
    if (hours > 0) {
        arr.push(noDigitalNumberFormat.format(hours));
        arr.push(i18n.l('time.hours'));
    }
    if (minutes > 0) {
        if (arr.length > 0) {
            arr.push(' ');
        }
        if (zeroPadding && minutes <= 9) {
            arr.push('0');
        }
        arr.push(minutes);
        arr.push(i18n.l('time.minutes'));
    }
    if (seconds > 0 || arr.length === 0) {
        if (arr.length > 0) {
            arr.push(' ');
        }
        if (zeroPadding && seconds <= 9) {
            arr.push('0');
        }
        arr.push(seconds);
        arr.push(i18n.l('time.seconds'));
    }

    return arr.join('');
}

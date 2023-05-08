/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { RouteEntry } from '@onexas/sphere/client/types';
import { getLogger } from '@onexas/sphere/client/utils/logger';

const logger = getLogger('route');

export class RouteRegister {
    private entries: RouteEntry[] = [];
    register(entry: RouteEntry) {
        this.entries.push(entry);
        logger.debug('Register route ', entry.path, entry.exact, entry.strict);
    }
    getEntries() {
        return [...this.entries];
    }
}

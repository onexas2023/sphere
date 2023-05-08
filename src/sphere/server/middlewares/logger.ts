/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import express from 'express';
import { getLogger, DEBUG } from '@onexas/sphere/client/utils/logger';

const logger = getLogger('express');

export function loggerMiddleware(req: express.Request, res: express.Response, next: any) {
    const start = Date.now();
    next();
    const ms = Date.now() - start;
    if (logger.level <= DEBUG) {
        logger.debug(`${req.method} ${req.originalUrl} - ${ms}ms`);
    }
}

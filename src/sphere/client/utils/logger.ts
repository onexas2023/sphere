/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

import { Config } from '@onexas/sphere/client/types';

export const DEBUG = 0;
export const INFO = 1;
export const WARN = 2;
export const ERROR = 3;

let defaultConfig: Config;

interface LogConfig {
    name: string;
    match: string;
    level: number;
}

const readLogConfig = function (name: string = '', config?: Config): LogConfig {
    const logConfig = {
        name,
        match: name,
        level: INFO,
    };
    if (config) {
        name = name.trim().toLowerCase();
        /*eslint no-constant-condition: "off"*/
        search: while (true) {
            const attr = 'logger.level' + (name ? '.' : '') + name;
            const level = config.get(attr);
            if (level) {
                switch (level.toUpperCase()) {
                    case 'DEBUG':
                        logConfig.level = DEBUG;
                        break search;
                    case 'INFO':
                        logConfig.level = INFO;
                        break search;
                    case 'WARN':
                    case 'WARNING':
                        logConfig.level = WARN;
                        break search;
                    case 'ERROR':
                        logConfig.level = ERROR;
                        break search;
                }
            }
            if (name === '') {
                break;
            }

            const i = name.lastIndexOf('.');
            name = i > -1 ? name.substring(0, i) : '';
        }
        logConfig.match = name;
    }
    return logConfig;
};

export class Logger {
    level: number = INFO;
    name: string;

    constructor(name: string, level: number = INFO) {
        this.name = name;
        this.level = level;
    }

    debug(...args: any[]) {
        if (this.level <= DEBUG && console.log) {
            console.debug(`[${this.name}]`, ...args);
        }
    }
    info(...args: any[]) {
        if (this.level <= INFO && console.log) {
            console.log(`[${this.name}]`, ...args);
        }
    }
    warn(...args: any[]) {
        if (this.level <= WARN && console.warn) {
            console.warn(`[${this.name}]`, ...args);
        }
    }
    error(...args: any[]) {
        if (this.level <= ERROR && console.error) {
            console.error(`[${this.name}]`, ...args);
        }
    }
}

const loggerMap: Map<string, Logger> = new Map();

export function setConfig(config: Config, force?: boolean) {
    if (!defaultConfig || (force && defaultConfig !== config)) {
        defaultConfig = config;
        loggerMap.forEach((logger, name) => {
            const logConfig = readLogConfig(name, defaultConfig);
            logger.level = logConfig.level;
        });
    }
}

export function getLogger(name: string = ''): Logger {
    let logger = loggerMap.get(name);
    if (!logger) {
        const logConfig = readLogConfig(name, defaultConfig);
        loggerMap.set(name, (logger = new Logger(name, logConfig.level)));
    }
    return logger;
}
export function getShorttermLogger(name: string = ''): Logger {
    let logger = loggerMap.get(name);
    if (!logger) {
        const logConfig = readLogConfig(name, defaultConfig);
        logger = new Logger(name, logConfig.level);
    }
    return logger;
}

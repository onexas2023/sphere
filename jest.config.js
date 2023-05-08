'use strict';
/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 
const { readFileSync } = require('fs');
const JSON5 = require('json5');

//map paht to moudle name in jest
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = JSON5.parse(readFileSync('./tsconfig.json','utf8'))
const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' });

const { xpackages } = require('./include');

module.exports = {
    roots: xpackages.map((m) => {
        return '<rootDir>/jest/' + m;
    }),
    moduleNameMapper: moduleNameMapper,
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
        ...xpackages.map((m) => {
            return 'src/' + m + '/**/*.(ts|tsx)';
        }),
        ...xpackages.map((m) => {
            return '!src/' + m + '/**/*.d.ts';
        }),
    ],
    coverageDirectory: 'build/test/coverage',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>tsconfig.json',
        },
    },
    testMatch: ['**/*.test.(ts|tsx)'],
    snapshotSerializers: ['enzyme-to-json/serializer'],
    setupFilesAfterEnv: ['<rootDir>jest/setup-jest.ts'],
    /**
     * TODO supoort transforming resolves .ts not work
     * https://github.com/facebook/jest/issues/8330
     * */
    snapshotResolver: '<rootDir>jest/snapshot-resolver.js',
};

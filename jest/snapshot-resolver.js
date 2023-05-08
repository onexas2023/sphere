/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

const path = require('path');
const rootDir = path.resolve(__dirname, '..');
const jestDir = path.resolve(rootDir, 'jest');
const snapshotsDir = path.join(jestDir, '__snapshots__');

// https://github.com/facebook/jest/blob/master/docs/Configuration.md#snapshotresolver-string
module.exports = {
    resolveSnapshotPath: (testPath, snapshotExtension) => {
        const result = testPath.replace(jestDir, snapshotsDir) + snapshotExtension;
        return result;
    },
    resolveTestPath: (snapshotFilePath, snapshotExtension) => {
        const result = snapshotFilePath
            .replace(snapshotsDir, jestDir)
            .slice(0, -snapshotExtension.length);
        return result;
    },
    // Example test path, used for preflight consistency check of the implementation above
    // JestConsistencyCheck.test.tsx is not exist file
    // only for check resolver snapshot path, do not remove the line
    testPathForConsistencyCheck: path.resolve(jestDir, 'JestConsistencyCheck.test.tsx'),
};

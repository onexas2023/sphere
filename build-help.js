'use strict';
/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 


const { resolve, basename } = require('path');
const argv = require('yargs').argv;
const fs = require('fs-extra');

const { xpackages, xpackage } = require('./include');

const bundleDir = resolve('bundle');
const buildDir = resolve('build');

const clean = argv['clean'];
const copyBundleRes = argv['copy-bundle-res'];
const copyBuildRes = argv['copy-build-res'];

// clean build folder
if (clean) {
    fs.removeSync(bundleDir);
    fs.removeSync(buildDir);
}

// copy build resources
if (copyBuildRes) {
    const pkgJsonContent = require(resolve('package.json'));

    let regx = /.*(\.d\.ts|(?<!\.ts|\.tsx))$/;
    xpackages.forEach((m) => {
        const moduleBuildDir = resolve(buildDir, m);
        copyFolder(resolve('src', m), moduleBuildDir, (src, dest) => {
            return regx.test(src);
        });
        copyFolder(resolve('resources', m), moduleBuildDir, (src, dest) => {
            return regx.test(src);
        });

        //handle package.json
        //copy dependency

        const buildPkgJson = resolve(moduleBuildDir, 'package.json');
        const buildPkgJsonContent = require(buildPkgJson);
        if (!buildPkgJsonContent.dependencies) {
            buildPkgJsonContent.dependencies = {};
        }
       
        for(let p in buildPkgJsonContent.dependencies){
            if(buildPkgJsonContent.dependencies[p]==='*' && pkgJsonContent.dependencies[p]){
                buildPkgJsonContent.dependencies[p] = pkgJsonContent.dependencies[p];
            }
        }

        fs.writeFileSync(buildPkgJson, JSON.stringify(buildPkgJsonContent, null, '    '));
    });

    removeEmptyDir(buildDir);
}

// copy bundle resources
if (copyBundleRes) {
    let f;
    if (fs.existsSync((f = resolve('resources', xpackage, 'public')))) {
        copyFolder(f, resolve(bundleDir, 'public'));
    }

    copyFile('server.env', bundleDir);
    copyFile('client.env', bundleDir);

    if (fs.existsSync((f = 'local.server.env'))) {
        copyFile(f, bundleDir, 'server.env');
    }
    if (fs.existsSync((f = 'local.client.env'))) {
        copyFile(f, bundleDir, 'client.env');
    }
}

function copyFile(file, destFolder, newName) {
    fs.copySync(file, resolve(destFolder, newName ? newName : basename(file)));
}

function copyFolder(folder, destFolder, filter) {
    fs.copySync(folder, destFolder, { filter });
}

function removeEmptyDir(folder) {
    let folders = [folder];
    let allfolders = [];
    while (folders.length > 0) {
        folder = folders.pop();
        allfolders.push(folder);
        fs.readdirSync(folder).forEach((e) => {
            e = resolve(folder, e);
            let lstat = fs.lstatSync(e);
            if (lstat.isDirectory()) {
                folders.push(e);
            }
        });
    }
    allfolders = allfolders.reverse();
    allfolders.forEach((e) => {
        if (fs.readdirSync(e).length === 0) {
            fs.removeSync(e);
        }
    });
}

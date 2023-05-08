'use strict';
/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

const argv = require('yargs').argv;

const xpackages = ['sphere'];

// --xpackage sphere
let xpackage = argv['xpackage'];
xpackage = xpackage && xpackage !== true ? xpackage : xpackages[0];
if (xpackage && !xpackages.some((p) => p === xpackage)) {
    const err = 'Allowed xpackages ' + xpackages + ', but get ' + xpackage;
    console.error(err);
    throw err;
}
console.info('Available xpackages -- ', xpackages);
console.info('Use xpackage -- ', xpackage);

module.exports = {
    xpackages: xpackages,
    xpackage: xpackage
};

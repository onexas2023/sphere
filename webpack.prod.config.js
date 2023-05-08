'use strict';
/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

const commonConfig = require('./webpack.common.config');
const merge = require('webpack-merge');

const maxChunkSize = 512000; //~512K
const maxEntrypointHintSize = 1024000; //~1M
const maxAssetHintSize = 512000; //~512K
const mode = 'production';

const clientConfig = merge(commonConfig.clientConfig, {
    mode,
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'all',
            minSize: maxChunkSize,
            maxSize: maxChunkSize,
            automaticNameDelimiter: '.',
            hidePathInfo: true,
            cacheGroups: {
                babel: {
                    test: /[\\/]node_modules[\\/]@babel[\\/]?/,
                    enforce: true,
                    name: 'vendors-babel',
                    priority: 50,
                },
                moment: {
                    test: /[\\/]node_modules[\\/](.*moment-timezone.*|moment)/,
                    enforce: true,
                    name: 'vendors-moment',
                    priority: 40,
                },
                fortawesome: {
                    test: /[\\/]node_modules[\\/]@fortawesome[\\/]?/,
                    enforce: true,
                    name: 'vendors-fortawesome',
                    priority: 40,
                },
                xterm: {
                    test: /[\\/]node_modules[\\/](xterm-addon-.*|xterm)/,
                    enforce: true,
                    name: 'loadable-verdors-xterm',
                    priority: 40
                },                
                mui: {
                    test: /[\\/]node_modules[\\/]@mui[\\/]?/,
                    enforce: true,
                    name: 'vendors-mui',
                    priority: 30,
                },
                react: {
                    test: /[\\/]node_modules[\\/].*react.*/,
                    enforce: true,
                    name: 'vendors-react',
                    priority: 20,
                },
                onexas: {
                    test: commonConfig.OneXasSDKTest,
                    enforce: true,
                    name: 'vendors-onexas',
                    priority: 20,
                },
                other: {
                    test: commonConfig.OneXasNotTest,
                    enforce: true,
                    name: 'vendors-other',
                    priority: 10,
                },
                default: false,
            },
        },
    },
    //set the hint thread hold (default is 244k which is too small in our product)
    //don't set the hint off, to avoid we produce a large js app
    performance: {
        maxEntrypointSize: maxEntrypointHintSize,
        maxAssetSize: maxAssetHintSize,
    },
});

const serverConfig = merge(commonConfig.serverConfig, {
    mode,
    optimization: {
        minimize: true,
    },
});

module.exports = [clientConfig, serverConfig];

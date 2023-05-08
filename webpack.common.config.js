'use strict';
/*
 * @file-created: 2023-03-22
 * @copyright 2023 - 2023, OneXas
 * @author: Dennis Chen
 */ 

const { resolve } = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ManifestPlugin = require('webpack-manifest-plugin');
const { ReactLoadablePlugin } = require('@onexas/react-loadable/webpackext');
const DotenvPlugin = require('dotenv-webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');
const { xpackage } = require('./include');

const bundleDir = resolve('bundle');

// const currentYear = new Date().getFullYear();

const clientConfig = {
    entry: {
        'client-main': [
            '@babel/polyfill',
            //https://github.com/zloirock/core-js#missing-polyfills
            'whatwg-fetch',
            resolve('src', xpackage, 'client', 'index.ts'),
        ],
    },
    output: {
        filename: 'public/[name].[contenthash].js',
        path: resolve(bundleDir),
        publicPath: '/',
    },
    target: 'web',
    devtool: false,
    plugins: [
        new webpack.optimize.AggressiveMergingPlugin(),
        // Webpack plugin for generating an asset manifest
        new ManifestPlugin(),
        new ReactLoadablePlugin({
            filename: resolve(bundleDir, 'react-loadable.json'),
        }),
        new webpack.SourceMapDevToolPlugin({
            filename: 'public/sourcemaps/[file].map',
        }),
        new DotenvPlugin({
            path: './build.env',
        }),
        // Visualize size of webpack output files with an interactive zoomable treemap
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        }),
        // include only following moment timezone that we support
        new MomentTimezoneDataPlugin({
            startYear: 2000,
            endYear: 2100,
            // matchZones: [/^Asia\//, /UTC/, /GMT/, /^America\//, /^Europe\//],
        }),
        // include only following moment locale that we support in our i18n
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /[/\\](en|zh)-?/),
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        modules: ['node_modules'],
        symlinks: false,
        plugins: [
            new TsconfigPathsPlugin({
                extensions: ['.ts', '.tsx', '.js', '.json'],
            }),
        ],
    },
    module: {
        rules: [
            { test: /\.scss$/, use: ['css-loader', 'sass-loader'] },
            { test: /\.css$/, use: ['css-loader'] },
            {
                test: /\.js$/,
                use: ['source-map-loader'],
                enforce: 'pre',
            },
            {
                test: /\.(png|jpe?g|gif|svg|ico)$/i,
                loader: 'file-loader',
                options: {
                    esModule: false,
                    name: '[contenthash].[ext]',
                    outputPath: 'public/assets',
                },
            },
            {
                test: /\.(tsx|ts)$/,
                use: [
                    { loader: 'babel-loader' },
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            compilerOptions: {
                                /* es6 for client , default commonjs for node server*/
                                module: 'es6',
                            },
                        },
                    },
                ],
            },
        ],
    },
    optimization: {
        minimize: false,
    },
};

const serverConfig = {
    entry: {
        'server-main': ['@babel/polyfill', resolve('src', xpackage, 'server', 'index.ts')],
    },
    output: {
        filename: '[name].js',
        path: resolve(bundleDir),
        publicPath: '/',
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: 'sourcemaps/[file].map',
        }),
        new DotenvPlugin({
            path: './build.env',
        }),
        // include only following moment locale that we support in our i18n
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /[/\\](en|zh)-?/),
        //only one main js
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        })
    ],
    target: 'node',
    //use context to reaolve __dirname
    node: {
        __dirname: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        modules: ['node_modules'],
        symlinks: false,
        plugins: [
            new TsconfigPathsPlugin({
                extensions: ['.ts', '.tsx', '.js', '.json'],
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        declaration: false,
                    },
                },
            },
            { test: /\.scss$/, use: ['css-loader', 'sass-loader'] },
            { test: /\.css$/, use: ['css-loader'] },
            {
                test: /\.(png|jpe?g|gif|svg|ico)$/i,
                loader: 'file-loader',
                options: {
                    esModule: false,
                    name: '[contenthash].[ext]',
                    outputPath: 'public/assets',
                },
            },
        ],
    },
    optimization: {
        minimize: false,
    },
    stats: {
        warningsFilter: [
            (warning) => {
                // ignore critical dependency of express view, we pack all stuff to js and we don't use view
                return RegExp('node_modules/express/lib/view.js').test(warning);
            },
        ],
    },
};

const OneXasNotTest = /[\\/]node_modules[\\/]((?!(@onexas)).*)[\\/]/;
const OneXasSDKTest = /[\\/]node_modules[\\/]@onexas[\\/](react-loadable|.*-api-sdk-typescript)[\\/]/;

module.exports = {
    xpackage,
    bundleDir,
    clientConfig,
    serverConfig,
    OneXasNotTest,
    OneXasSDKTest,
};

/******************************************************************************** 
 * Copyright (c) 2020 TypeFox and others 
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

// @ts-check
const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const prodConfig = require('../webpack.config');

const outputPath = path.resolve(__dirname, 'static');

/** @type {webpack.Configuration} */
const config = {
    entry: [
        './lib/dev/main-dev.js'
    ],
    output: {
        filename: 'bundle.js',
        path: outputPath,
        publicPath: '/'
    },

    resolve: prodConfig.resolve,
    module: prodConfig.module,
    node: false,
    devtool: 'source-map',

    plugins: [
        new webpack.ProgressPlugin({}),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'report-dev.html'
        })
    ]
};

module.exports = config;

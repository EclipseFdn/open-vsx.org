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

const outputPath = path.resolve(__dirname, 'static');
const reportPath = path.resolve(__dirname, 'dev', 'static', 'report-prod.html');

/** @type {webpack.Configuration} */
const config = {
    entry: [
        './lib/src/main.js'
    ],
    output: {
        filename: 'bundle.js',
        path: outputPath,
        publicPath: '/'
    },

    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ['source-map-loader'],
                enforce: 'pre'
            },
            {
                test: /\.css$/,
                exclude: /\.useable\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    node: false,
    devtool: 'source-map',

    plugins: [
        new webpack.ProgressPlugin({}),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: reportPath
        })
    ]
};

module.exports = config;

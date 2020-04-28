/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

const webpack = require('webpack');
const path = require('path');

const outputPath = path.resolve(__dirname, 'static')

module.exports = {
    entry: [
        './dev/index.tsx'
    ],
    output: {
        filename: 'bundle.js',
        path: outputPath,
        publicPath: '/'
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader']
            },
            {
                test: /\.js$/,
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
    node: { fs: 'empty', net: 'empty' },
    devtool: 'source-map',

    plugins: [
        new webpack.WatchIgnorePlugin([
            /\.js$/,
            /\.d\.ts$/
        ]),
        new webpack.ProgressPlugin()
    ]
};

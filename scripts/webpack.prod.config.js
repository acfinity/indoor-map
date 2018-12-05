'use strict'

const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const baseWebpackConfig = require('./webpack.base.config')

module.exports = merge(baseWebpackConfig, {
    entry: './test/index.js',
    devtool: config.prod.devtool,
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: utils.assetsPath('js/[name].[hash].js'),
        chunkFilename: utils.assetsPath('js/[id].[hash].js'),
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    warnings: false, // remove warning
                    compress: {
                        dead_code: true, //remove dead code
                        pure_funcs: [], // funcs will not pack when build
                        drop_debugger: true,
                        drop_console: true,
                    },
                    sourceMap: false,
                },
            }),
        ],
    },
    plugins: [
        new CleanWebpackPlugin(['dist/*'], {
            root: path.resolve(__dirname, '..'),
            verbose: true,
            dry: false,
        }),
        new webpack.DefinePlugin({
            'process.env': config.prod.env,
            IS_DEBUG: 'false',
        }),
        // extract css into its own file
        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].[contenthash].css'),
            allChunks: true,
        }),
        // keep module.id stable when vender modules does not change
        new webpack.HashedModuleIdsPlugin(),

        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            favicon: './static/favicon.ico',
            inject: true,
            chunksSortMode: 'dependency',
        }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.prod.assetsRoot,
                ignore: ['.*'],
            },
        ]),
    ],
})

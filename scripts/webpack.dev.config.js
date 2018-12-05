'use strict'

const path = require('path')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const baseWebpackConfig = require('./webpack.base.config')

module.exports = merge(baseWebpackConfig, {
    entry: './test/index.js',
    devtool: config.dev.devtool,
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'test.js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': config.dev.env,
            IS_DEBUG: 'true',
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true,
        }),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: path.resolve(__dirname, '../dist'),
            },
        ]),
    ],
    devServer: {
        contentBase: path.resolve(__dirname, '../dist'), // 配置开发服务运行时的文件根目录
        host: '192.168.1.222', // 开发服务器监听的主机地址
        compress: true, // 开发服务器是否启动gzip等压缩
        port: config.dev.port, // 开发服务器监听的端口
    },
})

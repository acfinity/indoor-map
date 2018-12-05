'use strict'

const path = require('path')

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(json)(\?.*)?$/,
                loader: 'url-loader'
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': path.resolve('src'),
            createjs:
                path.join(__dirname, 'src') +
                '/indoor-map-3d/tweenjs-NEXT.min.js'
        }
    }
}

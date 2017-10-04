var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var helpers = require('./tools/helpers');

module.exports = {
    devtool: 'cheap-module-eval-source-map',

    entry: {
        'polyfills': './demo/polyfills.ts',
        'vendor': './demo/vendor.ts',
        'app': './demo/index.ts'
    },

    output: {
        path: helpers.root('demo-dist'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[id].chunk.js'
    },

    devServer: {
        port: 8989,
        inline: true,
        progress: true,
        historyApiFallback: true,
        stats: 'minimal',
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: { configFileName: helpers.root('demo/tsconfig.json') }
                    }, 'angular2-template-loader'
                ]
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'file-loader?name=assets/[name].[hash].[ext]'
            },
            {
                test: /\.css$/,
                use: ['to-string-loader', 'css-loader'],
                exclude: [helpers.root('src', 'styles')]
            },
            {
                test: /\.scss$/,
                use: ['to-string-loader', 'css-loader', 'sass-loader'],
                exclude: [helpers.root('src', 'styles')]
            },
        ]
    },

    plugins: [
        // Workaround for angular/angular#11580
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)@angular/,
            helpers.root('./demo'), // location of your src
            {} // a map of your routes
        ),

        new HtmlWebpackPlugin({
            template: 'demo/index.html'
        })
    ]
};


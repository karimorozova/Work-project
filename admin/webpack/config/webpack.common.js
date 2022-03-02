const path = require("path")
const { VueLoaderPlugin } = require('vue-loader')
const CopyWebpackPlugin = require("copy-webpack-plugin")
const assets = require('../modules/assets')
const { merge } = require('webpack-merge')
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const dotenv = require('dotenv').config()

module.exports = merge([ {
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, '../../dist'),
		filename: "js/[name].js",
		publicPath: '/'
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'css/[name].css'
		}),
		new VueLoaderPlugin(),
		new CopyWebpackPlugin([ {
			from: path.resolve(__dirname, '../../static'),
			to: 'static',
			ignore: [ '.*' ]
		} ]),
		new webpack.DefinePlugin({
			'process.env.ADMIN_URL': JSON.stringify(process.env.ADMIN_URL),
			'process.env.PORTAL_URL': JSON.stringify(process.env.PORTAL_URL),
			'process.env.VENDOR_URL': JSON.stringify(process.env.VENDOR_URL),
		})
	]
},
	assets.loadFont(),
	assets.loadHTML(),
	assets.loadImages()
])

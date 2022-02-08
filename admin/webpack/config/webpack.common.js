const path = require("path")
const { VueLoaderPlugin } = require('vue-loader')
const CopyWebpackPlugin = require("copy-webpack-plugin")
const assets = require('../modules/assets')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = merge([ {
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, '../../dist'),
		filename: "[name].js",
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
		} ])
	]
},
	assets.loadFont(),
	assets.loadHTML(),
	assets.loadImages()
])

const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin")

exports.loadImages = () => ({
	module: {
		rules: [ {
			test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
			use: [
				{
					loader: 'file-loader',
					options: {
						name: './images/[name].[ext]'
					}
				}
			]
		} ]
	}
})

exports.loadHTML = () => ({
	module: {
		rules: [ {
			test: /\.pug$/,
			loader: 'pug-plain-loader'
		} ]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: './index.html',
			template: 'index.html',
			inject: true,
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeAttributeQuotes: true
			}
		})
	]
})

exports.loadFont = () => ({
	module: {
		rules: [ {
			test: /\.woff2$/,
			use: [
				{
					loader: 'file-loader',
					options: {
						name: './fonts/[name].[ext]'
					}
				}
			]
		} ]
	}
})






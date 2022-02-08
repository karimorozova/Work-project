const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { VueLoaderPlugin } = require('vue-loader')
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
	mode:    'development',
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, '../../dist'),
		filename: "[name].js",
		publicPath: '/'
	},
	devtool: 'source-map',
	resolve: {
		extensions: [".js", ".vue", ".json"],
		alias: {
			vue$: "vue/dist/vue.esm.js",
			"@": path.resolve(__dirname, "../../src")
		}
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					sourceMap: true
				}
			},
			{
				test: /\.js$/,
				include: [path.resolve(__dirname,"../../src")],
				use:  {
					loader:  'babel-loader',
					options: {
						sourceMap: true,
						compact: false, // 'auto' === true
					},
				},
			},
			{
				test: /\.s[ac]ss$/i,
				use:  [
					MiniCssExtractPlugin.loader,
					// 'style-loader',
					{
						loader:  'css-loader',
						// options: {
						// 	modules:        true,
						// 	importLoaders:  1,
						// 	localIdentName: '[path][name]__[local]--[hash:base64:5]',
						// 	sourceMap: true,
						// },
					},
					"sass-loader",
				],
			},


			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				use: [
					{
						loader: 'file-loader',
					},
				],
			},
			{
				test: /\.pug$/,
				loader: 'pug-plain-loader'
			},
			// {
			// 	test: /\.woff2$/,
			// 	use:  [
			// 		{
			// 			loader:  'file-loader',
			// 			options: {
			// 				name: './assets/fonts/[name].[ext]',
			// 			},
			// 		},
			// 	],
			// },
		]
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
			},
		}),
		new MiniCssExtractPlugin({
			filename: 'css/[name].css'
		}),
		new VueLoaderPlugin(),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, '../../static'),
				to: 'static',
				ignore: ['.*']
			}
		])
	]

}
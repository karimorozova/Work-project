const MiniCssExtractPlugin = require("mini-css-extract-plugin")

exports.loadStyleProd = () => ({
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader'
					},
					"sass-loader"
				]
			}
		]
	}
})

exports.loadStyleDev = () => ({
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true
						}
					},
					"sass-loader"
				]
			}
		]
	}
})



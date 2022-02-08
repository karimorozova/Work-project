const path = require("path")

exports.loadJSProd = () => ({
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [ path.resolve(__dirname, "../../src") ],
				use: {
					loader: 'babel-loader',
					options: {
						sourceMap: false,
						compact: true
					}
				}
			}
		]
	}
})

exports.loadJSDev = () => ({
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [ path.resolve(__dirname, "../../src") ],
				use: {
					loader: 'babel-loader',
					options: {
						sourceMap: true,
						compact: false
					}
				}
			}
		]
	}
})



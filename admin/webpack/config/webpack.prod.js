const common = require('./webpack.common')
const { merge } = require("webpack-merge")
const vue = require('../modules/vue')
const javaScript = require('../modules/javaScript')
const style = require('../modules/style')
const utils = require('../modules/utils')

module.exports = merge([ common, {
	mode: 'production',
	devtool: false
},
	vue.loadVueProd(),
	javaScript.loadJSProd(),
	style.loadStyleProd(),
	utils.cleanDirectories(),
	utils.optimizationsProd()
])

const common = require('./webpack.common')
const { merge } = require("webpack-merge")
const vue = require('../modules/vue')
const javaScript = require('../modules/javaScript')
const style = require('../modules/style')
const utils = require("../modules/utils")

module.exports = merge([ common, {
	mode: 'development',
	devtool: 'cheap-module-eval-source-map'
},
	vue.loadVueDev(),
	javaScript.loadJSDev(),
	style.loadStyleDev(),
	utils.optimizationsDev()
])

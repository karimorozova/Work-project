const path = require("path")

exports.loadVueProd = () => ({
	...resolveVue(),
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					sourceMap: false
				}
			}
		]
	}
})

exports.loadVueDev = () => ({
	...resolveVue(),
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					sourceMap: true
				}
			}
		]
	}
})

const resolveVue = () => ({
	resolve: {
		extensions: [ ".js", ".vue", ".json" ],
		alias: {
			vue$: "vue/dist/vue.esm.js",
			"@": path.resolve(__dirname, "../../src")
		}
	}
})


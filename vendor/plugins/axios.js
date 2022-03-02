import cookie from "./vue-cookie"

export default function ({ store, $axios, route }) {
	$axios.onRequest(config => {
		store.dispatch('addRequest')
		if (config && config.progress === false) {
			return config
		}
	})

	$axios.onResponse(response => {
		store.dispatch('delRequest')
		if (response && response.config && response.config.progress === false) {
			return
		}
	})

	$axios.onError(error => {
		store.dispatch('noRequest')
		if (error && error.config && error.config.progress === false) {
			return
		}
	})

	$axios.interceptors.request.use(async config => {
		return await new Promise(res => {
			config.headers.common['token-header'] = cookie.get('vendor')
			res(config)
		})
	}, error => {
		console.log('axios.interceptors.request.use error !')
		return Promise.reject(error)
	})
}
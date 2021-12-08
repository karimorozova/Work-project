import state from '../store/state'
import Vue from 'vue'
import cookie from "./vue-cookie"

export default function ({ store, $axios, route }) {
	$axios.onRequest(config => {
		store.dispatch('addRequest')
		if (config && config.progress === false) {
			return
		}
	})

	$axios.onResponse(response => {
		store.dispatch('delRequest')
		if (response && response.config && response.config.progress === false) {
			return
		}
		if (state.currentRequests <= 0) {
			state.currentRequests = 0
		}
	})

	$axios.onError(error => {
		store.dispatch('delRequest')
		if (error && error.config && error.config.progress === false) {
			return
		}
	})


	$axios.interceptors.request.use(config => {
		console.log(config)
		config.baseURL = config.baseURL || 'https://admin2.pangea.global'
		config.headers.common['token-header'] = store.getters.getToken
		return config
	}, error => {
		return Promise.reject(error)
	})
}
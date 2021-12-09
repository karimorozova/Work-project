import state from '../store/state'
import Vue from 'vue'
import cookie from "./vue-cookie"
import { SET_REQUEST_ZERO } from "../store/mutations/requests"

export default async function ({ store, $axios, route }) {
	// $axios.onRequest(config => {
	// 	store.dispatch('addRequest')
	// 	if (config && config.progress === false) {
	// 		return
	// 	}
	// })

	// $axios.onResponse(response => {
	// 	store.dispatch('delRequest')
	// 	if (response && response.config && response.config.progress === false) {
	// 		return
	// 	}
	// 	// console.log(store.getters.getRequestsCount)
	// 	// if (store.getters.getRequestsCount <= 0) {
	// 	// 	SET_REQUEST_ZERO(state)
	// 	// }
	// })

	// $axios.onError(error => {
	// 	store.dispatch('delRequest')
	// 	if (error && error.config && error.config.progress === false) {
	// 		store.dispatch('noRequest')
	// 		return
	// 	}
	// })


	$axios.interceptors.request.use(async config => {
		return await new Promise(res => {
			config.headers.common['token-header'] = cookie.get('client')
			res(config)
		})
		// config.headers.common['token-header'] = token;
		// const token =
		// const token = cookie.get('client')
		// console.log('TOKEN REQ', cookie.get('client'))
		//
		// return config
	}, error => {
		console.log('axios.interceptors.request.use error !')
		return Promise.reject(error)
	})
}
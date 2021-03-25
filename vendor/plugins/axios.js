import state from '../store/state';
import Vue from 'vue';

export default function ({ store, $axios, route }) {
	$axios.onRequest(config => {

		// config.headers.common['token-header'] = store.state.token;
		// store.dispatch('noRequest')
		store.dispatch('addRequest');

		if(config && config.progress === false) {
			return config
		}
	});

	$axios.onResponse(response => {
		store.dispatch('delRequest');
		if(response && response.config && response.config.progress === false) {
			return
		}
		if(state.currentRequests < 0) {
			store.dispatch('noRequest')
		}
	});

	$axios.onError(error => {
		if(error && error.config) {
			store.dispatch('delRequest');
			store.dispatch('noRequest')
		}
	});

	$axios.interceptors.request.use(config => {
		if(route.name !== "application") {
			// if(!!store.state.token){
			// 	config.headers.common['token-header'] = store.state.token;
			// }else{
			// 	if(document) {
			// 		config.headers.common['token-header'] = Vue.cookie.get("vendor");
				// }
			// }
			if(!!document){
				config.headers.common['token-header'] = Vue.cookie.get("vendor");
			}
		}
		return config;
	}, error => {
		return Promise.reject(error);
	})
}
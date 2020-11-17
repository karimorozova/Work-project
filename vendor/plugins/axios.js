import state from '../store/state';
import Vue from 'vue';

export default function ({ store, $axios, route }) {
	$axios.onRequest(config => {
		store.dispatch('addRequest');
		if(config && config.progress === false) {
			return
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
			for (let i = 0; i < store.state.currentRequests; i++) {
				if(store.state.currentRequests !== 0) {
					store.dispatch('delRequest');
				}
			}
		}
	});

	$axios.interceptors.request.use(config => {
		if(route.name !== "application") {
			if(document) {
				config.headers.common['token-header'] = Vue.cookie.get("vendor");
			}
		}
		return config;
	}, error => {
		return Promise.reject(error);
	})
}
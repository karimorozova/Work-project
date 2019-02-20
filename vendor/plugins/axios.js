import state from '../store/state';
import Vue from "vue";

export default function ({ store, $axios, redirect }) {
  $axios.onRequest(config => {
    store.dispatch('addRequest');
    if (config && config.progress === false) {
      return
    }
  })

  $axios.onResponse(response => {
    store.dispatch('delRequest');
    if (response && response.config && response.config.progress === false) {
      return
    }
    if (state.currentRequests <= 0) {
        state.currentRequests = 0
    }
  })

  $axios.onError(error => {
    store.dispatch('delRequest');
    if (error && error.config && error.config.progress === false) {
      return
    }
  })

  $axios.interceptors.request.use(config => {
    const token = Vue.prototype.$localStorage() || "";
    config.headers.common['token-header'] = token;
    return config;
  }, error => {
    return Promise.reject(error);
  })
}
import state from '../store/state';
import Vue from 'vue';

export default function ({ store, $axios, route }) {
  $axios.onRequest(config => {
    store.dispatch('addRequest');
  })

  $axios.onResponse(response => {
    store.dispatch('delRequest');
    if (response && response.config && response.config.progress === false) {
      return
    }
    if (state.currentRequests < 0) {
        store.dispatch('noRequest')
    }
  })

  $axios.onError(error => {
    if (error && error.config && error.config.progress === false) {
      store.dispatch('noRequest')
    }
  })

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
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import BootstrapVue from "bootstrap-vue"
import App from './App'
import router from './router'
import Vuex from 'vuex'
import { store } from './vuex/store'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-vue/dist/bootstrap-vue.css';
import axios from 'axios';
import VueResource from 'vue-resource';
import 'normalize.css';
import "./assets/scss/style.scss";
import VueLodash from 'vue-lodash';

export const bus = new Vue();

axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  const value = token || "";
  config.headers.common['token-header'] = value;
  // axios.default.headers.common['token-header'] = value;
  return config;
}, error => {
  // Do something with request error
  return Promise.reject(error);
});
// Vue.use(BootstrapVue);
Vue.use(VueResource);

Vue.http.interceptors.push((request, next) => {
  store.dispatch('loadingToggle', true);
  store.dispatch('incrementRequestCounter');
  next((response) => {
    store.dispatch('decrementRequestCounter');
    if(store.state.requestCounter === 0); {
      store.dispatch('loadingToggle', false);
    }
  })
})

Vue.http.interceptors.push((request, next) => {
  const token = localStorage.getItem("token");
  const value = token || ""
  request.headers.set('token-header', value);
  next();
})

Vue.use(VueLodash);
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  axios,
  template: '<App/>',
  components: { App }
})

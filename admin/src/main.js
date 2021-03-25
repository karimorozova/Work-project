// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import { store } from './vuex/store'
import axios from 'axios';
import VueResource from 'vue-resource';
import 'normalize.css';
import "./assets/scss/style.scss";
import VueLodash from 'vue-lodash';
import "./filters/GeneralFilters";
export const bus = new Vue();

import * as io from 'socket.io-client'
import VueSocketIO from 'vue-socket.io';

Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:8080'
}))


axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  const value = token || "";
  config.headers.common['token-header'] = value;
  return config;
}, error => {
  return Promise.reject(error);
});

Vue.use(VueResource);
Vue.use(require('vue-chartist'))

Vue.http.interceptors.push((request, next) => {
  store.dispatch('incrementRequestCounter');
  next((response) => {
    store.dispatch('decrementRequestCounter');
    if(store.state.requestCounter === 0); {
    }
  })
})

Vue.http.interceptors.push((request, next) => {
  const token = localStorage.getItem("token");
  const value = token || ""
  request.headers.set('token-header', value);
  request.setHeader('Access-Control-Allow-Origin', '*');
  next();
})

Vue.use(VueLodash);
Vue.config.productionTip = false

if(location.hostname !== 'localhost') {
    Vue.config.devtools = false;
    Vue.config.debug = false;
    Vue.config.silent = true;
}

Vue.config.errorHandler = (err, vm, info) => {
    console.log(`Error: ${err.toString()}\nInfo: ${info}`);
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

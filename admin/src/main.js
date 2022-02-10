// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import { store } from './vuex/store'
import axios from 'axios';
import VueResource from 'vue-resource';
import VueLodash from 'vue-lodash';
import "./filters/GeneralFilters";
export const bus = new Vue();
import GAuth from 'vue-google-oauth2'
import io from 'socket.io-client'

const gauthOption = {
  clientId: '1057113930206-vcj6erd2h955k9jr2e3ib3lqddrcsn7b.apps.googleusercontent.com',
}

// const io = require("socket.io-client");
const socket = io(window.location.origin)
Vue.prototype.$socket = socket

Vue.prototype.$domains = {
  admin: process.env.ADMIN_URL,
  portal: process.env.PORTAL_URL,
  vendor: process.env.VENDOR_URL
}



axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  const value = token || "";
  config.headers.common['token-header'] = value;
  return config;
}, error => {
  return Promise.reject(error);
});

Vue.use(GAuth, gauthOption)
Vue.use(VueResource);

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
  console.error(err)
    // console.log(`Error: ${err.toString()}\nInfo: ${info}`);
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

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
import VueResource from 'vue-resource';
import 'normalize.css';
import "./assets/scss/style.scss";
import VueLodash from 'vue-lodash';

export const bus = new Vue();

// Vue.use(BootstrapVue);
Vue.use(VueResource);

Vue.http.interceptors.push((request, next) => {
  store.dispatch('loadingToggle', true);
  next((response) => {
    store.dispatch('loadingToggle', false);
  })
})

Vue.use(VueLodash);
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})

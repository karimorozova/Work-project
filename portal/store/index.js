import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = () => new Vuex.Store({
  state: {
    clientLanguages: [],
    clientInfo: {},
    services: [],
    session: "",
    orderDetails: {},
    token: "",
    alertMessage: "",
    isAlert: false,
    alertType: "success"
  },
  actions: {
    loadOrderDetails(context, payload) {
      context.commit('details', payload)
    },
    loadLangs(context, payload) {
      context.commit('langs', payload)
    },
    requestInfo(context, obj) {
      context.commit('clientForRequest', obj)
    },
    servicesGetting(context, arr) {
      context.commit('servicesFill', arr)
    },
    jsession(context, payload) {
      context.commit('sesCook', payload)
    },
    files(context, payload) {
      context.commit('detfilesToDetails', payload)
    },
    referFiles(context, payload) {
      context.commit('reffilesToDetails', payload)
    },
    requestType(context, payload) {
      context.commit('orderType', payload)
    },
    login({commit}, payload) {
      Vue.cookie.set("ses", payload, {expires: '2h'});
      commit("SET_TOKEN", payload);
    },
    alertToggle({commit}, payload) {
      commit('ALERTING_MESSAGE', payload);
      setTimeout(() => {
        commit('ALERTING_MESSAGE', {message: "", isShow: false, type: "success"});
      }, 5000)
    }
  },
  mutations: {
    details(state, payload) {
      state.orderDetails = payload
    },
    detfilesToDetails(state, payload) {
      if (payload.length) {
        state.orderDetails.detailFiles = [];
        for (let i = 0; i < payload.length; i++) {
          state.orderDetails.detailFiles.push(payload[i].name);
        }
      }
    },
    reffilesToDetails(state, payload) {
      if (payload) {
        state.orderDetails.refFiles = payload.name;
      }
    },
    orderType(state, payload) {
      state.orderDetails.requestType = payload;
    },
    langs(state, payload) {
      state.clientLanguages = payload
    },
    clientForRequest(state, payload) {
      state.clientInfo = payload
    },
    servicesFill(state, payload) {
      state.services = payload
    },
    sesCook(state, payload) {
      state.session = payload
    },
    SET_TOKEN(state, payload) {
      state.token = payload;
    },
    ALERTING_MESSAGE (state, payload) {
      state.alertMessage = payload.message;
      state.isAlert = payload.isShow;
      state.alertType = payload.type;
    }
  },
  getters:{
    getIsAlert(state){
      return state.isAlert
    },
    getAlertMessage(state){
      return state.alertMessage
    },
    getAlertType(state){
      return state.alertType
    },

  }
});

export default store

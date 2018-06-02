import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = () => new Vuex.Store({
    state: {
        clientLanguages: [],
        clientInfo: {},
        services: [],
        session: ""
    },
    actions: {
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
        }
     },
    mutations: {
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
        }
    }
})

export default store
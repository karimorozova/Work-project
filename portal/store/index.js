import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = () => new Vuex.Store({
    state: {
        products: [],
        clientInfo: {},
    },
    actions: {
        loadProducts(context, payload) {
            context.commit('load', payload)
        },
        requestInfo(context, obj) {
            context.commit('clientForRequest', obj)
        }
    },
    mutations: {
        load(state, payload) {
            state.products = payload
        },
        clientForRequest(state, payload) {
            state.clientInfo = payload
        }
    }
})

export default store
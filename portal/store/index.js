import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = () => new Vuex.Store({
    state: {
        clientLanguages: [],
        clientInfo: {},
    },
    actions: {
        loadLangs(context, payload) {
            context.commit('langs', payload)
        },
        requestInfo(context, obj) {
            context.commit('clientForRequest', obj)
        }
    },
    mutations: {
        langs(state, payload) {
            state.clientLanguages = payload
        },
        clientForRequest(state, payload) {
            state.clientInfo = payload
        }
    }
})

export default store
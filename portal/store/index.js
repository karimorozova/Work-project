import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = () => new Vuex.Store({
    state: {
        clientLanguages: [],
        clientInfo: {},
        services: [],
        session: "",
        orderDetails: {},
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
        }
     },
    mutations: {
        details(state, payload) {
            state.orderDetails = payload
        },
        detfilesToDetails(state, payload) {
            if(payload.length) {
                state.orderDetails.detailFiles = [];
                for(let i = 0; i < payload.length; i++) {
                    state.orderDetails.detailFiles.push(payload[i].name);
                }
            }
        },
        reffilesToDetails(state, payload) {
            if(payload) {              
                state.orderDetails.refFiles = payload.name;
            }
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
        }
    }
})

export default store
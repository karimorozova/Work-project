import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

const state = {
    count: 0,
    services: [],
    customers: [],
    clientLangs: []
};

const mutations = {
    INCREMENT_COUNTER(state){
        state.count++
    },
    servicesFill(state, payload) {
        state.services = payload
    },
    allCustomers(state, payload) {
        state.customers = payload
    },
    customerlangs(state, payload) {
        state.clientLangs = payload
    }
};

export const store = new Vuex.Store({
    state,
    actions,
    mutations,
    getters
});
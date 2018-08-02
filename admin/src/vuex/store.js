import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

const state = {
    count: 0,
    services: [],
    customers: [],
    xtmCustomers: [],
    languages: [],
    clientLangs: [],
    isLoggedIn: !!localStorage.getItem("token")
};

const mutations = {
    LOGIN(state) {
        state.pending = true;
    },
    LOGIN_SUCCESS(state) {
        state.isLoggedIn = true;
        state.pending = false;
    },
    LOGOUT(state) {
        state.isLoggedIn = false;
    },
    INCREMENT_COUNTER(state){
        state.count++
    },
    servicesFill(state, payload) {
        state.services = payload
    },
    allCustomers(state, payload) {
        state.customers = payload
    },
    allXtmCustomers(state, payload) {
        state.xtmCustomers = payload
    },
    allLangs(state, payload) {
        state.languages = payload
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
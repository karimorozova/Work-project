import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

const state = {
    services: [],
    customers: [],
    xtmCustomers: [],
    languages: [],
    clientLangs: [],
    vendors: [],
    duoRates: [],
    projects: [],
    currentProject: {},
    isLoggedIn: !!localStorage.getItem("token"),
    isLoading: false
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
    loadingValue(state, payload) {
        state.isLoading = payload;
    },
    servicesFill(state, payload) {
        state.services = payload
    },
    allProjects(state, payload) {
        state.projects = payload;
    },
    allCustomers(state, payload) {
        state.customers = payload
    },
    allXtmCustomers(state, payload) {
        state.xtmCustomers = payload
    },
    allVendors(state, payload) {
        state.vendors = payload
    },
    allLangs(state, payload) {
        state.languages = payload
    },
    customerlangs(state, payload) {
        state.clientLangs = payload
    },
    duoRatesFill(state, payload) {
        state.duoRates = payload
    },
    storeCurrentProject(state, payload) {
        state.currentProject = payload
    },
    storeProjectValue(state, payload) {
        state.currentProject[payload.prop] = payload.value;
    }
};

export const store = new Vuex.Store({
    state,
    actions,
    mutations,
    getters
});
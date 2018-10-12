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
    isLoading: false,
    isAlert: false,
    isError: false,
    alertMessage: ''
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
    alertingMessage(state, payload) {
        state.alertMessage = payload.message;
        state.isAlert = payload.isShow;
        state.isError = payload.isError;
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
    },
    stepVendorStore(state, payload) {
        state.currentProject.steps[payload.index].vendor = payload.value;
    },
    stepDateStore(state, payload) {
        state.currentProject.steps[payload.index][payload.prop] = payload.value
    },
    stepVendorDelete(state, payload) {
        state.currentProject.steps[payload.index].vendor = "";
    }
};

export const store = new Vuex.Store({
    state,
    actions,
    mutations,
    getters
});
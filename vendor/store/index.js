import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

const state = {
    languages: [],
    timezones: []
};

const mutations = {
    allLangs(state, payload) {
        state.languages = payload
    },
    allTimezones(state, payload) {
        state.timezones = payload
    }
};

const store = () => new Vuex.Store({
    state,
    actions,
    mutations,
    getters
});

export default store;
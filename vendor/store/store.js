import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

const state = {
    languages: [],
};

const mutations = {
    allLangs(state, payload) {
        state.languages = payload
    }
};

export const store = new Vuex.Store({
    state,
    actions,
    mutations,
    getters
});
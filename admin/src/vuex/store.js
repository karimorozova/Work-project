import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

const state = {
    count: 0
};

const mutations = {
    INCREMENT_COUNTER(state){
        state.count++
    }
};

export const store = new Vuex.Store({
    state,
    actions,
    mutations,
    getters
});
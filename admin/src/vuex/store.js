import Vue from 'vue';
import Vuex from 'vuex';
// import * as actions from './actions';
// import * as getters from './getters';
// import { mutations } from './mutations';
import { generalStore } from "./general/";
import { finance } from "./finance/";


Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        a: generalStore,
        b: finance
    }
});
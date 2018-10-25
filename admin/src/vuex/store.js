import Vue from 'vue';
import Vuex from 'vuex';
// import * as actions from './actions';
// import * as getters from './getters';
// import { mutations } from './mutations';
import { overall } from "./overall/";
import { finance } from "./finance/";


Vue.use(Vuex);

// const state = {
//     services: [],
//     customers: [],
//     xtmCustomers: [],
//     languages: [],
//     clientLangs: [],
//     vendors: [],
//     duoRates: [],
//     projects: [],
//     currentProject: {},
//     isLoggedIn: !!localStorage.getItem("token"),
//     isLoading: false,
//     isAlert: false,
//     alertType: 'success',
//     alertMessage: '',
//     requestCounter: 0
// };

export const store = new Vuex.Store({
    modules: {
        a: overall,
        b: finance
    }
    // state,
    // actions,
    // mutations,
    // getters
});
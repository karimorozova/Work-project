import Vue from 'vue';

export const login =  ( { commit }, payload) => {
    Vue.cookie.set("ses", payload, {expires: '2h'});
    commit("SET_TOKEN", payload)
};

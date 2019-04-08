import Vue from 'vue';

export const login =  ( { commit }, payload) => {
    Vue.cookie.set("client", payload, {expires: '2h'});
    commit("SET_TOKEN", payload)
};

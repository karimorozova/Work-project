import Vue from 'vue';

export const login = ( { commit }, payload) => {
    Vue.cookie.set("client", payload, {expires: "12h"});
    commit("SET_TOKEN", payload)
};

import Vue from "vue";

export const logout =  ({ commit }) => {
    commit("SET_TOKEN", "");
    Vue.cookie.delete("client");
};

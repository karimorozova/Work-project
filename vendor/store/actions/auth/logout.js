import Vue from "vue";

export default ({ commit }) => {
    commit("SET_TOKEN", "");
    commit("SET_PREVIOUS_LINK", "");
    Vue.cookie.delete("vendor");    
}
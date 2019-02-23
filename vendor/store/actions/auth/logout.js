import Vue from "vue";

export default ({ commit }) => {
    commit("SET_TOKEN", "");
    Vue.cookie.delete("vendor");    
}
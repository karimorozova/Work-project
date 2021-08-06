import Vue from 'vue';

export default ( { commit }, payload) => {
    Vue.cookie.set("vendor", payload, {expires: '24h'});
    commit("SET_TOKEN", payload)
}
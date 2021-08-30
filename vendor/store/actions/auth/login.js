import Vue from 'vue';

export default ( { commit }, payload) => {
    Vue.cookie.set("vendor", payload, {expires: '12h'});
    commit("SET_TOKEN", payload)
}
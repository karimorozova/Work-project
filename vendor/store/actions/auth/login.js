import Vue from 'vue';

export default ( { commit }, payload) => {
    Vue.cookie.set("vendor", payload, {expires: '2h'});
    commit("SET_TOKEN", payload)
}
import Vue from "vue";

export const addFinanceProperty = ({commit, rootState}, payload) => {
    rootState.a.currentProject.finance = {...rootState.a.currentProject.finance, 'Select': payload};
};
export const storeDuoRates = ({commit}, payload) => commit('setDuoRates', payload);
export const storeMonoRates = ({commit}, payload) => commit('setMonoRates', payload);
export const storeServiceWhenAddSeveral = ({commit}, payload) => commit('setServiceWhenAddSeveral', payload);
export const getDuoCombinations = async ({commit}, payload) => {
    try {
    const result = await Vue.http.get(`/service/parsed-rates?title=${payload}&form=Duo`);
    commit('setDuoRates', result.body);
    } catch(err) {
        throw new Error("Error on getting Duo rates")
    }
}
export const getMonoCombinations = async ({commit}, payload) => {
    try {
    const result = await Vue.http.get(`/service/parsed-rates?title=${payload}&form=Mono`);
    commit('setMonoRates', result.body);
    } catch(err) {
        throw new Error("Error on getting Mono rates")
    }
}
export const deleteServiceRate = async ({commit}, payload) => {
    try {
        await Vue.http.delete(`/service/rate/${payload.id}`, {body: payload.deletedRate});
    } catch(err) {
        throw new Error("Error on deleting rate");
    }
}
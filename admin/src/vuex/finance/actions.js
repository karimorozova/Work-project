import Vue from "vue";

export const addFinanceProperty = ({commit, rootState}, payload) => {
    rootState.a.currentProject.finance = {...rootState.a.currentProject.finance, 'Select': payload};
};
export const storeDuoRates = ({commit}, payload) => commit('setDuoRates', payload);
export const storeMonoRates = ({commit}, payload) => commit('setMonoRates', payload);
export const storeServiceWhenAddSeveral = ({commit}, payload) => commit('setServiceWhenAddSeveral', payload);
export const getDuoCombinations = async ({commit, state}, payload) => {
    commit('startRequest');
    try {
        const id = state.currentPrice._id;
        const result = await Vue.http.get(`/service/parsed-rates?form=Duo&id=${id}`);
        const rates = result.body.sort((a, b) => {
            if(a.sourceLanguage.lang < b.sourceLanguage.lang) return -1;
            if(a.sourceLanguage.lang > b.sourceLanguage.lang) return 1;
        })
        commit('setDuoRates', rates);
        commit('endRequest');
    } catch(err) {
        commit('endRequest');
        throw new Error("Error on getting Duo rates");
    }
}
export const getMonoCombinations = async ({commit, state}, payload) => {
    commit('startRequest');
    try {
        const id = state.currentPrice._id;
        const result = await Vue.http.get(`/service/parsed-rates?form=Mono&id=${id}`);
        const rates = result.body.sort((a, b) => {
            if(a.targetLanguage.lang < b.targetLanguage.lang) return -1;
            if(a.targetLanguage.lang > b.targetLanguage.lang) return 1;
        })
        commit('setMonoRates', rates);
        commit('endRequest');
    } catch(err) {
        commit('endRequest');
        throw new Error("Error on getting Mono rates");
    }
}
export const saveGlobalRates = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    try {
        const priceId = state.currentPrice._id;
        await Vue.http.post('/service/rates', {info: payload, priceId});
        payload.languageForm === "Duo" ? await dispatch('getDuoCombinations') : await dispatch('getMonoCombinations');
        commit('endRequest');
    } catch(err) {
        commit('endRequest');
        throw new Error("Error on saving rate");
    }
}
export const deleteServiceRate = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    try {
        const priceId = state.currentPrice._id;
        await dispatch('deleteCheckedRate', {...payload, priceId});
        const { languageForm } = payload.deletedRate;
        languageForm === "Duo" ? await dispatch('getDuoCombinations') : await dispatch('getMonoCombinations');
        commit('endRequest');
    } catch(err) {
        commit('endRequest');
        throw new Error("Error on deleting rate");
    }
}
export const deleteCheckedRate = async ({commit}, payload) => {
    commit('startRequest');
    try {
        await Vue.http.delete(`/service/rate/${payload.priceId}`, {body: {...payload.deletedRate, id: payload.id}});
        commit('endRequest');
    } catch(err) {
        commit('endRequest');
        throw new Error("Error on deleting rate");
    }
    commit('endRequest');
}
export const storeCurrentPrice = ({commit}, payload) => commit('setCurrentPrice', payload);
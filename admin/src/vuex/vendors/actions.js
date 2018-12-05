import Vue from "vue";

export const storeCurrentVendor = ({ commit }, payload) => commit('setCurrentVendor', payload);
export const updateVendorProp = ({ commit }, payload) => commit('setVendorProp', payload);
export const updateIndustry = ({ commit }, payload) => commit('updateVendorIndustry', payload);
export const storeVendorDuoRates = ({commit}, payload) => commit('setVendorDuoRates', payload);
export const storeVendorMonoRates = ({commit}, payload) => commit('setVendorMonoRates', payload);
export const getVendorDuoCombinations = async ({commit, dispatch, state}) => {
    commit("startRequest");
    try {
        const id = state.currentVendor._id;
        const result = await Vue.http.get(`/vendorsapi/rates?form=Duo&vendorId=${id}`);
        const rates = result.body.sort((a, b) => {
            if(a.sourceLanguage.lang < b.sourceLanguage.lang) return -1;
            if(a.sourceLanguage.lang > b.sourceLanguage.lang) return 1;
        })
        dispatch('storeVendorDuoRates', rates);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on getting Duo rates")
    }
}
export const getVendorMonoCombinations = async ({commit, dispatch, state}) => {
    commit("startRequest");
    try {
        const id = state.currentVendor._id;
        const result = await Vue.http.get(`/vendorsapi/rates?form=Mono&vendorId=${id}`);
        const rates = result.body.sort((a, b) => {
            if(a.targetLanguage.lang < b.targetLanguage.lang) return -1;
            if(a.targetLanguage.lang > b.targetLanguage.lang) return 1;
        })
        dispatch('storeVendorMonoRates', rates);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on getting Mono rates")
    }
}
export const saveVendorRates = async ({commit, dispatch, state}, payload) => {
    commit("startRequest");
    try {
        const ratesInfo = { ...payload, vendorId: state.currentVendor._id}
        const result = await Vue.http.post('/vendorsapi/rates', { ratesInfo });
        dispatch('storecurrentVendor', result.body);
        ratesInfo.languageForm === "Duo" ? await dispatch('getVendorDuoCombinations') : await dispatch('getVendorMonoCombinations');
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on saving rate");
    }
}
export const deleteVendorRate = async ({commit, dispatch}, payload) => {
    commit("startRequest");
    try {
        await dispatch('deleteVendorsCheckedRate', payload);
        const { languageForm } = payload.deletedRate;
        languageForm === "Duo" ? await dispatch('getVendorDuoCombinations') : await dispatch('getVendorMonoCombinations');
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on deleting rate");
    }
}

export const deleteVendorsCheckedRate = async ({commit, dispatch, state}, payload) => {
    commit("startRequest");
    try {
        const deletedRate = { ...payload.deletedRate, vendorId: state.currentVendor._id};
        const result = await Vue.http.delete(`/vendorsapi/rate/${payload.id}`, {body: deletedRate});
        dispatch('storecurrentVendor', result.body);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on deleting rate");
    }
}
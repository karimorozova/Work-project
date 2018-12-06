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
        const ratesInfo = { ...payload, vendorId: state.currentVendor._id};
        const result = await Vue.http.post('/vendorsapi/rates', { ratesInfo });
        dispatch('storeCurrentVendor', result.body);
        ratesInfo.languageForm === "Duo" ? await dispatch('getVendorDuoCombinations') : await dispatch('getVendorMonoCombinations');
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on saving rate");
    }
}

export const addSeveralVendorRates = async ({commit, dispatch, rootState}, payload) => {
    commit("startRequest");
    try {
        const { combinations, vendorId } = payload;
        const updatedVendor = await Vue.http.post('/vendorsapi/several-langs', {combinations, vendorId});
        const index = rootState.a.vendors.findIndex(item => item._id === vendorId);
        rootState.a.vendors.splice(index, 1, updatedVendor.body);
        dispatch('storeCurrentVendor', updatedVendor.body);
        await dispatch('getVendorDuoCombinations');
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on adding sveral langs for Vendor")
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
        dispatch('storeCurrentVendor', result.body);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on deleting rate");
    }
}

export const deleteCurrentVendor = async ({commit, rootState}, payload) => {
    commit("startRequest");
    try {
        const  { id } = payload;
        await Vue.http.delete(`/vendorsapi/deletevendor/${id}`);
        const index = rootState.a.vendors.findIndex(item => item._id === id);
        rootState.a.vendors.splice(index, 1);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on deleting Vendor");
    }
}

export const saveNewVendor = async ({commit, rootState}, payload) => {
    commit("startRequest");
    try {
        const result = await Vue.http.post("/vendorsapi/new-vendor", payload);
        const newVendor = result.body;
        rootState.a.vendors.push(newVendor);
        commit('setCurrentVendor', newVendor);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on saving Vendor");
    }
}

export const updateCurrentVendor = async ({commit, rootState}, payload) => {
    commit("startRequest");
    try {
        const result = await Vue.http.post("/vendorsapi/update-vendor", payload);
        const updatedVendor = result.body;
        const index = rootState.a.vendors.findIndex(item => item._id === updatedVendor._id);
        rootState.a.vendors.splice(index, 1, updatedVendor);
        commit('setCurrentVendor', updatedVendor);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on updating Vendor information");
    }
}
import Vue from "vue";

export const storeCurrentVendor = ({ commit }, payload) => commit('setCurrentVendor', payload);
export const updateVendorProp = ({ commit }, payload) => commit('setVendorProp', payload);
export const updateIndustry = ({ commit }, payload) => commit('updateVendorIndustry', payload);
export const storeVendor = ({commit, rootState}, payload) => {
    const index = rootState.a.vendors.findIndex(item => item._id === payload._id);
    rootState.a.vendors.splice(index, 1, payload);
}

export const saveVendorRates = async ({commit, dispatch, state}, payload) => {
    commit("startRequest");
    try {
        const vendorId = state.currentVendor._id;
        const result = await Vue.http.post('/vendorsapi/rates', { vendorId, ...payload });
        dispatch('storeCurrentVendor', result.body);
    } catch(err) {
        dispatch('alertToggle', {message: err.response.data, isShow: true, type: "error"});
    } finally {
        commit("endRequest");
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
        const { id, prop } = payload;
        const vendorId = state.currentVendor._id;
        const result = await Vue.http.post('/vendorsapi/remove-rate', { vendorId, rateId: id, prop });
        dispatch("storeCurrentVendor", result.body);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow:true, type: "error"});
    } finally {
        commit('endRequest');
    }
}

export const deleteVendorRates = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    try {
        const { checkedIds, prop } = payload;
        const vendorId = state.currentVendor._id;
        const result = await Vue.http.post('/vendorsapi/remove-rates', { vendorId, checkedIds, prop });
        dispatch("storeCurrentVendor", result.body);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow:true, type: "error"});
    } finally {
        commit('endRequest');
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

export const setVendorsMatrixData = async ({commit, dispatch, rootState, state}, payload) => {
    commit("startRequest");
    try {
        const { _id, matrix } = state.currentVendor;
        matrix[payload.key].rate = payload.value;
        const updatedVendor = await Vue.http.post('/vendorsapi/update-matrix', {_id, matrix});
        rootState.a.vendors.forEach(item => { 
            if(item._id === _id) item.matrix = matrix
        });
        dispatch("storeCurrentVendor", updatedVendor.body)
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on updating matrix data");
    }
}

export const updateVendorRate = async ({commit, dispatch}, payload) => {
    commit("startRequest");
    try {
        const { step, rate } = payload;
        const updatedVendor = await Vue.http.post("/vendorsapi/combination", { step, rate });
        dispatch("storeVendor", updatedVendor.body);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        commit("endRequest");
    }
}
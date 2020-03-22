import Vue from "vue";

export const storeCurrentVendor = ({ commit }, payload) => commit('setCurrentVendor', payload);
export const setFilteredVendors = ({ commit }, payload) => commit('SET_FILTERED_VENDORS', payload);
export const updateVendorProp = ({ commit }, payload) => commit('setVendorProp', payload);
export const updateIndustry = ({ commit }, payload) => commit('updateVendorIndustry', payload);
export const storeVendor = ({ commit, state }, payload) => {
    const index = state.filteredVendors.findIndex(item => item._id === payload._id);
    state.filteredVendors.splice(index, 1, payload);
}
export const SET_CURRENT_VENDOR_EDUCATION = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_EDUCATION', payload);
export const SET_CURRENT_VENDOR_PROFESSIONAL_EXPERIENCE = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_PROFESSIONAL_EXPERIENCE', payload);
export const SET_CURRENT_VENDOR_QUALIFICATIONS = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_QUALIFICATIONS', payload);
export const SET_CURRENT_VENDOR_DOCUMENTS = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_DOCUMENTS', payload);
export const SET_CURRENT_VENDOR_ASSESSMENT = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_ASSESSMENT', payload);


export const saveVendorRates = async ({ commit, dispatch, state }, payload) => {
    commit("startRequest");
    try {
        const vendorId = state.currentVendor._id;
        const result = await Vue.http.post('/vendorsapi/rates', { vendorId, ...payload });
        dispatch('storeCurrentVendor', result.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const importRatesToVendor = async ({ commit, dispatch, state }, payload) => {
    commit('startRequest');
    try {
        const vendorId = state.currentVendor._id;
        const { ratesData, prop } = payload;
        const result = await Vue.http.post('/vendorsapi/import-rates', { ratesData, vendorId, prop });
        dispatch('storeCurrentVendor', result.body);
    } catch (err) {
        dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit('endRequest');
    }
}

export const deleteVendorRate = async ({ commit, dispatch, state }, payload) => {
    commit("startRequest");
    try {
        const { id, prop } = payload;
        const vendorId = state.currentVendor._id;
        const result = await Vue.http.post('/vendorsapi/remove-rate', { vendorId, rateId: id, prop });
        dispatch("storeCurrentVendor", result.body);
    } catch (err) {
        dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit('endRequest');
    }
}

export const deleteVendorRates = async ({ commit, dispatch, state }, payload) => {
    commit('startRequest');
    try {
        const { checkedIds, prop } = payload;
        const vendorId = state.currentVendor._id;
        const result = await Vue.http.post('/vendorsapi/remove-rates', { vendorId, checkedIds, prop });
        dispatch("storeCurrentVendor", result.body);
    } catch (err) {
        dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit('endRequest');
    }
}

export const deleteCurrentVendor = async ({ commit, state }, payload) => {
    commit("startRequest");
    try {
        const { id } = payload;
        await Vue.http.delete(`/vendorsapi/deletevendor/${id}`);
        const index = state.filteredVendors.findIndex(item => item._id === id);
        state.filteredVendors.splice(index, 1);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const saveNewVendor = async ({ commit, state }, payload) => {
    commit("startRequest");
    try {
        const result = await Vue.http.post("/vendorsapi/new-vendor", payload);
        const newVendor = result.body;
        state.filteredVendors.push(newVendor);
        commit('setCurrentVendor', newVendor);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const updateCurrentVendor = async ({ commit, state }, payload) => {
    commit("startRequest");
    try {
        const result = await Vue.http.post("/vendorsapi/update-vendor", payload);
        const updatedVendor = result.body;
        const index = state.filteredVendors.findIndex(item => item._id === updatedVendor._id);
        state.filteredVendors.splice(index, 1, updatedVendor);
        commit('setCurrentVendor', updatedVendor);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const setVendorsMatrixData = async ({ commit, dispatch, state }, payload) => {
    commit("startRequest");
    try {
        const { _id, matrix } = state.currentVendor;
        matrix[payload.key].rate = payload.value;
        const updatedVendor = await Vue.http.post('/vendorsapi/update-matrix', { _id, matrix });
        state.filteredVendors.forEach(item => {
            if (item._id === _id) item.matrix = matrix
        });
        dispatch("storeCurrentVendor", updatedVendor.body)
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const updateVendorRate = async ({ commit, dispatch }, payload) => {
    commit("startRequest");
    try {
        const { step, rate } = payload;
        const updatedVendor = await Vue.http.post("/vendorsapi/combination", { step, rate });
        dispatch("storeVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const storeCurrentVendorEducation = async ({ dispatch }, payload) => {

    try {
        const updatedVendor = await Vue.http.post("/vendorsapi/vendor-education", payload);
        dispatch("storeCurrentVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    }
}

export const deleteCurrentVendorEducation = async ({ commit, dispatch }, payload) => {
    commit("startRequest");
    try {
        const { vendorId, index, doc } = payload;
        const updatedVendor = await Vue.http.post("/vendorsapi/remove-vendor-education", {vendorId, index, doc});
        dispatch("storeCurrentVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const storeCurrentVendorProfessionalExperience = async ({ commit, dispatch }, payload) => {
    commit("startRequest");
    try {
        const { vendorId, index, ...experience } = payload;
        const updatedVendor = await Vue.http.post("/vendorsapi/vendor-profExperience", {vendorId, index, experience});
        dispatch("storeCurrentVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const deleteCurrentVendorProfessionalExperience = async ({ commit, dispatch }, payload) => {
    commit("startRequest");
    try {
        const { vendorId, index } = payload;
        const updatedVendor = await Vue.http.post("/vendorsapi/remove-vendor-experience", {vendorId, index});
        dispatch("storeCurrentVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const storeCurrentVendorQualification = async ({ commit, dispatch }, payload) => {
    commit("startRequest");
    try {
        const { vendorId, index, qualification } = payload;
        const updatedVendor = await Vue.http.post("/vendorsapi/vendor-qualification", { vendorId, index, qualification });
        dispatch("storeCurrentVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const deleteCurrentVendorQualification = async ({ commit, dispatch }, payload) => {
    commit("startRequest");
    try {
        const { index, vendorId } = payload;
        const updatedVendor = await Vue.http.post("/vendorsapi/remove-vendor-qualification", { index, vendorId });
        dispatch("storeCurrentVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const storeCurrentVendorAssessment = async ({ dispatch }, payload) => {
    commit("startRequest");
    try {
        // const result = await Vue.http.post("/vendorsapi/vendor-assessment", payload);
        // dispatch("storeCurrentVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const deleteCurrentVendorAssessment = async ({ commit, dispatch }, payload) => {
    commit("startRequest");
    try {
        // const { index, vendorId } = payload;
        // const updatedVendor = await Vue.http.post("/vendorsapi/remove-vendor-assessment", { index, vendorId });
        // dispatch("storeCurrentVendor", updatedVendor.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}

export const storeCurrentVendorDocuments = async ({ dispatch }, payload) => {

    try {
        const result = await Vue.http.post("/vendorsapi/vendor-document", payload);
        dispatch('storeCurrentVendor', result.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    }
}

export const deleteCurrentVendorDocument = async ({ commit, dispatch }, payload) => {
    commit("startRequest");
    try {
        const result = await Vue.http.post("/vendorsapi/remove-vendor-doc", payload);
        dispatch('storeCurrentVendor', result.body);
    } catch (err) {
        dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" });
    } finally {
        commit("endRequest");
    }
}




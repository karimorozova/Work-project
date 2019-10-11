export const mutations = {
    setCurrentVendor(state, payload) {
        state.currentVendor = {...payload};
    },
    SET_FILTERED_VENDORS(state, payload) {
        state.filteredVendors = [...payload];
    },
    setVendorProp(state, payload) {
        state.currentVendor[payload.prop] = payload.value;
    },
    updateVendorIndustry(state, payload) {
        const position = state.currentVendor.industries.findIndex(item => item._id === payload._id);
        if(position !== -1) {
            state.currentVendor.industries.splice(position, 1)
        } else {
            state.currentVendor.industries.push(payload);
        }
    }
}

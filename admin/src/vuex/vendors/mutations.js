export const mutations = {
    setCurrentVendor(state, payload) {
        state.currentVendor = {...payload};
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
    },
    setVendorDuoRates(state, payload) {
        state.vendorDuoRates = payload;
    },
    setVendorMonoRates(state, payload) {
        state.vendorMonoRates = payload;
    }
}

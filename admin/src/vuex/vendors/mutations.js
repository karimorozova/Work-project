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
    },


    SET_CURRENT_VENDOR_EDUCATION(state,payload){
        state.currentVendorEducation[payload._id] = payload
    },
    SET_CURRENT_VENDOR_PROFESSIONAL_EXPERIENCE(state,payload){
        state.currentVendorProfessionalExperience[payload._id] = payload
    },
    SET_CURRENT_VENDOR_QUALIFICATIONS(state,payload){
         state.currentVendorQualifications[payload._id] = payload
    },
    SET_CURRENT_VENDOR_DOCUMENTS(state,payload){
        state.currentVendorDocuments[payload._id] = payload
   },
   SET_CURRENT_VENDOR_ASSESSMENT(state,payload){
    state.currentVendorAssessment.push({
        _id: payload._id,
        industry: payload.industry,
    })
},

}

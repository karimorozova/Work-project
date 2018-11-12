import Vue from "vue";

export const storeCurrentVendor = ({ commit }, payload) => commit('setCurrentVendor', payload);
export const updateVendorProp = ({ commit }, payload) => commit('setVendorProp', payload);
export const updateIndustry = ({ commit }, payload) => commit('updateVendorIndustry', payload);
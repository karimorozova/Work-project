import axios from "axios";

export const storeCurrentVendor = ({ commit }, payload) => commit('setCurrentVendor', payload);
export const updateVendorProp = ({ commit }, payload) => commit('setVendorProp', payload);
export const updateIndustry = ({ commit }, payload) => commit('updateVendorIndustry', payload);
// export const cucu = async ({commit}) => {
//     commit('loadingValue', true);
//     try{
//     const result = await axios.get('/vendorsapi/cucu');
//     console.log(result);
//     commit('loadingValue', false);
//     } catch(err) {
//         commit('loadingValue', false);
//         throw new Error("error on getting cucu")
//     }
// }
// export const saveVendorInfo = async function ({commit, dispatch, state}, payload) {
//
// }
export const setOriginallyUnits = ({ state, dispatch }, payload) =>{
    try {
        state.originallyUnits = payload
    }catch (err) {
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}

// export const setReports = ({ commit, dispatch }, payload) =>{
//     try {
//         commit("SET_REPORTS", payload);
//     }catch (err) {
//         dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
//     }
// }
//
// export const setReportsPaid = ({ commit, dispatch }, payload) =>{
//     try {
//         commit("SET_REPORTS_PAID", payload);
//     }catch (err) {
//         dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
//     }
// }

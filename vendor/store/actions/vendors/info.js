export const saveVendorInfo = async function ({commit, dispatch, state}, payload) {
    try {
        const id = state.vendor._id;
        const { password } = state.newPassword;
        let infoData = new FormData();
        infoData.append("info", JSON.stringify(state.accountInfo));
        infoData.append("id", id);
        infoData.append("password", password);
        if(state.accountInfo.photoFile) {
            infoData.append("photo", state.accountInfo.photoFile[0]);
        }
        const result = await this.$axios.post('/vendor/info', infoData);
        const decode = window.atob(result.data)
        const data = JSON.parse(decode)
        commit("SET_VENDOR", data);
        commit("SET_ACCOUNT_INFO");
        commit("SET_NEW_PASSWORD", "");
        commit("SET_CONFIRMED_PASSWORD", "");
        dispatch("alertToggle", {message: 'Saved', isShow: true, type: "success"});
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}
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

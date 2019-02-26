export const saveVendorInfo = async function ({commit, dispatch, state}, payload) {
    try {
        const id = state.vendor._id;
        const { password } = state.newPassword;
        const result = await this.$axios.post('/vendor/info', { id, password, info: state.accountInfo });
        commit("SET_VENDOR", result.data);
        commit("SET_ACCOUNT_INFO");
        commit("SET_NEW_PASSWORD", "");
        commit("SET_CONFIRMED_PASSWORD", "");
        dispatch("alertToggle", {message: 'Saved', isShow: true, type: "success"});
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}
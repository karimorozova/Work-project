export default async function ({ commit, dispatch, state }) {
    try {
        const result = await this.$axios.get(`/vendor/info?token=${state.token}`);
        commit("SET_VENDOR", result.data);
        commit("SET_ACCOUNT_INFO");
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}
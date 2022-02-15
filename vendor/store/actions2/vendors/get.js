export default async function ({ commit, dispatch, state }) {
    try {
        const result = await this.$axios.get(`/vendor/info?token=${state.token}`);
        const decode = window.atob(result.data)
        const data = JSON.parse(decode)
        commit("SET_VENDOR", data);
        commit("SET_ACCOUNT_INFO");
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}
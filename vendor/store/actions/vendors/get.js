export default async function ({ commit, dispatch, state }) {
    try {
        const result = await this.$axios.get(`/vendor/info?token=${state.token}`);
        commit("SET_VENDOR", result.data);
    } catch(err) {
        console.log(err);
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}
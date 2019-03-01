export const getJobs = async function({ commit, dispatch, state}) {
    try {
        const result = await this.$axios.get(`/vendor/jobs?token=${state.token}`);
        commit("SET_JOBS", result.data);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
};

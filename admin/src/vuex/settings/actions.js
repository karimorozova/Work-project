import Vue from "vue";

export const getSteps = async ({ commit, dispatch }) => {
    commit('startRequest')
    try {
        const result = await Vue.http.get('/api/steps');
        const allSteps = result.body.sort((a, b) => {
            if(a.title > b.title) return 1;
            if(a.title < b.title) return -1;
        });
        commit('SET_STEPS', allSteps);
        commit('endRequest');
    } catch(err) {
        commit('endRequest');
        dispatch('alertToggle', {message: err.body, isShow: true, type: "error"});
    }
}
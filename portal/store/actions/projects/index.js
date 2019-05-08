export const updateQuoteStatus = async function({ commit, dispatch }, payload) {
    try {
        const { quote, key } = payload;
        const result = await this.$axios.post('/portal/approve-reject', { quote, key });
        commit('REPLACE_QUOTE', {id: quote._id, updatedQuote: result.data});
        dispatch('alertToggle', {message: 'Quote status updated', isShow: true, type: 'success'});
    } catch(err) {
        dispatch('alertToggle', {message: err.response.data, isShow: true, type: 'error'});
    }
}

export const selectProject = ({ commit }, payload) => {
    commit('SET_PROJECT', payload)
}

export const updateTaskStatus = async function({commit, dispatch, state}, payload) {
    try {
        const { task } = payload;
        const updatedProject = await this.$axios.post('/portal/delivered', { task });
        dispatch('selectProject', updatedProject.data);
        let projects = [...state.projects]
        const index = projects.findIndex(item => item._id === state.selectedProject._id);
        projects.splice(index, 1, state.selectedProject);
        dispatch('setProjects', projects);
        dispatch('alertToggle', {message: 'Updated', isShow: true, type: 'success'});
    } catch(err) {
        dispatch('alertToggle', {message: err.response.data, isShow: true, type: 'error'});
    }
}
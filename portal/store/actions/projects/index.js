// export const updateQuoteStatus = async function({ commit, dispatch }, payload) {
//     try {
//         const { quote, key } = payload;
//         const result = await this.$axios.post('/portal/approve-reject', { quote, key });
//         commit('REPLACE_QUOTE', {id: quote._id, updatedQuote: result.data});
//         dispatch('alertToggle', {message: 'Quote status updated', isShow: true, type: 'success'});
//     } catch(err) {
//         dispatch('alertToggle', {message: err.response.data, isShow: true, type: 'error'});
//     }
// }

export const cancelQuote = async function({ commit, dispatch }, payload) {
    try {
        const { id, status } = payload;
        const result = await this.$axios.post('/portal/cancel-quote', { id })
        if(status !== "Requested") {
            commit('REPLACE_QUOTE', { id, updatedQuote: result.data});
            dispatch('selectProject', result.data);
        } else {
            commit('REMOVE_QUOTE', id)
        }
        dispatch('alertToggle', {message: 'Quote cancelled', isShow: true, type: 'success'});
    } catch(err) {
        dispatch('alertToggle', {message: err.response.data, isShow: true, type: 'error'});
    }
}

export const selectProject = ({ commit }, payload) => {
    commit('SET_PROJECT', payload)
}

export const updateTaskStatus = async function({commit, dispatch, state}, payload) {
    try {
        const { task, status } = payload;
        const updatedProject = await this.$axios.post('/portal/task-status', { task, status });
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
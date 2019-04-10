export const updateQuoteStatus = async function ({ commit, dispatch }, payload) {
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

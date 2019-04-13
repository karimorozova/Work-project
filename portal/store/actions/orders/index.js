export const setOrderDetail = ({commit}, payload) => {
    commit('SET_DETAIL', payload)
}

export const removeFile = ({commit}, payload) => {
    commit('REMOVE_FILE', payload)
}

export const submitForm = async function ({commit}, payload) {
    console.log(payload.service.title);
    console.log('submitted');
}
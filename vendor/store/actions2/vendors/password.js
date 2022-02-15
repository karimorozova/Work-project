export const setNewPassword = ({ commit }, payload) => {
    commit("SET_NEW_PASSWORD", payload)
}

export const setConfirmedPassword = ({ commit }, payload) => {
    commit("SET_CONFIRMED_PASSWORD", payload)
}
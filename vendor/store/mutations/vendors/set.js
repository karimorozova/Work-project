export const setApplicationData = (state, payload) => {
    state.applicationFormData = payload
}

export const SET_VENDOR = (state, payload) => {
    state.vendor = payload
}

export const SET_NEW_PASSWORD = (state, payload) => {
    state.newPassword.password = payload
}

export const SET_CONFIRMED_PASSWORD = (state, payload) => {
    state.newPassword.confirmedPassword = payload
}
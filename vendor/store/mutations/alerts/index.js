export const ALERTING_MESSAGE = (state, payload) => {
    state.alertMessage = payload.message;
    state.isAlert = payload.isShow;
    state.alertType = payload.type;
}
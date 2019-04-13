export const SET_DETAIL = (state, payload) => {
    const { prop, value } = payload;
    state.orderDetails = {...state.orderDetails, [prop]: value}
}

export const REMOVE_FILE = (state, payload) => {
    const { prop, index } = payload;
    let files = [...state.orderDetails[prop]];
    files.splice(index, 1);
    state.orderDetails = {...state.orderDetails, [prop]: files}
}
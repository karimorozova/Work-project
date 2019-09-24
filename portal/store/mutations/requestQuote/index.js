export const SET_REQUEST_DETAIL = (state, payload) => {
    const {prop, value} = payload;
    state.requestQuoteDetails = {...state.requestQuoteDetails, [prop]: value};
}

export const REMOVE_QUOTE = (state, payload) => {
    state.requests = state.requests.filter(item => item._id !== payload);
}
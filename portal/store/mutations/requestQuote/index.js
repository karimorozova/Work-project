export const SET_REQUEST_DETAIL = (state, payload) => {
    const {prop, value} = payload;
    state.requestQuoteDetails = {...state.requestQuoteDetails, [prop]: value};
}
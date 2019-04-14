export const SET_ORDER_DETAILS = (state, payload) => {
    state.orderDetails = {...payload}
}

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

export const SET_XTM_CUSTOMERS = (state, payload) => {
    state.xtmCustomers = [...payload];
}

export const ADD_XTM_CUSTOMER = (state, payload) => {
    state.xtmCustomers = [...state.xtmCustomers, payload]
}

export const SET_CLIENTS_XTM = (state, payload) => {
    state.clientInfo = {...state.clientInfo, xtmiId: payload.id}
}
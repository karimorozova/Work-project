export const DETAILS = (state, payload) => {
  state.orderDetails = payload
};

export const DETFILES_TO_DETAILS = (state, payload) => {
  if (payload.length) {
    state.orderDetails.detailFiles = [];
    for (let i = 0; i < payload.length; i++) {
      state.orderDetails.detailFiles.push(payload[i].name);
    }
  }
};

export const REFFILES_TO_DATAILS = (state, payload) => {
  if (payload) {
    state.orderDetails.refFiles = payload.name;
  }
};

export const ORDER_TYPE = (state, payload) => {
  state.orderDetails.requestType = payload;
};

export const LANGS = (state, payload) => {
  state.clientLanguages = payload
};

export const CLIENT_FOR_REQUEST = (state, payload) => {
  state.clientInfo = payload
};
export const SERVICES_FILL = (state, payload) => {
  state.services = payload
};

export const SES_COOK = (state, payload) => {
  state.session = payload
};

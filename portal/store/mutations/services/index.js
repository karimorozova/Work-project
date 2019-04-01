export const details = (state, payload) => {
  state.orderDetails = payload
};

export const detfilesToDetails = (state, payload) => {
  if (payload.length) {
    state.orderDetails.detailFiles = [];
    for (let i = 0; i < payload.length; i++) {
      state.orderDetails.detailFiles.push(payload[i].name);
    }
  }
};

export const reffilesToDetails = (state, payload) => {
  if (payload) {
    state.orderDetails.refFiles = payload.name;
  }
};

export const orderType = (state, payload) => {
  state.orderDetails.requestType = payload;
};

export const langs = (state, payload) => {
  state.clientLanguages = payload
};

export const clientForRequest = (state, payload) => {
  state.clientInfo = payload
};
export const servicesFill = (state, payload) => {
  state.services = payload
};

export const sesCook = (state, payload) => {
  state.session = payload
};

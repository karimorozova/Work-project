export const INCREASE_REQUEST = (state) => {
    state.currentRequests++;
};

export const DECREASE_REQUEST = (state) => {
    state.currentRequests--;
};

export const SET_REQUEST_ZERO = (state) => {
    state.currentRequests = 0;
}
  
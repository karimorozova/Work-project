export const setClientInfo = ({ state, dispatch }, payload) => {
  try {
    state.clientInfo = payload
  } catch (err) {
    dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
  }
};

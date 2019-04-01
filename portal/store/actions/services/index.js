export const loadOrderDetails = (context, payload) => {
  context.commit('details', payload)
};
export const loadLangs = (context, payload) => {
  context.commit('langs', payload)
};
export const requestInfo = (context, obj) => {
  context.commit('clientForRequest', obj)
};
export const servicesGetting = (context, arr) => {
  context.commit('servicesFill', arr)
};
export const jsession = (context, payload) => {
  context.commit('sesCook', payload)
};
export const files = (context, payload) => {
  context.commit('detfilesToDetails', payload)
};
export const referFiles = (context, payload) => {
  context.commit('reffilesToDetails', payload)
};
export const requestType = (context, payload) => {
  context.commit('orderType', payload)
};

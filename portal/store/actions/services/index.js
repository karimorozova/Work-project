export const loadOrderDetails = (context, payload) => {
  context.commit('DETAILS', payload)
};
export const loadLangs = (context, payload) => {
  context.commit('LANGS', payload)
};
export const requestInfo = (context, obj) => {
  context.commit('CLIENT_FOR_REQUEST', obj)
};
export const servicesGetting = (context, arr) => {
  context.commit('SERVICES_FILL', arr)
};
export const jsession = (context, payload) => {
  context.commit('SES_COOK', payload)
};
export const files = (context, payload) => {
  context.commit('DETFILES_TO_DETAILS', payload)
};
export const referFiles = (context, payload) => {
  context.commit('REFFILES_TO_DATAILS', payload)
};
export const requestType = (context, payload) => {
  context.commit('ORDER_TYPE', payload)
};

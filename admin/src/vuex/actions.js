export const incrementCounter = ({ commit }) => commit('INCREMENT_COUNTER');
export const servicesGetting = ({ commit }, payload) => commit('servicesFill', payload);
export const customersGetting = ({ commit }, payload) => commit('allCustomers', payload);
export const gettingClientLangs = ({ commit }, payload) => commit('customerlangs', payload);
export const allLanguages = ({ commit }, payload) => commit('allLangs', payload);
export const xtmCustomersGetting = ({ commit }, payload) => commit('allXtmCustomers', payload);
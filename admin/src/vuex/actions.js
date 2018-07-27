export const incrementCounter = ({ commit }) => commit('INCREMENT_COUNTER');
export const servicesGetting = ({ commit }, payload) => commit('servicesFill', payload);
export const customersGetting = ({ commit }, payload) => commit('allCustomers', payload);
export const gettingClientLangs = ({ commit }, payload) => commit('customerlangs', payload);
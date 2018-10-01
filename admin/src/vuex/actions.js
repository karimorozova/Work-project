export const incrementCounter = ({ commit }) => commit('INCREMENT_COUNTER');
export const loadingToggle = ({ commit }, payload) => commit('loadingValue', payload);
export const servicesGetting = ({ commit }, payload) => commit('servicesFill', payload);
export const customersGetting = ({ commit }, payload) => commit('allCustomers', payload);
export const gettingClientLangs = ({ commit }, payload) => commit('customerlangs', payload);
export const allLanguages = ({ commit }, payload) => commit('allLangs', payload);
export const xtmCustomersGetting = ({ commit }, payload) => commit('allXtmCustomers', payload);
export const duoRatesGetting = ({ commit }, payload) => commit('duoRatesFill', payload);
export const setAllProjects = ({ commit }, payload) => commit('allProjects', payload);
export const setCurrentProject = ({ commit }, payload) => commit('storeCurrentProject', payload);
export const setProjectValue = ({ commit }, payload) => commit('storeProjectValue', payload);
export const login = ({ commit }, creds) => {
    commit("LOGIN");
    return new Promise(resolve => {
      setTimeout(() => {
        let currentDate = new Date();
        let expiryDate = new Date(currentDate.getTime() + 60*60000);
        let object = {value: creds, timestamp: expiryDate}
        localStorage.setItem("token", JSON.stringify(object));
        commit("LOGIN_SUCCESS");
        resolve();
      }, 1000);
    });
  };
export const logout = ({ commit }) => {
    localStorage.removeItem("token");
    commit("LOGOUT");
  }
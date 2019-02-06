import Vue from "vue";

export const incrementRequestCounter = ({ commit }) => commit('startRequest');
export const decrementRequestCounter = ({ commit }) => commit('endRequest');
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
export const setStepDate = ({ commit }, payload) => commit('stepDateStore', payload);
export const removeStepVendor = ({ commit }, payload) => commit('stepVendorDelete', payload)
export const vendorsSetting = ({ commit }, payload) => commit('allVendors', payload);
export const setStepVendor = async ({ commit, state }, payload) => {
  commit('startRequest')
  try {
    const { vendor, index } = payload;
    let step = state.currentProject.steps[index];
    const updatedProject = await Vue.http.post('/service/step-payables', {projectId: state.currentProject._id, step: {...step, vendor}, index});
    console.log(updatedProject.body);
    await commit('storeCurrentProject', updatedProject.body);
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.message);
  }
};

export const updateCurrentProject = async ({ commit, state }, payload) => {
  commit('startRequest')
  try {
    const updatedProject = await Vue.http.post('/xtm/update-project', {...payload});
    const index = state.projects.findIndex(item => item._id === updatedProject.data._id);
    state.projects[index] = updatedProject.data;
    await commit('storeCurrentProject', updatedProject.data);
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.message);
  }
}
export const addProjectTasks = async ({ commit }, payload) => {
  commit('startRequest');
  try {
    const updatedProject = await Vue.http.post('/xtm/add-tasks', payload);
    await commit('storeCurrentProject', updatedProject.data);
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.message);
  }
}
export const updateMatrix = async ({ commit }, payload) => {
  commit('startRequest')
  commit('updateMatrixData', payload);
  try {
    const updatedProject = await Vue.http.post('/xtm/update-matrix', {...payload});
    await commit('storeCurrentProject', updatedProject.data);
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.message);
  }
};
export const alertToggle = ({ commit }, payload) => {
  commit('alertingMessage', payload);
  setTimeout(() => {
    commit('alertingMessage', {message: "", isShow: false, type: "success"});
  }, 5000)
}
export const login = ({ commit }, token) => {
    commit("LOGIN");
    commit('startRequest')
    return new Promise(resolve => {
      setTimeout(() => {
        let currentDate = Date.now();
        let expiryTime = currentDate + 60000*120;
        let object = {value: token, timestamp: expiryTime}
        localStorage.setItem("token", JSON.stringify(object));
        commit("LOGIN_SUCCESS");
        commit('endRequest');
        resolve();
      }, 1000);
    });
  };
export const logout = ({ commit }) => {
    localStorage.removeItem("token");
    commit("LOGOUT");
}
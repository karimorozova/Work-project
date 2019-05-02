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
export const getServices = async ({ commit, dispatch }) => {
  commit('startRequest')
  try {
    const result = await Vue.http.get('/api/services');
    const allServices = result.body;
    allServices.sort((a, b) => {return a.sortIndex - b.sortIndex});
    dispatch('servicesGetting', allServices);
    commit('endRequest');
  } catch(err) {
      commit('endRequest');
      dispatch('alertToggle', {message: err.body, isShow: true, type: "error"});
  }
}
export const setProjectStatus = async ({commit, state}, payload) => {
  commit('startRequest')
  try {
    const { status } = payload;
    const id = state.currentProject._id;
    const updatedProject = await Vue.http.put("/pm-manage/project-status", { id, status });
    await commit('storeCurrentProject', updatedProject.body);
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.body);
  }
}
export const setStepsStatus = async ({ commit, state }, payload) => {
  commit('startRequest')
  try {
    const { status, steps } = payload;
    const id = state.currentProject._id;
    const filteredSteps = steps.filter(item => item.status === 'Request Sent' || item.status === 'Rejected' || item.status === 'Created');
    if(filteredSteps.length) {
      const updatedProject = await Vue.http.post('/pm-manage/step-status', { id, status, steps: filteredSteps });
      await commit('storeCurrentProject', updatedProject.body);
    }
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.message);
  }
}
export const setStepVendor = async ({ commit, state }, payload) => {
  commit('startRequest')
  try {
    const { vendor, index } = payload;
    let step = state.currentProject.steps[index];
    const updatedProject = await Vue.http.post('/service/step-payables', {projectId: state.currentProject._id, step: {...step, vendor}, index});
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
}

export const updateReport = async ({ commit }, payload) => {
  commit('startRequest');
  try {
    const { id, notes, isWorkingDay } = payload;
    await Vue.http.post('/zoho/report', { id, notes, isWorkingDay });
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.message);
  }
}

export const sendClientQuote = async ({commit, state}, payload) => {
  commit('startRequest');
  try { 
    const { message } = payload;
    const updatedProject = await Vue.http.post('/pm-manage/send-quote', {id: state.currentProject._id, message});
    await commit('storeCurrentProject', updatedProject.data);
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.message);
  }
}

export const sendProjectDetails = async ({commit, state}, payload) => {
  commit('startRequest');
  try { 
    const { message } = payload;
    await Vue.http.post('/pm-manage/project-details', {id: state.currentProject._id, message});
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.message);
  }
} 

export const saveUser = async ({ commit }, payload) => {
  commit('startRequest');
  try {
    await Vue.http.post('/user', payload);
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.body);
  }
}

export const removeUser = async ({ commit, dispatch }, payload) => {
  commit('startRequest');
  try {
    const result = await Vue.http.delete(`/user/${payload}`, {body: {token: localStorage.getItem("token")}});
    if(result.body === "logout") {
      dispatch("logout");
    }
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err.body);
  }
}

export const alertToggle = ({ commit }, payload) => {
  commit('alertingMessage', payload);
  setTimeout(() => {
    commit('alertingMessage', {message: "", isShow: false, type: "success"});
  }, 5000)
}

export const login = ({ commit, state }, payload) => {
  commit('startRequest')
  return new Promise(resolve => {
    const {token, group, firstName, lastName, photo} = payload;
    state.userGroup = group;
    state.user = {firstName, lastName, photo}; 
    setTimeout(() => {
      let currentDate = Date.now();
      let expiryTime = currentDate + 60000*120;
      let object = {value: token, timestamp: expiryTime}
      localStorage.setItem("token", JSON.stringify(object));
      commit('endRequest');
      resolve();
    }, 1000);
  });
};

export const logout = ({ commit }) => {
    localStorage.removeItem("token");
}

export const setUser = async ({commit, state}) => {
  commit('startRequest')
  try {
    const key = JSON.parse(localStorage.getItem("token"));
    const result = await Vue.http.get(`/user?key=${key.value}`);
    state.user = result.data;
    state.userGroup = result.data.group;
    commit('endRequest');
  } catch(err) {
    commit('endRequest');
    throw new Error(err)
  }
}
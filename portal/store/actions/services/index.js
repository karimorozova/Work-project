export const loadOrderDetails = ({commit}, payload) => {
  commit('DETAILS', payload)
};

export const loadLangs = ({commit}, payload) => {
  commit('LANGS', payload)
};

export const requestInfo = ({commit}, obj) => {
  commit('CLIENT_FOR_REQUEST', obj)
};

export const servicesGetting = ({commit}, arr) => {
  commit('SERVICES_FILL', arr)
};

export const files = ({commit}, payload) => {
  commit('DETFILES_TO_DETAILS', payload)
};

export const referFiles = ({commit}, payload) => {
  commit('REFFILES_TO_DATAILS', payload)
};

export const requestType = ({commit}, payload) => {
  commit('ORDER_TYPE', payload)
};

export const getProjectsAndRequests = async function({ commit, dispatch, state}) {
  try {
    const result = await this.$axios.get(`/portal/projects?token=${state.token}`);
    let { client, user, projects, memoqProjects, requests } = result.data;
    projects.push(...memoqProjects);
    projects = projects.sort((a, b) => b.startDate - a.startDate);
    commit('SET_PROJECTS', projects);
    commit('SET_REQUESTS', requests);
    commit('SET_USER', user);
    commit('SET_CLIENT', client);
    dispatch('setLangCombinations', client);
  } catch(err) {
      console.log(err);
      dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
  }
}

export const setLangCombinations = ({ commit }, payload) => {
  commit('SET_DUO_COMBINATIONS', {combs: payload.wordsRates, prop: 'wordsRates'});
  commit('SET_DUO_COMBINATIONS', {combs: payload.hoursRates, prop: 'hoursRates'});
  commit('SET_MONO_COMBINATIONS', payload.monoRates);
}

export const setProjects = ({commit}, payload) => {
  commit('SET_PROJECTS', payload)
};

export const saveAccountDetails = async function({ commit, dispatch, state }, payload) {
    let formData = new FormData();
    for(let key in payload) {
        formData.append(key, payload[key])
    }
    formData.append('token', state.token);
    try {
      const result = await this.$axios.post('/portal/account-details', formData);
      const { user } = result.data;
        commit('SET_USER', user);
    } catch(err) {
        console.log(err);
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}

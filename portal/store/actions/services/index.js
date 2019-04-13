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

export const getProjects = async function({ commit, dispatch, state}) {
  try {
      const result = await this.$axios.get(`/portal/projects?token=${state.token}`);
      const { client, user, projects } = result.data; 
      commit('SET_PROJECTS', projects);
      commit('SET_USER', user);
      commit('SET_CLIENT', client);
      dispatch('setLangCombinations', client);
  } catch(err) {
      dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
  }
}

export const setLangCombinations = ({ commit }, payload) => {
  const combinations = payload.languageCombinations.filter(item => item.source).map(item => {
      return {source: item.source, target: item.target}
  })
  const defaultOrderSource = combinations.map(item => item.source).find(item => item.symbol === 'EN-GB');
  commit('SET_COMBINATIONS', combinations);
  commit('SET_DETAIL', {prop: 'source', value: defaultOrderSource});
}

export const setProjects = ({commit}, payload) => {
  commit('SET_PROJECTS', payload)
};

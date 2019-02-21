export default ({ commit }, payload) => {
    commit('ALERTING_MESSAGE', payload);
    setTimeout(() => {
      commit('ALERTING_MESSAGE', {message: "", isShow: false, type: "success"});
    }, 5000)
  }
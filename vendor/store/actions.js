export const storeLanguages = ({ commit }, payload) => commit('allLangs', payload);
export const getAllLanguages = async ({ commit }) => {
  const result = await this.$axios.$get('api/languages');
  commit('allLangs', result);  
};

export const storeLanguages = ({ commit }, payload) => commit('allLangs', payload);
export const getAllLanguages = async function({ commit }) {
  console.log('here');
  let result = await this.$axios.$get('api/languages');
  result.sort( (a,b) => {
    if(a.lang < b.lang) return -1;
    if(a.lang > b.lang) return 1;
  })
  commit('allLangs', result);  
};

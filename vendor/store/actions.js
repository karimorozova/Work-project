export const storeLanguages = ({ commit }, payload) => commit('allLangs', payload);
export const getAllLanguages = async function({ commit }) {
  let result = await this.$axios.$get('api/languages');
  result.sort( (a,b) => {
    if(a.lang < b.lang) return -1;
    if(a.lang > b.lang) return 1;
  })
  commit('allLangs', result);  
};
export const getAllTimezones = async function({ commit }) {
  let result = await this.$axios.$get('api/timezones');
  result.sort( (a,b) => {
    if(a.zone < b.zone) return 1;
    if(a.zone > b.zone) return -1;
  });
  commit('allTimezones', result);
}

import { SET_ALL_TIMEZONES } from "../../mutation-types"
export default async function ({ commit }) {
    let result = await this.$axios.$get('api/timezones');
    result.sort( (a,b) => {
      if(a.zone < b.zone) return 1;
      if(a.zone > b.zone) return -1;
    });
    commit(SET_ALL_TIMEZONES, result);
  }
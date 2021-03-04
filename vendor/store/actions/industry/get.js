import { SET_ALL_INDUSTRY } from "../../mutation-types";
export default async function({ commit }) {
  let result = await this.$axios.$get("/api/industries");
  result.sort((a, b) => {
    if (a.lang < b.lang) return -1;
    if (a.lang > b.lang) return 1;
  });
  commit(SET_ALL_INDUSTRY, result);
}

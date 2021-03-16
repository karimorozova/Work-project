import { SET_ALL_STEPS } from "../../mutation-types";
export default async function({ commit }) {
  let result = await this.$axios.$get("/api/steps");
  result.sort((a, b) => {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
  });
  commit(SET_ALL_STEPS, result);
}

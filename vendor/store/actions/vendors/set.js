import { SET_APPLICATION_DATA } from "../../mutation-types";

export const setApplicationForm = ( { commit }, payload ) => {
    commit(SET_APPLICATION_DATA, payload)
}

export const setAccountInfo = ({ commit }) => {
    commit("SET_ACCOUNT_INFO");
    commit("SET_NEW_PASSWORD", "");
    commit("SET_CONFIRMED_PASSWORD", "");
}

export const setAccountProp = ({ commit }, payload) => {
    commit("SET_ACCOUNT_PROP", payload)
}
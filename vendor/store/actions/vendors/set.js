import { SET_APPLICATION_DATA } from "../../mutation-types";

export const setApplicationForm = ( { commit }, payload ) => {
    commit(SET_APPLICATION_DATA, payload);
}

export const setAccountInfo = ({ commit }) => {
    commit("SET_ACCOUNT_INFO");
    commit("SET_NEW_PASSWORD", "");
    commit("SET_CONFIRMED_PASSWORD", "");
}

export const setAccountProp = ({ commit }, payload) => {
    commit("SET_ACCOUNT_PROP", payload);
}

export const setVendorProp = ({ commit }, payload) => {
  commit("SET_VENDOR_PROP", payload);
}

export const setVendorBillingInfo = async ({ commit }, payload) => {
    console.log({ payload })
    commit("SET_BILLING_INFO", payload.billingInfo);
}

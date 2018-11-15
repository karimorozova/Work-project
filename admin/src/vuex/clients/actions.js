import Vue from "vue";

export const getAllClients = async ({commit}) => {
    try {
        const result = await Vue.http.get('/all-clients');
        commit('allCustomers', result.body);
    } catch(err) {
        throw err
    }
}
export const addNewClient = ({commit, rootState}, payload) => {
    rootState.a.customers.push(payload);
}
export const storeClient = ({commit, rootState}, payload) => {
    const index = rootState.a.customers.findIndex(item => item._id === payload._id);
    rootState.a.customers[index] = payload;
}
export const removeClient = ({commit, rootState}, payload) => {
    const index = rootState.a.customers.findIndex(item => item._id === payload);
    rootState.a.customers.splice(index, 1);
}
export const storeCurrentClient = ({commit}, payload) => commit('setCurrentClient', payload);
export const storeClientProperty = ({commit}, payload) => commit('setClientProperty', payload);
export const storeClientContact = ({commit}, payload) => commit('addContact', payload);
export const updateClientContact = ({commit}, payload) => commit('updateContact', payload);
export const updateLeadContact = ({commit}, payload) => commit('setLeadContact', payload);
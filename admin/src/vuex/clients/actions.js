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
export const storeClientDuoRates = ({commit}, payload) => commit('setDuoRates', payload);
export const storeClientMonoRates = ({commit}, payload) => commit('setMonoRates', payload);
export const storeServiceWhenAddSeveral = ({commit}, payload) => commit('setServiceWhenAddSeveral', payload);
export const getClientDuoCombinations = async ({commit}, payload) => {
    try {
    const result = await Vue.http.get(`/clientsapi/get-rates?form=Duo&service=${payload.serviceTitle}&clientId=${payload.clientId}`);
    commit('setClientDuoRates', result.body);
    } catch(err) {
        throw new Error("Error on getting Duo rates")
    }
}
export const getClientMonoCombinations = async ({commit}, payload) => {
    try {
    const result = await Vue.http.get(`/clientsapi/get-rates?form=Mono&service=${payload.serviceTitle}&clientId=${payload.clientId}`);
    commit('setClientMonoRates', result.body);
    } catch(err) {
        throw new Error("Error on getting Mono rates")
    }
}
export const deleteClientRate = async ({commit}, payload) => {
    try {
        await Vue.http.delete(`/clientsapi/rate/${payload.id}`, {body: payload.deletedRate});
    } catch(err) {
        throw new Error("Error on deleting rate");
    }
}
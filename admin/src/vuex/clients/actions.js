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
export const storeClientDuoRates = ({commit}, payload) => commit('setClientDuoRates', payload);
export const storeClientMonoRates = ({commit}, payload) => commit('setClientMonoRates', payload);
export const storeServiceWhenAddSeveral = ({commit}, payload) => commit('setServiceWhenAddSeveral', payload);
export const getClientDuoCombinations = async ({commit, state}, payload) => {
    commit("startRequest");
    try {
        const id = state.currentClient._id;
        const result = await Vue.http.get(`/clientsapi/rates?form=Duo&clientId=${id}`);
        commit('setClientDuoRates', result.body);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on getting Duo rates")
    }
}
export const getClientMonoCombinations = async ({commit, state}, payload) => {
    commit("startRequest");
    try {
        const id = state.currentClient._id;
        const result = await Vue.http.get(`/clientsapi/rates?form=Mono&clientId=${id}`);
        commit('setClientMonoRates', result.body);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on getting Mono rates")
    }
}
export const saveClientRates = async ({commit, state}, payload) => {
    commit("startRequest");
    try {
        const ratesInfo = { ...payload, clientId: state.currentClient._id}
        const result = await Vue.http.post('/clientsapi/rates', { ratesInfo });
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on deleting rate");
    }
}
export const deleteClientRate = async ({commit}, payload) => {
    try {
        await Vue.http.delete(`/clientsapi/rate/${payload.id}`, {body: payload.deletedRate});
    } catch(err) {
        throw new Error("Error on deleting rate");
    }
}
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
    const customers = rootState.a.customers.map(item => item);
    const index = customers.findIndex(item => item._id === payload._id);
    customers.splice(index, 1, payload);
    rootState.a.customers = [...customers];
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
export const storeServiceWhenAddSeveral = ({commit}, payload) => commit('setServiceWhenAddSeveral', payload);

export const saveClientRates = async ({commit, dispatch, state}, payload) => {
    commit("startRequest");
    try {
        const clientId = state.currentClient._id;
        const result = await Vue.http.post('/clientsapi/rates', { clientId, ...payload });
        dispatch('storeCurrentClient', result.body);
    } catch(err) {
        dispatch('alertToggle', {message: err.response.data, isShow: true, type: "error"});
    } finally {
        commit("endRequest");
    }
}
export const deleteClientRate = async ({commit, dispatch}, payload) => {
    commit('startRequest');
    try {
        const { id, prop } = payload;
        const clientId = state.currentClient._id;
        const result = await Vue.http.post('/clientsapi/remove-rate', { clientId, rateId: id, prop });
        dispatch("storeCurrentClient", result.body);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow:true, type: "error"});
    } finally {
        commit('endRequest');
    }
}

export const deleteClientRates = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    try {
        const { checkedIds, prop } = payload;
        const clientId = state.currentClient._id;
        const result = await Vue.http.post('/clientsapi/remove-rates', { clientId, checkedIds, prop });
        dispatch("storeCurrentClient", result.body);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow:true, type: "error"});
    } finally {
        commit('endRequest');
    }
}

export const updateClientRate = async ({commit, dispatch}, payload) => {
    commit("startRequest");
    try {
        const { step, rate } = payload;
        const updatedClient = await Vue.http.post("/clientsapi/combination", { step, rate });
        dispatch("storeClient", updatedClient.body);
    } catch(err) {
        dispatch('alertToggle', {message: err.response.data, isShow: true, type: "error"});
    } finally {
        commit("endRequest");
    }
}
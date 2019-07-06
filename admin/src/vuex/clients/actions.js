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
    rootState.a.customers.splice(index, 1, payload);
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
export const getClientDuoCombinations = async ({commit, dispatch, state}) => {
    commit("startRequest");
    try {
        const id = state.currentClient._id;
        const result = await Vue.http.get(`/clientsapi/rates?form=Duo&clientId=${id}`);
        const rates = result.body.sort((a, b) => {
            if(a.sourceLanguage.lang < b.sourceLanguage.lang) return -1;
            if(a.sourceLanguage.lang > b.sourceLanguage.lang) return 1;
        })
        dispatch('storeClientDuoRates', rates);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on getting Duo rates")
    }
}
export const getClientMonoCombinations = async ({commit, dispatch, state}) => {
    commit("startRequest");
    try {
        const id = state.currentClient._id;
        const result = await Vue.http.get(`/clientsapi/rates?form=Mono&clientId=${id}`);
        const rates = result.body.sort((a, b) => {
            if(a.targetLanguage.lang < b.targetLanguage.lang) return -1;
            if(a.targetLanguage.lang > b.targetLanguage.lang) return 1;
        })
        dispatch('storeClientMonoRates', rates);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on getting Mono rates")
    }
}
export const saveClientRates = async ({commit, dispatch, state}, payload) => {
    commit("startRequest");
    try {
        const ratesInfo = { ...payload, clientId: state.currentClient._id}
        const result = await Vue.http.post('/clientsapi/rates', { ratesInfo });
        dispatch('storeCurrentClient', result.body);
        ratesInfo.languageForm === "Duo" ? await dispatch('getClientDuoCombinations') : await dispatch('getClientMonoCombinations');
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on saving rate");
    }
}
export const deleteClientRate = async ({commit, dispatch}, payload) => {
    commit("startRequest");
    try {
        await dispatch('deleteClientsCheckedRate', payload);
        const { languageForm } = payload.deletedRate;
        languageForm === "Duo" ? await dispatch('getClientDuoCombinations') : await dispatch('getClientMonoCombinations');
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on deleting rate");
    }
}

export const deleteClientsCheckedRate = async ({commit, dispatch, state}, payload) => {
    commit("startRequest");
    try {
        const deletedRate = { ...payload.deletedRate, clientId: state.currentClient._id};
        const result = await Vue.http.delete(`/clientsapi/rate/${payload.id}`, {body: deletedRate});
        dispatch('storeCurrentClient', result.body);
        commit("endRequest");
    } catch(err) {
        commit("endRequest");
        throw new Error("Error on deleting rate");
    }
}

export const updateClientRate = async ({commit, dispatch}, payload) => {
    commit("startRequest");
    try {
        const { step, rate } = payload;
        const updatedClient = await Vue.http.post("/clientsapi/combination", { step, rate });
        dispatch("storeClient", updatedClient.body);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        commit("endRequest");
    }
}
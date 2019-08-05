import Vue from "vue";

export const addFinanceProperty = ({commit, rootState}, payload) => {
    rootState.a.currentProject.finance = {...rootState.a.currentProject.finance, 'Select': payload};
};
export const storeDuoRates = ({commit}, payload) => commit('setDuoRates', payload);
export const storeMonoRates = ({commit}, payload) => commit('setMonoRates', payload);
export const storePricelists = ({commit}, payload) => commit('setPricelists', payload);
export const storeServiceWhenAddSeveral = ({commit}, payload) => commit('setServiceWhenAddSeveral', payload);
export const getDuoCombinations = async ({commit, state}, payload) => {
    commit('startRequest');
    try {
        const id = state.currentPrice._id;
        const result = await Vue.http.get(`/service/parsed-rates?form=Duo&id=${id}`);
        const rates = result.body.sort((a, b) => {
            if(a.sourceLanguage.lang < b.sourceLanguage.lang) return -1;
            if(a.sourceLanguage.lang > b.sourceLanguage.lang) return 1;
        })
        commit('setDuoRates', rates);
        commit('endRequest');
    } catch(err) {
        commit('endRequest');
        throw new Error("Error on getting Duo rates");
    }
}
export const getMonoCombinations = async ({commit, state}, payload) => {
    commit('startRequest');
    try {
        const id = state.currentPrice._id;
        const result = await Vue.http.get(`/service/parsed-rates?form=Mono&id=${id}`);
        const rates = result.body.sort((a, b) => {
            if(a.targetLanguage.lang < b.targetLanguage.lang) return -1;
            if(a.targetLanguage.lang > b.targetLanguage.lang) return 1;
        })
        commit('setMonoRates', rates);
        commit('endRequest');
    } catch(err) {
        commit('endRequest');
        throw new Error("Error on getting Mono rates");
    }
}

export const saveMonoRates = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    const priceId = state.currentPrice._id;
    try {
        const result = await Vue.http.post('/rates-manage/combination', { priceId, ...payload, prop: 'monoRates' });
        commit("setCurrentPrice", result.body);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow:true, type: "error"});
    } finally {
        commit('endRequest');
    }
}
export const deletePriceRate = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    try {
        const { id, prop } = payload;
        const priceId = state.currentPrice._id;
        const updatedPrice = await Vue.http.post('/rates-manage/remove-rate', { priceId, rateId: id, prop });
        commit("setCurrentPrice", updatedPrice.body);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow:true, type: "error"});
    } finally {
        commit('endRequest');
    }
}
export const deletePriceRates = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    try {
        const { checkedIds, prop } = payload;
        const priceId = state.currentPrice._id;
        const updatedPrice = await Vue.http.post('/rates-manage/remove-rates', { priceId, checkedIds, prop });
        commit("setCurrentPrice", updatedPrice.body);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow:true, type: "error"});
    } finally {
        commit('endRequest');
    }
}
export const storeCurrentPrice = ({commit}, payload) => commit('setCurrentPrice', payload);
export const setAllMonoStepsForRates = ({commit, state}, payload) => {
    const combinations = state.monoRates.map(item => {
        for(let id of payload) {
            if(Object.keys(item.rates).indexOf(id) === -1) {
                item.rates[id] = { value: 0, min: 5, active: false }
            }
        }
        item.isChecked = false;
        return item;
    })
    commit("setMonoRates", combinations);
}
export const toggleRateCheck = ({commit, state}, payload) => {
    const { prop, id, isChecked } = payload;
    const combinations = state[prop].map(item => {
        if(item._id === id) {
            item.isChecked = isChecked;
        }
        return item;
    })
    prop === 'monoRates' ? commit("setMonoRates", combinations) : commit("setDuoRates", combinations);
}
export const toggleAllRatesCheck = ({commit, state}, payload) => {
    const { prop, isChecked } = payload;
    const combinations = state[prop].map(item => {
        item.isChecked = isChecked;
        return item;
    })
    prop === 'monoRates' ? commit("setMonoRates", combinations) : commit("setDuoRates", combinations);
}
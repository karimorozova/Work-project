import Vue from "vue";

export const addFinanceProperty = ({commit, rootState}, payload) => {
    rootState.a.currentProject.finance = {...rootState.a.currentProject.finance, 'Select': payload};
};
// export const storeWordsRates = ({commit}, payload) => commit('setWordsRates', payload);
// export const storeHoursRates = ({commit}, payload) => commit('setHoursRates', payload);
// export const storeMonoRates = ({commit}, payload) => commit('setMonoRates', payload);
export const storePriceRates = ({commit}, payload) => commit('SET_PRICE_RATES', payload);
export const storePricelists = ({commit}, payload) => commit('setPricelists', payload);
export const storeServiceWhenAddSeveral = ({commit}, payload) => commit('setServiceWhenAddSeveral', payload);

export const addSeveralMonoRates = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    try {
        const priceId = state.currentPrice._id;
        const { ratesData } = payload;
        const updatedPrice = await Vue.http.post('/rates-manage/several-mono', { ratesData, priceId });
        commit('setCurrentPrice', updatedPrice.body);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow:true, type: "error"});
    } finally {
        commit('endRequest');
    }
}

export const savePricelistRates = async ({commit, dispatch, state}, payload) => {
    commit('startRequest');
    const priceId = state.currentPrice._id;
    try {
        const result = await Vue.http.post('/rates-manage/combination', { priceId, ...payload });
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
export const setAllDuoStepsForRates = ({commit, state}, payload) => {
    const { prop, stepIds } = payload;
    const combinations = state[prop].map(item => {
        for(let id of stepIds) {
            if(Object.keys(item.rates).indexOf(id) === -1) {
                item.rates[id] = { value: 0, min: 5, active: false }
            }
        }
        item.isChecked = false;
        return item;
    })
    if(prop === 'monoRates') {
        commit("setMonoRates", combinations);
    } else {
        prop === 'wordsRates' ? commit("setWordsRates", combinations): commit("setHoursRates", combinations);
    }
}
export const toggleRateCheck = ({commit, state}, payload) => {
    const { prop, id, isChecked } = payload;
    const combinations = state[prop].map(item => {
        if(item._id === id) {
            item.isChecked = isChecked;
        }
        return item;
    })
    if(prop === 'monoRates') {
        commit("setMonoRates", combinations);
    } else {
        prop === 'wordsRates' ? commit("setWordsRates", combinations): commit("setHoursRates", combinations);
    }
}
export const toggleAllRatesCheck = ({commit, state}, payload) => {
    const { prop, isChecked } = payload;
    const combinations = state[prop].map(item => {
        item.isChecked = isChecked;
        return item;
    })
    prop === 'monoRates' ? commit("setMonoRates", combinations) : commit("setDuoRates", combinations);
}
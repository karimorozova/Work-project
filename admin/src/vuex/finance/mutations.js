export const mutations = {
    SET_PRICE_RATES(state, payload) {
        const { prop, value } = payload;
        state[prop] = value.sort((a,b) => {
            if(a.target.lang > b.target.lang) return 1;
            if(a.target.lang < b.target.lang) return -1;
        });
    },
    setServiceWhenAddSeveral(state, payload) {
        state.serviceWhenAddSeveral = payload
    },
    setCurrentPrice(state, payload) {
        state.currentPrice = {...payload};
    },
    setPricelists(state, payload) {
        state.pricelists = payload;
    }
}

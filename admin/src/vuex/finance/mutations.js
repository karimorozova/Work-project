export const mutations = {
    setDuoRates(state, payload) {
        state.duoRates = payload.sort((a,b) => {
            if(a.target.lang > b.target.lang) return 1;
            if(a.target.lang < b.target.lang) return -1;
        });;
    },
    setMonoRates(state, payload) {
        state.monoRates = payload.sort((a,b) => {
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

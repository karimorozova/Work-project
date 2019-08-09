export const mutations = {
    setWordsRates(state, payload) {
        state.wordsRates = payload.sort((a,b) => {
            if(a.target.lang > b.target.lang) return 1;
            if(a.target.lang < b.target.lang) return -1;
        });;
    },
    setHoursRates(state, payload) {
        state.hoursRates = payload.sort((a,b) => {
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

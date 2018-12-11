export const mutations = {
    setDuoRates(state, payload) {
        state.duoRates = payload;
    },
    setMonoRates(state, payload) {
        state.monoRates = payload;
    },
    setServiceWhenAddSeveral(state, payload) {
        state.serviceWhenAddSeveral = payload
    },
    setCurrentPrice(state, payload) {
        state.currentPrice = {...payload};
    }
}

export const mutations = {
    // setFinanceProperty(state, rootState) {
    //     rootState.a.currentProject.finance.Select = {receivables: ""};
    // }
    setDuoRates(state, payload) {
        state.duoRates = payload;
    },
    setMonoRates(state, payload) {
        state.duoRates = payload;
    },
    setServiceWhenAddSeveral(state, payload) {
        state.serviceWhenAddSeveral = payload
    }
}

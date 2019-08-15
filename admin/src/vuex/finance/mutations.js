export const mutations = {
    SET_PRICE_RATES(state, payload) {
        const { prop, value } = payload;
        state[prop] = value;
    },
    SORT_RATES(state, payload) {
        if(state[payload].length) {
            if(payload === 'monoRates') {
                state[payload] = state[payload].sort((a,b) => {
                    if(a.target.lang > b.target.lang) return 1;
                    if(a.target.lang < b.target.lang) return -1;
                });
            } else {
                state[payload] = state[payload].sort((a,b) => {
                    if(a.source.lang === b.source.lang) {
                        return a.target.lang > b.target.lang ? 1 : -1
                    } else {
                        return a.source.lang > b.source.lang ? 1 : -1
                    }
                })
            }
        }
    },
    setCurrentPrice(state, payload) {
        state.currentPrice = {...payload};
    },
    setPricelists(state, payload) {
        state.pricelists = payload;
    }
}

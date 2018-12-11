import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    counter: 0,
    duoRates: [],
    monoRates: [],
    serviceWhenAddSeveral: "",
    currentPrice: {},
}

export const finance = {
    state,
    actions,
    mutations,
    getters
}
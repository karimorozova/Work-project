import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    currentVendor: {},
    vendorDuoRates: [],
    vendorMonoRates: [],
}

export const vendors = {
    state,
    actions,
    mutations,
    getters
}
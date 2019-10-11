import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    currentVendor: {},
    filteredVendors: []
}

export const vendors = {
    state,
    actions,
    mutations,
    getters
}
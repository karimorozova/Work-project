import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    services: [],
    customers: [],
    xtmCustomers: [],
    languages: [],
    clientLangs: [],
    vendors: [],
    duoRates: [],
    projects: [],
    currentProject: {},
    isLoggedIn: !!localStorage.getItem("token"),
    isLoading: false,
    isAlert: false,
    alertType: 'success',
    alertMessage: '',
    requestCounter: 0
};

export const overall = {
    state,
    actions,
    mutations,
    getters
}
import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    languages: [],
    steps: [],
    industries: [],
    vendorsForProject: [],
    services: [],
    units: [],
    customers: [],
    users: [],

    clientLangs: [],
    vendors: [],
    duoRates: [],
    projects: [],
    currentProject: {},
    userGroup: "",
    isLoggedIn: !!localStorage.getItem("token"),
    isLoading: false,
    isAlert: false,
    alertType: 'success',
    alertMessage: '',
    requestCounter: 0,
    currentVendor: {},
    user: {},
    tiersInfo: {}
};

export const generalStore = {
    state,
    actions,
    mutations,
    getters
}

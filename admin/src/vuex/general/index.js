import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    languages: [],
    steps: [],
    industries: [],
    vendorsForProject: [],
    services: [],
    customers: [],
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
    tiersInfo: {
        1:[
            {
                minWordCount: 100000,
                allowSteps: ['tqi','lqa1', 'lqa2', 'lqa3']
            },
            {
                minWordCount: 50000,
                allowSteps: ['tqi','lqa1', 'lqa2']
            },
            {
                minWordCount: 10000,
                allowSteps: ['tqi','lqa1']
            },
            {
                minWordCount: 0,
                allowSteps: ['tqi'],
            },
        ],
        2:[
            {
                minWordCount: 50000,
                allowSteps: ['tqi','lqa1', 'lqa2', 'lqa3']
            },
            {
                minWordCount: 25000,
                allowSteps: ['tqi','lqa1', 'lqa2']
            },
            {
                minWordCount: 5000,
                allowSteps: ['tqi','lqa1']
            },
            {
                minWordCount: 0,
                allowSteps: ['tqi'],
            },
        ],
        3:[
            {
                minWordCount: 10000,
                allowSteps: ['tqi','lqa1', 'lqa2', 'lqa3']
            },
            {
                minWordCount: 5000,
                allowSteps: ['tqi','lqa1', 'lqa2']
            },
            {
                minWordCount: 1000,
                allowSteps: ['tqi','lqa1']
            },
            {
                minWordCount: 0,
                allowSteps: ['tqi'],
            },
        ],
    }
};

export const generalStore = {
    state,
    actions,
    mutations,
    getters
}

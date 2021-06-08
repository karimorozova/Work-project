import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    tasksData: {},
    clientsRequests: [],
    currentClientsRequest: {},
};

export const clientsRequests = {
    state,
    actions,
    mutations,
    getters
}
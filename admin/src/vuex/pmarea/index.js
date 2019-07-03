import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    requests: [],
    tasksData: {}
};

export const pmarea = {
    state,
    actions,
    mutations,
    getters
}
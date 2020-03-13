import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    requests: [],
    tasksData: {},
    memoqProjectMessages: {
        memoqProject: "Creating Project in memoQ ...",
        memoqFiles: "Importing files to the Project in memoQ ...",
        dbTasks: "Adding tasks to the Project in DB ...",
        dbSteps: "Adding steps to the Project  in DB ..."
    },
    memoqProjectMessage: "",
    fileCounter: 0
};

export const pmarea = {
    state,
    actions,
    mutations,
    getters
}
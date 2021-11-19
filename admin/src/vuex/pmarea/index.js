import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    requests: [],
    tasksData: {},
    // memoqProjectMessages: {
    //     memoqProject: "Creating project in Memoq...",
    //     memoqFiles: "Uploading files in Memoq...",
    //     dbFiles: "Downloading metrics...",
    //     dbTasks: "Creating tasks...",
    //     dbSteps: "Creating steps... / Searching translators...",
    //     dbFinance: "Finishing..."
    // },
    // memoqProjectMessage: "",
    // fileCounter: 0,
    // isShowTasksAndDeliverables: true,
};

export const pmarea = {
    state,
    actions,
    mutations,
    getters
}
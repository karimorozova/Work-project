export const mutations = {
    SET_CLIENTS_REQUESTS(state, payload) {
        state.clientsRequests = payload;
    },
    SET_CUR_CLIENTS_REQUESTS(state, payload) {
        state.currentClientsRequests = payload;
    },
    // SET_TASKS_DATA_VALUE(state, payload) {
    //     const { prop, value } = payload;
    //     state.tasksData = {...state.tasksData, [prop]: value};
    // },
    // CLEAR_DATA(state) {
    //     state.tasksData = {};
    // },
    // SET_MEMOQ_PROJECT_MESSAGE(state, payload) {
    //     state.memoqProjectMessage = state.memoqProjectMessages[payload];
    // },
    // RESET_FILE_COUNTER(state) {
    //     state.fileCounter = 0;
    // },
    // INCREMENT_FILE_COUNTER(state, payload) {
    //     state.fileCounter++;
    // },
    // SET_SHOW_TASK_AND_DELIVERABLES(state, payload){
    //     state.isShowTasksAndDeliverables = payload
    // }
};
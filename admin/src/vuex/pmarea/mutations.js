export const mutations = {
    SET_REQUESTS(state, payload) {
        state.requests = payload;
    },
    SET_TASKS_DATA_VALUE(state, payload) {
        const { prop, value } = payload;
        state.tasksData = {...state.tasksData, [prop]: value};
    },
    CLEAR_DATA(state) {
        state.tasksData = {};
    }
};
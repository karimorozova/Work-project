import Vue from "vue";

export const setRequests = ({commit}, payload) => commit('SET_REQUESTS', payload);

export const approveDeliveryFile = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const {taskId, jobId, isFileApproved} = payload
        const updatedProject = await Vue.http.post("/pm-manage/approve-files", {taskId, jobId, isFileApproved})
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Updated", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter');
    }
}

export const uploadTarget = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        await Vue.http.post("/pm-manage/target", payload);
        dispatch('alertToggle', {message: "Updated", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const approveWithOption = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const { taskIds, isDeliver } = payload;
        const updatedProject = await Vue.http.post("/pm-manage/tasks-approve-notify", { taskIds, isDeliver });
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Success", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const approveDeliverable = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedProject = await Vue.http.post("/pm-manage/tasks-approve", { taskIds: payload });
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Success", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const deliverTasks = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const tasks = payload.filter(item => item.status === "Ready for Delivery");
        if(tasks.length) {
            const updatedProject = await Vue.http.post("/pm-manage/deliver", { tasks });
            await dispatch('setCurrentProject', updatedProject.data);
        }
        dispatch('alertToggle', {message: "Tasks delivered", isShow: true, type: "success"});
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const sendTasksDetails = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const tasks = payload.filter(task => task.status === "Created");
        if(tasks.length) {
            await Vue.http.post("/pm-manage/tasks-quote", { tasks });
        }
        dispatch('alertToggle', {message: "Tasks delivered", isShow: true, type: "success"});
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const reopenSteps = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        if(payload.length) {
            const updatedProject = await Vue.http.post("/pm-manage/steps-reopen", { steps: payload });
            await dispatch('setCurrentProject', updatedProject.data);
        }
        dispatch('alertToggle', {message: "Steps reopened", isShow: true, type: "success"});
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}
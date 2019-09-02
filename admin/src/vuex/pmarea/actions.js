import Vue from "vue";

export const setRequests = ({commit}, payload) => commit('SET_REQUESTS', payload);

export const setTasksDataValue = ({commit}, payload) => commit('SET_TASKS_DATA_VALUE', payload);

export const clearTasksData = ({commit}) => commit('CLEAR_DATA');

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

export const updateStepFinance = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedProject = await Vue.http.post("/pm-manage/step-finance", { step: payload });
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Step finance updated", isShow: true, type: "success"});
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const addFileToRequest = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedRequest = await Vue.http.post("/pm-manage/request-file", payload);
        await dispatch('setCurrentProject', updatedRequest.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const removeRequestFile = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedRequest = await Vue.http.post("/pm-manage/remove-request-file", payload);
        await dispatch('setCurrentProject', updatedRequest.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const toggleRequestFileApprovement = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedRequest = await Vue.http.post("/pm-manage/file-approvement", payload);
        await dispatch('setCurrentProject', updatedRequest.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const approveRequestFiles = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter');
    let { id, sourceFiles, refFiles } = payload;
    sourceFiles = sourceFiles.map(item => {
        const {isChecked, type, ...file } = item;
        return {...file}
    })
    refFiles = refFiles.map(item => {
        const {isChecked, type, ...file } = item;
        return {...file}
    })
    try {
        await dispatch('setRequestValue', {id, prop: "sourceFiles", value: sourceFiles});
        await dispatch('setRequestValue', {id, prop: "refFiles", value: refFiles});
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const approveRequestProp = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedRequest = await Vue.http.post("/pm-manage/prop-approvement", payload);
        await dispatch('setCurrentProject', updatedRequest.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const setRequestValue = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedRequest = await Vue.http.post("/pm-manage/request-value", payload);
        await dispatch('setCurrentProject', updatedRequest.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const setProjectValue = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedProject = await Vue.http.post("/pm-manage/project-value", payload);
        await dispatch('setCurrentProject', updatedProject.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const deleteRequestFiles = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedRequest = await Vue.http.post("/pm-manage/delete-request-files", payload);
        await dispatch('setCurrentProject', updatedRequest.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const reassignVendor = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedRequest = await Vue.http.post("/pm-manage/reassign-vendor", payload);
        await dispatch('setCurrentProject', updatedRequest.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}
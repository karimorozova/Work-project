import Vue from "vue";

export const setRequests = ({commit}, payload) => commit('SET_REQUESTS', payload);

export const setTasksDataValue = ({commit}, payload) => commit('SET_TASKS_DATA_VALUE', payload);

export const clearTasksData = ({commit}) => commit('CLEAR_DATA');

export const setProjectDate = async ({dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedProject = await Vue.http.put('/pm-manage/project-date', payload);
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Updated", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data.message, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter');
    }
}

export const addProjectTasks = async ({ dispatch }, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedProject = await Vue.http.post('/xtm/add-tasks', payload);
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Tasks were added", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter');
    }
}

export const addTasksFromRequest = async ({dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const updatedProject = await Vue.http.post('/pm-manage/add-tasks', payload);
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Project is created and tasks were added", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter');
    }
}

export const updateProgress = async ({ dispatch }, payload) => {
    dispatch('incrementRequestCounter')
    const { projectId, isCatTool } = payload;
    try {
        const updatedProject = await Vue.http.post('/xtm/update-progress', { projectId, isCatTool });
        await dispatch('setCurrentProject', updatedProject.data);
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter');
    }
}

export const approveInstruction = async ({dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const {taskId, projectId, instruction} = payload;
        await Vue.http.post("/pm-manage/approve-instruction", {taskId, projectId, instruction});
        dispatch('alertToggle', {message: "Updated", isShow: true, type: "success"});
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter');
    }
}

export const approveDeliveryFile = async ({dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const {taskId, isFileApproved, paths} = payload;
        await Vue.http.post("/pm-manage/approve-files", {taskId, isFileApproved, paths});
        dispatch('alertToggle', {message: "Updated", isShow: true, type: "success"});
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter');
    }
}

export const removeDrFile = async ({dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        await Vue.http.post("/pm-manage/remove-dr-file", { ...payload });
        dispatch('alertToggle', {message: "File removed", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const uploadTarget = async ({dispatch}, payload) => {
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

export const changeReviewManager = async ({dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const { taskId, projectId, manager, prop } = payload;
        await Vue.http.post("/pm-manage/change-manager", { taskId, projectId, manager, prop });
        dispatch('alertToggle', {message: "Success", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const rollBackReview = async ({dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const { taskId, projectId, manager } = payload;
        const updatedProject = await Vue.http.post("/pm-manage/rollback-review", { taskId, projectId, manager });
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Success", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const assignDr2 = async ({dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const { taskId, projectId, dr2Manager } = payload;
        const updatedProject = await Vue.http.post("/pm-manage/assign-dr2", { taskId, projectId, dr2Manager });
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Success", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}

export const approveWithOption = async ({dispatch}, payload) => {
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

export const approveDeliverable = async ({dispatch}, payload) => {
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

export const deliverTasks = async ({dispatch}, payload) => {
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

export const sendTasksDetails = async ({dispatch}, payload) => {
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

export const reopenSteps = async ({dispatch}, payload) => {
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

export const updateStepFinance = async ({dispatch}, payload) => {
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

export const addFileToRequest = async ({dispatch}, payload) => {
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

export const removeRequestFile = async ({dispatch}, payload) => {
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

export const toggleRequestFileApprovement = async ({dispatch}, payload) => {
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

export const approveRequestFiles = async ({dispatch}, payload) => {
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

export const approveRequestProp = async ({dispatch}, payload) => {
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

export const setRequestValue = async ({dispatch}, payload) => {
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

export const setProjectValue = async ({dispatch}, payload) => {
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

export const reassignVendor = async ({dispatch}, payload) => {
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
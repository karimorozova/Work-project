import Vue from "vue";

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

export const approveWithNotify = async ({commit, dispatch}, payload) => {
    dispatch('incrementRequestCounter')
    try {
        const tasks = payload.map(item => item.taskId)
            .filter((taskId, index, arr) => arr.indexOf(taskId) === index)
        const updatedProject = await Vue.http.post("/pm-manage/tasks-approve", { tasks });
        await dispatch('setCurrentProject', updatedProject.data);
        dispatch('alertToggle', {message: "Success", isShow: true, type: "success"})
    } catch(err) {
        dispatch('alertToggle', {message: err.data, isShow: true, type: "error"});
    } finally {
        dispatch('decrementRequestCounter')
    }
}
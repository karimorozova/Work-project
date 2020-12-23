import Vue from "vue";

export const setRequests = ({ commit }, payload) => commit('SET_REQUESTS', payload);

export const setTasksDataValue = ({ commit }, payload) => commit('SET_TASKS_DATA_VALUE', payload);

export const clearTasksData = ({ commit }) => commit('CLEAR_DATA');

export const setMemoqProjectMessage = ({ commit }, payload) => commit('SET_MEMOQ_PROJECT_MESSAGE', payload);

export const resetFileCounter = ({ commit }) => commit('RESET_FILE_COUNTER');

export const incrementFileCounter = ({ commit }) => commit('INCREMENT_FILE_COUNTER');

export const setProjectDate = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedProject = await Vue.http.put('/pm-manage/project-date', payload);
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Updated", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data.message, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter');
	}
}

export const addProjectTasks = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedProject = await Vue.http.post('/pm-manage/project-tasks', payload);
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Tasks were added", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter');
	}
}

export const addProjectWordsTasks = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		dispatch('setMemoqProjectMessage', 'memoqProject');
		const memoqProject = await Vue.http.post('/memoqapi/memoq-project', payload);
		let { tasksInfo } = memoqProject.data;
		dispatch('setMemoqProjectMessage', 'memoqFiles');
		tasksInfo.memoqFiles = [];
		for (let filePath of tasksInfo.translateFiles) {
			dispatch('incrementFileCounter');
			const addFileResult = await Vue.http.post("/memoqapi/add-project-file", { memoqProjectId: tasksInfo.memoqProjectId, filePath });
			tasksInfo.memoqFiles.push({ name: filePath.split("/").pop(), fileGuid: addFileResult.body });
		}
		dispatch('resetFileCounter');
		dispatch('setMemoqProjectMessage', 'dbTasks');
		const translationDocs = await Vue.http.get(`/memoqapi/project-docs?id=${ tasksInfo.memoqProjectId }`);
		const { body: tasks } = await Vue.http.post('/pm-manage/project-words-tasks', { tasksInfo, docs: translationDocs.data });
		dispatch('setMemoqProjectMessage', 'dbSteps');
		await Vue.http.post('/memoqapi/metrics', { projectId: tasksInfo.projectId, tasks });
		const updatedProject = await Vue.http.get(`/pm-manage/costs?projectId=${ tasksInfo.projectId }`);
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Tasks were added", isShow: true })
	} catch (err) {
		dispatch('alertToggle', { message: err.data || err.message, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter');
	}
}

export const addTasksFromRequest = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedProject = await Vue.http.post('/pm-manage/request-tasks', payload);
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Project is created and tasks were added", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter');
	}
}

export const updateProgress = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	const { projectId, isCatTool } = payload;
	try {
		const updatedProject = await Vue.http.post('/pm-manage/update-progress', { projectId, isCatTool });
		await dispatch('setCurrentProject', updatedProject.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter');
	}
}

export const approveInstruction = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const { taskId, projectId, instruction } = payload;
		await Vue.http.post("/pm-manage/approve-instruction", { taskId, projectId, instruction });
		dispatch('alertToggle', { message: "Updated", isShow: true, type: "success" });
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter');
	}
}

export const approveDeliveryFile = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const { taskId, isFileApproved, paths } = payload;
		await Vue.http.post("/pm-manage/approve-files", { taskId, isFileApproved, paths });
		dispatch('alertToggle', { message: "Updated", isShow: true, type: "success" });
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter');
	}
}

export const removeDrFile = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		await Vue.http.post("/pm-manage/remove-dr-file", { ...payload });
		dispatch('alertToggle', { message: "File removed", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const uploadTarget = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		await Vue.http.post("/pm-manage/target", payload);
		dispatch('alertToggle', { message: "Updated", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const changeReviewManager = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const { taskId, projectId, prevManager, manager, prop, isAdmin, status } = payload;
		await Vue.http.post("/pm-manage/change-manager", { taskId, projectId, prevManager, manager, prop, isAdmin, status });
		dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const rollBackReview = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const { taskId, projectId, manager } = payload;
		const updatedProject = await Vue.http.post("/pm-manage/rollback-review", { taskId, projectId, manager });
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const assignDr2 = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const { taskId, projectId, dr2Manager } = payload;
		const updatedProject = await Vue.http.post("/pm-manage/assign-dr2", { taskId, projectId, dr2Manager });
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const approveWithOption = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const { taskId, isDeliver, contacts, user } = payload;
		const updatedProject = await Vue.http.post("/pm-manage/tasks-approve-notify", { taskId, isDeliver, contacts, user });
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const approveDeliverable = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedProject = await Vue.http.post("/pm-manage/tasks-approve", { taskId: payload });
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const deliverTasks = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const tasks = payload.filter(item => item.status === "Ready for Delivery");
		if(tasks.length) {
			const updatedProject = await Vue.http.post("/pm-manage/deliver", { tasks });
			await dispatch('setCurrentProject', updatedProject.data);
		}
		dispatch('alertToggle', { message: "Tasks delivered", isShow: true, type: "success" });
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const reopenSteps = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		if(payload.length) {
			const updatedProject = await Vue.http.post("/pm-manage/steps-reopen", { steps: payload });
			await dispatch('setCurrentProject', updatedProject.data);
		}
		dispatch('alertToggle', { message: "Steps reopened", isShow: true, type: "success" });
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const updateStepFinance = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedProject = await Vue.http.post("/pm-manage/step-finance", { step: payload });
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Step finance updated", isShow: true, type: "success" });
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const addFileToRequest = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedRequest = await Vue.http.post("/pm-manage/request-file", payload);
		await dispatch('setCurrentProject', updatedRequest.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const removeRequestFile = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedRequest = await Vue.http.post("/pm-manage/remove-request-file", payload);
		await dispatch('setCurrentProject', updatedRequest.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const toggleRequestFileApprovement = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedRequest = await Vue.http.post("/pm-manage/file-approvement", payload);
		await dispatch('setCurrentProject', updatedRequest.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const approveRequestFiles = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter');
	let { id, sourceFiles, refFiles } = payload;
	sourceFiles = sourceFiles.map(item => {
		const { isChecked, type, ...file } = item;
		return { ...file }
	})
	refFiles = refFiles.map(item => {
		const { isChecked, type, ...file } = item;
		return { ...file }
	})
	try {
		await dispatch('setRequestValue', { id, prop: "sourceFiles", value: sourceFiles });
		await dispatch('setRequestValue', { id, prop: "refFiles", value: refFiles });
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const approveRequestProp = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedRequest = await Vue.http.post("/pm-manage/prop-approvement", payload);
		await dispatch('setCurrentProject', updatedRequest.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const setRequestValue = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedRequest = await Vue.http.post("/pm-manage/request-value", payload);
		await dispatch('setCurrentProject', updatedRequest.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const setProjectValue = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedProject = await Vue.http.post("/pm-manage/project-value", payload);
		await dispatch('setCurrentProject', updatedProject.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const deleteRequestFiles = async ({ commit, dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedRequest = await Vue.http.post("/pm-manage/delete-request-files", payload);
		await dispatch('setCurrentProject', updatedRequest.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const reassignVendor = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedRequest = await Vue.http.post("/pm-manage/reassign-vendor", payload);
		await dispatch('setCurrentProject', updatedRequest.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const deliverProjectToClient = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const { id, message } = payload;
		const updatedProject = await Vue.http.post("/pm-manage/project-delivery", { _id: id, message });
		await dispatch('setCurrentProject', updatedProject.data);
	} catch (err) {
		console.log(err);
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

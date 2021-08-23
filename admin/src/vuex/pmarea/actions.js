import Vue from "vue";

export const setRequests = ({ commit }, payload) => commit('SET_REQUESTS', payload);

export const setTasksDataValue = ({ commit }, payload) => commit('SET_TASKS_DATA_VALUE', payload);

export const clearTasksData = ({ commit }) => commit('CLEAR_DATA');

export const setMemoqProjectMessage = ({ commit }, payload) => commit('SET_MEMOQ_PROJECT_MESSAGE', payload);

export const setShowTasksAndDeliverables = ({ commit }, payload) => commit('SET_SHOW_TASK_AND_DELIVERABLES', payload);

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
		for await (let filePath of tasksInfo.translateFiles) {
			dispatch('incrementFileCounter');
			const addFileResult = await Vue.http.post("/memoqapi/add-project-file", { memoqProjectId: tasksInfo.memoqProjectId, filePath });
			tasksInfo.memoqFiles.push({ name: filePath.split("/").pop(), fileGuid: addFileResult.data });
		}

		dispatch('resetFileCounter');
		dispatch('setMemoqProjectMessage', 'dbFiles');
		const listProjectTranslationDocuments = await Vue.http.get(`/memoqapi/project-docs?id=${ tasksInfo.memoqProjectId }`);

		dispatch('setMemoqProjectMessage', 'dbTasks');
		const tasks = await Vue.http.post('/pm-manage/project-words-tasks', { tasksInfo, docs: listProjectTranslationDocuments.data });

		dispatch('setMemoqProjectMessage', 'dbSteps');
		await Vue.http.post('/memoqapi/metrics', { projectId: tasksInfo.projectId, tasks: tasks.data });

		dispatch('setMemoqProjectMessage', 'dbFinance');
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
	//#rafactoring
	// dispatch('incrementRequestCounter')
	// try {
	// 	const updatedProject = await Vue.http.post('/pm-manage/request-tasks', payload);
	// 	await dispatch('setCurrentProject', updatedProject.data);
	// 	dispatch('alertToggle', { message: "Project is created and tasks were added", isShow: true, type: "success" })
	// } catch (err) {
	// 	dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	// } finally {
	// 	dispatch('decrementRequestCounter');
	// }
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
		const updatedProject = await Vue.http.post("/delivery/approve-instruction", { taskId, projectId, instruction });
    await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Instruction updated!", isShow: true, type: "success" });
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter');
	}
}

export const approveInstructionDR2 = async ({ dispatch }, payload) => {
  dispatch('incrementRequestCounter')
  try {
    const { entityId, projectId, instruction, type } = payload;
    const updatedProject = await Vue.http.post("/delivery/approve-instruction-dr2", { entityId, projectId, instruction, type });
    await dispatch('setCurrentProject', updatedProject.data);
    dispatch('alertToggle', { message: "Instruction updated!", isShow: true, type: "success" });
  } catch (err) {
    dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
  } finally {
    dispatch('decrementRequestCounter');
  }
}

export const changeReviewManager = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const { taskId, projectId, manager, prop, isAdmin, status } = payload;
		const updatedProject = await Vue.http.post("/delivery/change-manager", { taskId, projectId, manager, prop, isAdmin, status });
    await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Successfully changed!", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const approveNotify = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedProject = await Vue.http.post("/delivery/tasks-approve-notify", payload);
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}
export const approveDeliver = async ({ dispatch }, payload) => {
  dispatch('incrementRequestCounter')
  try {
    const updatedProject = await Vue.http.post("/delivery/tasks-approve-deliver", payload);
    await dispatch('setCurrentProject', updatedProject.data);
    dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
  } catch (err) {
    dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
  } finally {
    dispatch('decrementRequestCounter')
  }
}

export const approveReady = async ({ dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedProject = await Vue.http.post("/delivery/tasks-approve-ready", payload);
		await dispatch('setCurrentProject', updatedProject.data);
		dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const approveDeliverMany = async ({ dispatch }, payload) => {
  dispatch('incrementRequestCounter')
  try {
    const updatedProject = await Vue.http.post("/delivery/tasks-approve-deliver-many", payload);
    await dispatch('setCurrentProject', updatedProject.data);
    dispatch('alertToggle', { message: "Success", isShow: true, type: "success" })
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
			const steps = payload.reduce((acc, curr) => {
				delete curr.check
				acc.push(curr)
				return acc
			}, [])

			const updatedProject = await Vue.http.post("/pm-manage/steps-reopen", { steps });
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

export const deleteProject = async ({ commit, dispatch }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		await Vue.http.post("/pm-manage/delete-project", payload);
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

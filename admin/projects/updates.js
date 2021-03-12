const { Projects, User, MemoqProject, Units, Vendors } = require('../models');
const { getProject, updateProject } = require('./getProjects');
const {
	stepCancelNotifyVendor,
	notifyVendorStepStart
} = require('./emails');
const { notifyManagerProjectStarts } = require('../utils');
const { pmMail } = require('../utils/mailtopm');
const {
	getUpdatedProjectFinanceToZero,
	getProjectFinancePrice
} = require('./porjectFinance');
const {
	getProjectTranslationDocs,
	getProjectUsers,
	setMemoqProjectUsers,
	assignMemoqTranslators
} = require('../services/memoqs/projects');
const { downloadMemoqFile } = require('../services/memoqs/files');
const { getMemoqUsers, createMemoqUser } = require('../services/memoqs/users');

/**
 *
 * @param {Object} project
 * @param {Boolean} isCatTool
 * @returns {Object} - returns updated project
 */
async function updateProjectProgress(project, isCatTool) {
	let { steps, tasks } = project;
	try {
		for (let task of tasks) {
			const units = task.stepsAndUnits;
			for (let { unit } of units) {
				if(unit === 'CAT Wordcount' && isCatTool) {
					const docs = await getProjectTranslationDocs(task.memoqProjectId);
					task.memoqDocs = Array.isArray(docs) ? docs.filter(item => item.TargetLangCode === task.memoqTarget) : [docs];
					steps = updateWordcountStepsProgress({ steps, task });
				} else if(!isCatTool) {
					steps = updateStepsProgress(task, steps);
				}
			}
		}
		return await updateProject({ "_id": project.id }, { steps, tasks });
	} catch (err) {
		console.log(err);
		console.log("Error in updateProjectProgress");
	}
}

/**
 *
 * @param {Array} tasks
 * @param {Object} project
 * @returns {Object} - returns updated project
 */
async function getProjectAfterCancelTasks(tasks, project) {
	try {

		const { changedTasks, changedSteps, stepIdentify } = await cancelTasks(tasks, project);
		const Price = getProjectFinancePrice(project.tasks);
		const notifySteps = stepIdentify.length ? changedSteps.filter(item => stepIdentify.indexOf(item.stepId) !== -1) : changedSteps;
		await stepCancelNotifyVendor(notifySteps);
		return await updateProject({ "_id": project.id }, { tasks: changedTasks, steps: changedSteps, finance: { ...project.finance, Price } });
	} catch (err) {
		console.log(err);
		console.log("Error in getProjectAfterCancelTasks");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {Array} tasks
 * @param {Object} project
 * @returns {Object} - returns changed tasks, steps and identifier
 */
async function cancelTasks(tasks, project) {
	let projectTasks = [...project.tasks];
	let projectSteps = [...project.steps];
	const tasksIds = tasks.map(item => item.taskId);
	let inCompletedSteps = [];
	if(projectSteps.length) {
		inCompletedSteps = projectSteps.map(item => {
			if(item.status !== "Completed" && tasksIds.indexOf(item.taskId) !== -1) {
				return { ...item._doc };
			}
		}).filter(item => !!item);
	}
	const stepIdentify = inCompletedSteps.length ? inCompletedSteps.map(step => step.stepId) : [];
	const changedSteps = stepIdentify.length ? cancelSteps({ stepIdentify, steps: projectSteps }) : [];
	try {
		const changedTasks = await cancelCheckedTasks({
			tasksIds, projectTasks, projectId: project.id, changedSteps
		});
		return { changedTasks, changedSteps, stepIdentify };
	} catch (err) {
		console.log(err);
		console.log("Error in getProjectAfterCancelTasks");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {Object} stepIdentify
 * @param {Array} steps
 * @returns {Array} - returns updated steps array
 */
function cancelSteps({ stepIdentify, steps }) {
	return steps.map(item => {
		if(stepIdentify.indexOf(item.stepId) !== -1) {
			let newStatus = item.status !== 'Completed' ? "Cancelled" : item.status;
			if(+item.progress.wordsDone > 0 && newStatus !== 'Completed') {
				newStatus = "Cancelled Halfway";
				let finance = getStepNewFinance(item);
				return { ...item._doc, previousStatus: item.status, status: newStatus, finance };
			} else {
				item.finance = {
					Wordcount: {
						receivables: 0,
						payables: 0
					},
					Price: {
						receivables: 0,
						payables: 0
					}
				};
			}
			item.previousStatus = item.status;
			item.status = newStatus;
		}
		return item;
	});
}

/**
 *
 * @param {Array} tasksIds
 * @param {Array} projectTasks
 * @param {Array} changedSteps
 * @param {String} projectId
 * @returns {Array} - returns array of updated tasks
 */
async function cancelCheckedTasks({ tasksIds, projectTasks, changedSteps, projectId }) {
	const unchangingStatuses = ['Ready for Delivery', 'Pending Approval [DR1]', 'Pending Approval [DR2]', 'Delivered'];
	let tasks = [...projectTasks];
	try {
		for (let task of tasks) {
			if(tasksIds.indexOf(task.taskId) !== -1 && unchangingStatuses.indexOf(task.status) === -1) {
				task.previousStatus = task.status;
				task.status = getTaskStatusAfterCancel(changedSteps, task.taskId) || task.status;
				if(task.status === "Cancelled Halfway") {
					task.finance = getTaskNewFinance(changedSteps, task);
					task.targetFiles = await getTaskTargetFiles({ task, projectId, stepName: 'halfway' });
				} else {
					task.finance = {
						Wordcount: {
							receivables: 0,
							payables: 0
						},
						Price: {
							receivables: 0,
							payables: 0
						}
					};
				}
			}
		}
		return tasks;
	} catch (err) {
		console.log(err);
		console.log("Error in cancelCheckedTasks");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {Object} task
 * @param {String} projectId
 * @param {String} stepName
 * @returns {Array} - returns array of target files
 */
async function getTaskTargetFiles({ task, projectId, stepName }) {
	let targetFiles = [];
	const { memoqDocs, memoqProjectId } = task;
	try {
		for (let doc of memoqDocs) {
			// const exportPath = doc.ExportPath.slice(1);
			// const pathParts = exportPath.split(".");
			// const fileName = pathParts.slice(0, -1).join();
			const fileName = doc.ImportPath
			const path = `/projectFiles/${ projectId }/${Math.floor(Math.random()*10000)}${ stepName }_${ fileName }`;
			await downloadMemoqFile({ memoqProjectId, docId: doc.DocumentGuid, path: `./dist${ path }` });
			targetFiles.push({ fileName: doc.DocumentName, path });
		}
		return targetFiles;
	} catch (err) {
		console.log(err);
		console.log("Error in getTaskTargetFiles");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {ObjectId} stepId
 * @returns nothing - just updated needed project with tasks
 */
async function downloadCompletedFiles(stepId) {
	try {
		let { id, steps, tasks } = await getProject({ "steps._id": stepId });
		const step = steps.find(item => item.id === stepId);
		const taskIndex = tasks.findIndex(item => item.taskId === step.taskId);
		tasks[taskIndex].targetFiles = await getTaskTargetFiles({
			task: tasks[taskIndex],
			projectId: id,
			stepName: step.name
		});
		await Projects.updateOne({ "_id": id }, { tasks });
	} catch (err) {
		console.log(err);
		console.log("Error in downloadCompletedFiles");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {Array} changedSteps
 * @param {Object} task
 * @returns {{ receivables: number, payables: number }, {halfReceivables: number, halfPayables: number}}
 */
function getTaskNewFinance(changedSteps, task) {
	const { priceValues } = updateTaskNewFinance(changedSteps, task);
	const { finance } = task;
	const Price = {
		...finance.Price,
		halfReceivables: +(priceValues.receivables.toFixed(2)),
		halfPayables: +(priceValues.payables.toFixed(2))
	};
	return { ...finance, Price };
}

/**
 *
 * @param {Array} changedSteps
 * @param {Object} task
 * @returns {{priceValues: {receivables: number, payables: number}}}
 */
function updateTaskNewFinance(changedSteps, task) {
	let priceValues = { receivables: 0, payables: 0 };
	const taskSteps = changedSteps.filter(item => item.taskId === task.taskId);
	for (let step of taskSteps) {
		if(step.status === "Cancelled Halfway") {
			priceValues.receivables += +step.finance.Price.halfReceivables;
			priceValues.payables += +step.finance.Price.halfPayables;
		} else if(step.status === "Completed") {
			priceValues.receivables += +step.finance.Price.receivables;
			priceValues.payables += +step.finance.Price.payables;
		}
	}
	return { priceValues };
}

/**
 *
 * @param {Array} steps
 * @param {ObjectId} taskId
 * @returns {String}
 */
function getTaskStatusAfterCancel(steps, taskId) {
	const taskSteps = steps.filter(item => item.taskId === taskId).map(step => step.status);
	const cancelledSteps = taskSteps.filter(item => item === "Cancelled");
	const completedSteps = taskSteps.filter(item => item === "Completed");
	const halfCancelledSteps = taskSteps.filter(item => item === "Cancelled Halfway");
	if(cancelledSteps.length === taskSteps.length || !steps.length) {
		return "Cancelled";
	}
	if(completedSteps.length === taskSteps.length) {
		return "Pending Approval [DR1]";
	}
	if(halfCancelledSteps.length || (completedSteps.length && completedSteps.length < taskSteps.length)) {
		return "Cancelled Halfway";
	}
}

/**
 *
 * @param {Array} projectSteps
 * @param {Array} tasks
 * @param {String} status
 * @param {Array} stepIdentify
 * @returns {Array} returns updated project steps array
 */
function updateStepsStatuses({ projectSteps, tasks, status, stepIdentify }) {
	return projectSteps.map(item => {
		if(stepIdentify.indexOf(item.id) !== -1) {
			let newStatus = status;
			if(status === "Ready to Start" && isPrevStep({ tasks, projectSteps, step: item })) {
				newStatus = "Waiting to Start";
			}
			item.status = newStatus;
		}
		return item;
	});
}

/**
 *
 * @param {Array} tasks
 * @param {Array} projectSteps
 * @param {Object} step
 * @returns {Boolean}
 */
function isPrevStep({ tasks, projectSteps, step }) {
	const stepTask = tasks.find(item => item.taskId === step.taskId);
	const sameSteps = projectSteps.filter(item => {
		return item.taskId === stepTask.taskId
				&& item.stepId !== step.stepId
				&& item.status !== "Completed";
	});
	const stage1 = stepTask.service.steps.find(item => item.stage === 'stage1');
	return sameSteps.length && stage1.step.title !== step.serviceStep.title;
}

/**
 *
 * @param {ObjectId} step
 * @returns {Object}
 */
function getStepNewFinance(step) {
	const { progress, finance } = step;
	const { Wordcount, Price } = finance;
	const done = progress.wordsDone / progress.totalWordCount;
	Wordcount.payables = progress.wordsDone;
	Price.halfReceivables = +((Price.receivables * done).toFixed(2));
	Price.halfPayables = +((Price.payables * done).toFixed(2));
	return { Wordcount, Price };
}

/**
 *
 * @param {Object} project
 * @param {Boolean} ifChangePreviousStatus
 * @returns {Object} - returns an updated project
 */
async function reOpenProject(project, ifChangePreviousStatus = true) {
	let { steps, tasks } = project;

	if(ifChangePreviousStatus) {
		steps = reopenItem(steps);
		tasks = reopenItem(tasks);
	}

	return await updateProject(
			{ '_id': project._id },
			{ status: 'In progress', tasks, steps }
	);

	function reopenItem(arr) {
		return arr.map(item => {
			if(item.status === "Cancelled" || item.status === "Cancelled Halfway") {
				item.status = item.previousStatus;
			}
			return item;
		});
	}
}


/**
 *
 * @param {ObjectId} projectId
 * @param {String} action
 * @returns {Object} - returns an updated project
 */
async function updateProjectStatusForClientPortalProject(projectId, action) {
	const project = await getProject({ "_id": projectId });

	if(action === 'approve') {
		project.status = 'Approved';
		project.tasks = changeTasksStatus(project.tasks, 'Approved')
	} else {
		project.status = 'Rejected';
		project.tasks = changeTasksStatus(project.tasks, 'Rejected')
	}

	function changeTasksStatus(tasks, statusTask) {
		return tasks.map(task => {
			task.status = statusTask;
			return task;
		})
	}

	return await updateProject({ "_id": projectId }, { status: project.status, tasks: project.tasks, }
	);
}

/**
 *
 * @param {ObjectId} id
 * @param {String} status
 * @param {String} reason
 * @returns {Object} - returns an updated project
 */
async function updateProjectStatus(id, status, reason) {
	try {
		const project = await getProject({ "_id": id });
		if(status === 'fromCancelled') return await reOpenProject(project);
		if(status === 'fromClosed') return await reOpenProject(project, false);
		if(status !== "Cancelled" && status !== "Cancelled Halfway") return await setNewProjectDetails(project, status, reason);

		const { tasks, steps } = project;
		const notifySteps = steps.length ? steps.map(item => {
			return { ...item._doc };
		}) : [];
		const { changedTasks, changedSteps } = await cancelTasks(tasks, project);
		//MM
		// const projectStatus = getProjectNewStatus(changedTasks, status);
		const projectStatus = status;
		//MM - сбрасывает цену проекта на 0 или на сумму отменненых тасков на пол пути.
		const Price = getUpdatedProjectFinanceToZero(changedTasks);
		if(notifySteps.length) {
			await stepCancelNotifyVendor(notifySteps);
		}
		return await updateProject(
				{ "_id": id },
				{
					status: projectStatus,
					reason: reason,
					isPriceUpdated: false,
					finance: { ...project.finance, Price },
					tasks: changedTasks,
					steps: changedSteps
				}
		);
	} catch (err) {
		console.log(err);
		console.log("Error in updateProjectStatus");
		throw new Error(err.message);
	}
}

// /**
//  *
//  * @param {Array} changedTasks
//  * @param {String} status
//  * @returns {string} - returns project's status
//  */
// function getProjectNewStatus(changedTasks, status) {
//   const notFullyCancelledTask = changedTasks.find(item => {
//     return item.status === "Cancelled Halfway" ||
//         item.status === "Ready for Delivery" ||
//         item.status === "Delivered";
//   });
//   return notFullyCancelledTask ? "Cancelled Halfway" : status;
// }

/**
 *
 * @param {Object} project
 * @param {String} status
 * @param {String} reason
 * @returns {Object} - returns an updated project
 */
async function setNewProjectDetails(project, status, reason) {
	try {
		if(status === "Started" || status === "Approved") {
			return await getApprovedProject(project, status);
		}
		if(status === "Rejected") {
			const client = { ...project.customer._doc, id: project.customer.id };
			const user = await User.findOne({ "_id": client.projectManager._id });
			await pmMail(project, client, user);
		}
		return await updateProject({ "_id": project.id }, { status, isPriceUpdated: false, reason: reason });
	} catch (err) {
		console.log(err);
		console.log("Error in setNewProjectDetails");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {Object} project
 * @param {String} status
 * @returns {Object} - returns an updated project
 */
async function getApprovedProject(project, status) {
	const taskIds = project.tasks.map(item => item.taskId);
	const { tasks, steps } = updateWithApprovedTasks({ taskIds, project });
	project.isStartAccepted = true;
	// const stepsStatuses = ["Ready to Start", "Waiting to Start"];
	// const wordsUnitSteps = [];
	// for (let step of steps) {
	//   const { serviceStep, status } = step;
	//   const { unit: unitId } = serviceStep;
	//   const { type } = await Units.findOne({ _id: unitId });
	//   if (type === 'CAT Wordcount' && stepsStatuses.indexOf(status) !== -1) wordsUnitSteps.push(step);
	// }
	// const splittedByIdSteps = wordsUnitSteps.reduce((acc, cur) => {
	//   acc[cur.memoqProjectId] = acc[cur.memoqProjectId] ? [...acc[cur.memoqProjectId], cur] : [cur];
	//   return acc;
	// }, {});

	try {
		// if (wordsUnitSteps.length) {
		//   for (let id in splittedByIdSteps) {
		//     await setMemoqTranlsators(id, splittedByIdSteps[id]);
		//   }
		// }
		if(project.isStartAccepted) {
			await notifyManagerProjectStarts(project);
		}
		await notifyVendorStepStart([], steps, project);
		return await updateProject({ "_id": project.id }, { status, isStartAccepted: true, tasks, steps, isPriceUpdated: false });
	} catch (err) {
		console.log(err);
		console.log("Error in getApprovedProject");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {Array} taskIds
 * @param {Object} project
 * @returns {{steps: {Array}, tasks: {Array}}}
 */
function updateWithApprovedTasks({ taskIds, project }) {
	const tasks = project.tasks.map(task => {
		if((task.status === 'Created' || task.status === 'Quote sent') && taskIds.indexOf(task.taskId) !== -1) {
			task.status = 'Approved';
		}
		return task;
	});
	const steps = project.steps.map(step => {
		if(step.status === 'Accepted' && taskIds.indexOf(step.taskId) !== -1) {
			const stepTask = tasks.find(item => item.taskId === step.taskId);
			step.status = getApprovedStepStatus(stepTask, step);
		}
		return step;
	});
	return { tasks, steps };
}

/**
 *
 * @param {Object} stepTask
 * @param {Object} step
 * @returns {string}
 */
function getApprovedStepStatus(stepTask, step) {
	const stage1 = stepTask.service.steps.find(item => item.stage === 'stage1');
	if(stage1.step.title === step.serviceStep.title) {
		return 'Ready to Start';
	}
	return 'Waiting to Start';
}


/**
 *
 * @param {Array} steps
 * @param {String} status
 * @param {Object} project
 * @returns {Array}
 */
function setStepsStatus({ steps, status, project }) {
	const { steps: projectSteps, tasks } = project;
	const stepIdentify = steps.map(item => item._id);
	return updateStepsStatuses({ projectSteps, tasks, status, stepIdentify });
}

/**
 *
 * @param {Object} task
 * @param {Array} steps
 * @returns {Array} - returns updated steps array
 */
function updateStepsProgress(task, steps) {
	return steps.map(item => {
		if(task.taskId === item.taskId) {
			item.progress = item.status === 'Started' && item.targetFile ? 100 : item.progress;
		}
		return item;
	});
}

/**
 *
 * @param {Array} steps
 * @param {Object} task
 * @returns {Array} - returns updated steps array
 */
function updateWordcountStepsProgress({ steps, task }) {
	const { memoqDocs: docs } = task;
	return steps.map(item => {
		if(task.taskId === item.taskId) {
			item.progress = item.status === 'Started' ? setStepsProgress(item.serviceStep.title, docs) : item.progress;
		}
		return item;
	});
}

/**
 *
 * @param {String} title
 * @param {Array} docs
 * @returns {{stepProgress: {Object}, totalProgress: {Array}}}
 */
function setStepsProgress(title, docs) {
	const prop = title === 'Translation' ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount';
	const totalProgress = docs.reduce((acc, cur) => {
		acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop];
		acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +cur.TotalWordCount : +cur.TotalWordCount;
		return acc;
	}, {});
	let stepProgress = {};
	for (let doc of docs) {
		stepProgress[doc.DocumentGuid] = {
			wordsDone: +doc[prop],
			totalWordCount: +doc.TotalWordCount,
			fileName: doc.DocumentName
		};
	}
	return { ...stepProgress, ...totalProgress };
}

/**
 *
 * @param {Object} project
 * @param {ObjectId} jobId
 * @param {String} path
 * @param {String} fileName
 * @returns nothing - but updates needed project
 */
async function updateNonWordsTaskTargetFiles({ project, jobId, path, fileName }) {
	const steps = project.steps.map(item => {
		if(item.id === jobId) {
			item.status = 'Completed';
			item.progress = 100;
			item.targetFile = path;
		}
		return item;
	});
	const taskStep = steps.find(item => item.id === jobId);
	const tasks = project.tasks.map(item => {
		let targetFiles = item.targetFiles || [];
		if(taskStep.taskId === item.taskId) {
			targetFiles.push({ fileName, path, isFileApproved: false });
			item.targetFiles = targetFiles;
		}
		return item;
	});
	try {
		return await updateProject({ "_id": project.id }, { steps, tasks });
	} catch (err) {
		console.log(err);
		console.log("Error in updateNonWordsTaskTargetFiles");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {Array} steps
 * @param {Object} project
 * @returns nothing - but updates needed project
 */
async function getAfterReopenSteps(steps, project) {
	try {
		const updatedSteps = setStepsStatus({ steps, status: 'Started', project });
		const stepIdentify = steps.map(item => item.taskId + item.name);
		const chosenSteps = updatedSteps.filter(item => stepIdentify.indexOf(item.taskId + item.name) !== -1);
		const updatedtasks = getTasksAfterReopen({ steps: chosenSteps, tasks: project.tasks });
		return await updateProject({ "_id": project.id }, {
			tasks: updatedtasks,
			steps: updatedSteps,
			status: 'In progress'
		});
	} catch (err) {
		console.log(err);
		console.log("Error in getAfterReopenSteps");
		throw new Error(err.message);
	}
}

/**
 *
 * @param {Array} steps
 * @param {Array} tasks
 * @returns {Array} - returns updated tasks array
 */
function getTasksAfterReopen({ steps, tasks }) {
	let updatedTasks = [...tasks];
	for (let step of steps) {
		if(step.status === 'Started') {
			let taskIndex = updatedTasks.findIndex(item => item.taskId === step.taskId);
			updatedTasks[taskIndex].status = "Started";
		}
	}
	return updatedTasks;
}

/**
 *
 * @param {Object} query
 * @param {Object} update
 * @returns {Object} - returns an updated memoq project
 */
async function updateOtherProject(query, update) {
	return await MemoqProject.findOneAndUpdate(query, update, { new: false });
}

/**
 *
 * @param {ObjectId} vendorId
 * @param {ObjectId} stepId
 * @param {ObjectId} projectId
 * @returns nothing - but summons a new function or throws an error
 */
const assignMemoqTranslator = async (vendorId, stepId, projectId) => {
	const vendor = await Vendors.findOne({ _id: vendorId });
	const { steps } = await Projects.findOne({ _id: projectId }).populate('steps.vendor');
	const users = await getMemoqUsers();
	const isSecondStep = /(\sS02)/.exec(stepId);
	const neededStep = steps.find(step => step.stepId === stepId);
	const { memoqProjectId, taskId } = neededStep;
	let assignedSteps = [];

	if(isSecondStep) {
		assignedSteps.push(...steps.filter(item => item.taskId === taskId));
	} else {
		assignedSteps.push(neededStep);
	}
	let projectUsers = [];
	const currentProjectUsers = await getProjectUsers(memoqProjectId);
	const isArray = Array.isArray(currentProjectUsers);

	if(isArray) {
		for (let userInfo of currentProjectUsers) assignPM(userInfo);
	} else {
		if(currentProjectUsers.hasOwnProperty('User')) assignPM(currentProjectUsers);
	}

	const memoqUser = users.find(user => user.email === vendor.email);
	if(memoqUser) projectUsers.push({
		id: memoqUser.id,
		isPm: false
	});

	const areUsersSet = await setMemoqProjectUsers(
			memoqProjectId,
			Array.from(new Set(projectUsers.filter((el, i, self) => self.map(item => item.id).indexOf(el.id) === i)))
	);

	return areUsersSet ? await assignMemoqTranslators({ memoqProjectId, assignedSteps, users })
			: new Error("Can't set one or all users in memoQ");

	function assignPM(userObject) {
		const { ProjectRoles, User } = userObject;
		const { UserGuid } = User;
		const isPm = ProjectRoles['a:ProjectManager'] === 'true';
		projectUsers.push({
			id: UserGuid,
			isPm
		});
	}
};

/**
 *
 * @param {ObjectId} manager
 * @param {ObjectId} memoqProjectId
 * @returns nothing - but updates memoq project's users by xml request
 */
const assignProjectManagers = async ({ manager, memoqProjectId }) => {
	const users = await getMemoqUsers();
	const projectManagers = [];
	const pm = await User.findOne({ _id: manager });
	projectManagers.push(await checkAndCreateManager(users, pm));
	await setMemoqProjectUsers(memoqProjectId, projectManagers);
};

/**
 *
 * @param {Array} memoqUsers
 * @param {Object} manager
 * @returns {Object}
 */
const checkAndCreateManager = async (memoqUsers, manager) => {
	const memoqManager = memoqUsers.find(user => user.email === manager.email);
	if(memoqManager) {
		return {
			id: memoqManager.id,
			isPm: true
		};
	} else {
		const guid = await createMemoqUser({
			firstName: manager.firstName,
			email: manager.email,
			surname: manager.lastName
		});
		return {
			id: guid,
			isPm: true,
		};
	}
};

/**
 *
 * @param {ObjectId} projectId
 * @returns {Array} - returns array with unique steps or empty array
 */
const checkProjectHasMemoqStep = async (projectId) => {
	let { steps } = await Projects.findOne({ _id: projectId });
	if(steps.length) {
		steps = steps.map(step => step.memoqProjectId);
		return Array.from(new Set(steps.filter(item => !!item)));
	}
	return [];
};

const regainWorkFlowStatusByStepId = async (stepId, stepAction) => {
	let workFlowStatus;
	let { steps, tasks }  = await Projects.findOne({ 'steps.stepId': stepId })
	const {taskId, serviceStep: { title: jobType }, memoqDocIds} = steps.find(item => item.stepId === stepId)
	const {memoqProjectId} = tasks.find(item => item.taskId === taskId)

	if(jobType === 'Translation'){
		workFlowStatus = stepAction === 'Start' ? 'TranslationNotStarted' : 'Review1NotStarted'
		await updateTasks()
	}else{
		workFlowStatus = stepAction === 'Start' ? 'Review1NotStarted' : 'Completed'
		await updateTasks()
	}

	await Projects.updateOne({ 'steps.stepId': stepId }, { tasks })

	return { workFlowStatus, memoqProjectId, memoqDocIds }

	async function updateTasks(){
		tasks = tasks.map(item => {
			if(item.taskId === taskId){
				item.memoqDocs.map(item2 => {
					return {
						...item2,
						WorkflowStatus: workFlowStatus
					}
				})
				return item
			}
			return item
		})
	}
}

module.exports = {
	getProjectAfterCancelTasks,
	updateProjectStatus,
	setStepsStatus,
	downloadCompletedFiles,
	updateProjectProgress,
	updateWithApprovedTasks,
	getAfterReopenSteps,
	updateNonWordsTaskTargetFiles,
	updateOtherProject,
	assignMemoqTranslator,
	assignProjectManagers,
	checkProjectHasMemoqStep,
	updateProjectStatusForClientPortalProject,
	regainWorkFlowStatusByStepId
};

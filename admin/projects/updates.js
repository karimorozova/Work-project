const { Projects, User, MemoqProject, Units, Vendors } = require('../models')
const { getProject, updateProject, getProjectAfterUpdate } = require('./getProjects')

const {
	stepCancelNotifyVendor,
	notifyVendorStepStart
} = require('./emails')

const { pmMail } = require('../utils/mailtopm')

const {
	getUpdatedProjectFinanceToZero,
	getProjectFinancePrice
} = require('./porjectFinance')

const {
	getProjectTranslationDocs,
	getProjectUsers,
	setMemoqProjectUsers,
	assignMemoqTranslators,
	setMemoqDocsDeadline,
	setCancelledNameInMemoq,
	cancelMemoqDocs
} = require('../services/memoqs/projects')

const { downloadMemoqFile } = require('../services/memoqs/files')
const { getMemoqUsers, createMemoqUser } = require('../services/memoqs/users')
const { notifyManagerProjectStarts } = require('../utils')
const { sendQuoteToVendorsAfterProjectAccepted } = require('../utils')
const { calculateProjectTotal, recalculateStepFinance } = require("../сalculations/finance")


const cancelProjectInMemoq = async (project) => {
	if (project.status !== 'Cancelled') return

	const wordsTasks = project.tasks.filter(item => item.service.title === 'Translation' && item.memoqDocs.length)
	if (wordsTasks.length) {
		await cancelMemoqDocs(wordsTasks)
		await setCancelledNameInMemoq(wordsTasks, `${ project.projectId } - ${ project.projectName }`)
	}
}

async function updateProjectProgress(project, isCatTool) {
	let { steps, tasks } = project
	try {
		for (let task of tasks) {
			if (task.memoqDocs.length && isCatTool) {
				const docs = await getProjectTranslationDocs(task.memoqProjectId)
				task.memoqDocs = Array.isArray(docs) ? docs.filter(item => item.TargetLangCode === task.memoqTarget) : [ docs ]
				steps = updateWordcountStepsProgress({ steps, task })
			} else if (!isCatTool) {
				steps = updateStepsProgress(task, steps)
			}
		}
		return await updateProject({ "_id": project.id }, { steps, tasks })
	} catch (err) {
		console.log(err)
		console.log("Error in updateProjectProgress")
	}
}

async function getProjectAfterCancelTasks(tasks, project) {
	try {
		const { changedTasks, changedSteps, stepIdentify } = await cancelTasks(tasks, project)

		const notifySteps = stepIdentify.length ? changedSteps.filter(item => stepIdentify.indexOf(item.stepId) !== -1) : changedSteps
		await stepCancelNotifyVendor(notifySteps)

		await updateProject({ "_id": project.id }, { tasks: changedTasks, steps: changedSteps })
		await recalculateStepFinance(project.id)
		return await calculateProjectTotal(project.id)

	} catch (err) {
		console.log(err)
		console.log("Error in getProjectAfterCancelTasks")
		throw new Error(err.message)
	}
}

async function cancelTasks(tasks, project) {
	let projectTasks = [ ...project.tasks ]
	let projectSteps = [ ...project.steps ]
	const tasksIds = tasks.map(item => item.taskId)
	let inCompletedSteps = []

	if (projectSteps.length) {
		inCompletedSteps = projectSteps.map(item => {
			if (item.status !== "Completed" && tasksIds.indexOf(item.taskId) !== -1) return { ...item._doc }
		}).filter(item => !!item)
	}

	const stepIdentify = inCompletedSteps.length ? inCompletedSteps.map(step => step.stepId) : []
	const changedSteps = stepIdentify.length ? cancelSteps({ stepIdentify, steps: projectSteps }) : []

	try {
		const changedTasks = await cancelCheckedTasks({ tasksIds, projectTasks, changedSteps })
		return {
			changedTasks,
			changedSteps,
			stepIdentify
		}
	} catch (err) {
		console.log(err)
		console.log("Error in cancelTasks")
		throw new Error(err.message)
	}
}

function cancelSteps({ stepIdentify, steps }) {
	return steps.map(item => {
		if (stepIdentify.indexOf(item.stepId) !== -1) {
			let newStatus = item.status !== 'Completed' ? "Cancelled" : item.status

			if (+item.progress.wordsDone > 0 && newStatus !== 'Completed') {
				newStatus = "Cancelled Halfway"
				let finance = getStepNewFinance(item)
				return { ...item._doc, previousStatus: item.status, status: newStatus, finance }
			} else {
				item.finance = {
					Quantity: { receivables: 0, payables: 0 },
					Wordcount: { receivables: 0, payables: 0 },
					Price: { receivables: 0, payables: 0 }
				}
			}

			item.previousStatus = item.status
			item.status = newStatus
		}
		return item
	})
}

async function cancelCheckedTasks({ tasksIds, projectTasks, changedSteps }) {
	const unchangingStatuses = [ 'Pending Approval [DR1]', 'Completed' ]
	let tasks = [ ...projectTasks ]
	try {
		for (let task of tasks) {
			if (tasksIds.indexOf(task.taskId) !== -1 && unchangingStatuses.indexOf(task.status) === -1) {
				task.previousStatus = task.status
				task.status = getTaskStatusAfterCancel(changedSteps, task.taskId) || task.status
			}
		}
		return tasks
	} catch (err) {
		console.log(err)
		console.log("Error in cancelCheckedTasks")
		throw new Error(err.message)
	}
}

async function getTaskTargetFiles({ task, projectId, step }) {
	let { memoqDocs, memoqProjectId, targetLanguage, targetFilesStages } = task
	let { _id, stepNumber } = step
	let targetFiles = []

	try {
		for (let doc of memoqDocs) {
			const fileName = `${ targetLanguage }-${ stepNumber }-${ Math.floor(Math.random() * 1000000) }-${ doc.ImportPath }`
			const path = `/projectFiles/${ projectId }/${ fileName }`
			await downloadMemoqFile({ memoqProjectId, docId: doc.DocumentGuid, path: `./dist${ path }` })
			targetFiles.push({ fileName, path })
		}
		const _idxStage = targetFilesStages.findIndex(item => item.stepId === _id)

		if (_idxStage === -1) {
			targetFilesStages.push({ stepId: _id, files: targetFiles })
		} else {
			targetFilesStages[_idxStage].files = targetFiles
		}

		return {
			...task._doc,
			targetFiles,
			targetFilesStages
		}

	} catch (err) {
		console.log(err)
		console.log("Error in getTaskTargetFiles")
		throw new Error(err.message)
	}
}

async function downloadCompletedFiles(stepId) {
	try {
		let { _id, steps, tasks } = await getProject({ "steps._id": stepId })
		const step = steps.find(item => item._id.toString() === stepId.toString())
		const _taskIndex = tasks.findIndex(item => item.taskId === step.taskId)

		tasks[_taskIndex] = await getTaskTargetFiles({
			task: tasks[_taskIndex],
			projectId: _id,
			step
		})

		await Projects.updateOne({ _id }, { tasks })
	} catch (err) {
		console.log(err)
		console.log("Error in downloadCompletedFiles")
		throw new Error(err.message)
	}
}

// function getTaskNewFinance(changedSteps, task) {
// 	const { priceValues } = updateTaskNewFinance(changedSteps, task)
// 	const { finance } = task
// 	const Price = {
// 		...finance.Price,
// 		halfReceivables: +(priceValues.receivables.toFixed(2)),
// 		halfPayables: +(priceValues.payables.toFixed(2))
// 	}
// 	return { ...finance, Price }
// }

// function updateTaskNewFinance(changedSteps, task) {
// 	let priceValues = { receivables: 0, payables: 0 }
// 	const taskSteps = changedSteps.filter(item => item.taskId === task.taskId)
// 	for (let step of taskSteps) {
// 		if (step.status === "Cancelled Halfway") {
// 			priceValues.receivables += +step.finance.Price.halfReceivables
// 			priceValues.payables += +step.finance.Price.halfPayables
// 		} else if (step.status === "Completed") {
// 			priceValues.receivables += +step.finance.Price.receivables
// 			priceValues.payables += +step.finance.Price.payables
// 		}
// 	}
// 	return { priceValues }
// }

function getTaskStatusAfterCancel(steps, taskId) {
	const taskSteps = steps.filter(item => item.taskId === taskId).map(step => step.status)

	return taskSteps.map(i => i.status).includes('Cancelled Halfway')
			? 'Cancelled Halfway'
			: 'Cancelled'

	// const cancelledSteps = taskSteps.filter(item => item === "Cancelled")
	// const completedSteps = taskSteps.filter(item => item === "Completed")
	// const halfCancelledSteps = taskSteps.filter(item => item === "Cancelled Halfway")
	//
	// if (cancelledSteps.length === taskSteps.length || !steps.length) {
	// 	return "Cancelled"
	// }
	// if (completedSteps.length === taskSteps.length) {
	// 	return "Pending Approval [DR1]"
	// }
	// if (halfCancelledSteps.length || (completedSteps.length && completedSteps.length < taskSteps.length)) {
	// 	return "Cancelled Halfway"
	// }
}

function getStepNewFinance(step) {
	const { progress, finance } = step
	const { Wordcount, Price } = finance
	const done = progress.wordsDone / progress.totalWordCount
	Wordcount.payables = progress.wordsDone
	Price.halfReceivables = +((Price.receivables * done).toFixed(2))
	Price.halfPayables = +((Price.payables * done).toFixed(2))
	return { Wordcount, Price }
}

async function reOpenProject(project, ifChangePreviousStatus = true) {
	let { steps, tasks } = project

	if (ifChangePreviousStatus) {
		steps = reopenItem(steps)
		tasks = reopenItem(tasks)
	}

	return await updateProject(
			{ '_id': project._id },
			{ status: 'In progress', tasks, steps }
	)

	function reopenItem(arr) {
		return arr.map(item => {
			if (item.status === "Cancelled" || item.status === "Cancelled Halfway") {
				// item.status = item.previousStatus
			}
			return item
		})
	}
}

async function updateProjectStatusForClientPortalProject(projectId, action) {
	const project = await getProject({ "_id": projectId })

	if (action === 'approve') {
		project.status = 'Approved'
		project.tasks = changeTasksStatus(project.tasks, 'Approved')
	} else {
		project.status = 'Rejected'
		project.tasks = changeTasksStatus(project.tasks, 'Rejected')
	}

	function changeTasksStatus(tasks, statusTask) {
		return tasks.map(task => {
			task.status = statusTask
			return task
		})
	}

	return await updateProject({ "_id": projectId }, { status: project.status, tasks: project.tasks, isClientOfferClicked: true }
	)
}

async function updateProjectStatus(id, status, reason) {
	try {
		const project = await getProject({ "_id": id })
		// if (status === 'fromCancelled') return await reOpenProject(project)
		// if (status === 'fromClosed') return await reOpenProject(project, false)
		if (status !== "Cancelled" && status !== "Cancelled Halfway") {
			return await setNewProjectDetails(project, status, reason)
		}

		if (status === "Cancelled" || status === "Cancelled Halfway") {
			const { tasks, steps } = project
			const { changedTasks, changedSteps } = await cancelTasks(tasks, project)
			const Price = getUpdatedProjectFinanceToZero(changedTasks)

			if (steps.length) await stepCancelNotifyVendor(steps)
			return await updateProject({ "_id": id }, {
				status,
				reason,
				isPriceUpdated: false,
				finance: { ...project.finance, Price },
				tasks: changedTasks,
				steps: changedSteps
			})
		}

	} catch (err) {
		console.log(err)
		console.log("Error in updateProjectStatus")
		throw new Error(err.message)
	}
}


const setApprovedStepStatus = ({ project, step, steps }) => {
	const { status } = project
	const isProjectApprovedStatus = status === 'Approved' || status === 'In progress'
	const brotherlySteps = steps.filter(item => item.taskId === step.taskId)

	return steps.map(item => {
		if (item._id.toString() === step._id.toString()) {
			if (brotherlySteps.length > 1) {
				const { stepNumber } = step
				const prevStep = brotherlySteps.find(item => item.stepNumber === stepNumber - 1 && item.status !== 'Cancelled Halfway' && item.status !== 'Cancelled')
				if (prevStep && isProjectApprovedStatus) {
					item.status = prevStep.status === 'Completed' ? 'Ready to Start' : 'Waiting to Start'
					return item
				}
				item.status = isProjectApprovedStatus ? 'Ready to Start' : 'Approved'
				return item
			}
			item.status = isProjectApprovedStatus ? 'Ready to Start' : 'Approved'
			return item
		}
		return item
	})
}

async function setNewProjectDetails(project, status, reason) {
	try {
		if (status === "Approved") {
			return await getApprovedProject(project)
		}
		if (status === "Rejected") {
			const client = { ...project.customer._doc, id: project.customer.id }
			const user = await User.findOne({ "_id": client.projectManager._id })
			await pmMail(project, client, user)
		}
		return await updateProject({ "_id": project.id }, { status, isPriceUpdated: false, reason: reason })
	} catch (err) {
		console.log(err)
		console.log("Error in setNewProjectDetails")
		throw new Error(err.message)
	}
}

async function getApprovedProject(project) {
	const taskIds = project.tasks.map(item => item.taskId)
	const { tasks, steps } = updateWithApprovedTasks({ taskIds, project })
	project.isStartAccepted = true
	try {
		if (project.isStartAccepted) {
			await notifyManagerProjectStarts(project, false)
		}

		await notifyVendorStepStart(steps, steps, project)
		const updatedProject = await updateProject({ "_id": project.id }, { status: 'Approved', isStartAccepted: true, tasks, steps, isPriceUpdated: false })

		let updatedSteps = await sendQuoteToVendorsAfterProjectAccepted(updatedProject.steps, updatedProject)
		return await updateProject({ "_id": project.id }, { steps: updatedSteps })
	} catch (err) {
		console.log(err)
		console.log("Error in getApprovedProject")
		throw new Error(err.message)
	}
}

function updateWithApprovedTasks({ taskIds, project }) {
	const tasks = project.tasks.map(task => {
		if ((task.status === 'Created' || task.status === 'Quote sent') && taskIds.indexOf(task.taskId) !== -1) task.status = 'Approved'
		return task
	})

	let steps = project.steps
	for (const step of steps) {
		if(step.status === 'Approved') {
			steps = setApprovedStepStatus({ project: { status: 'Approved' }, step, steps })
		}
	}

	// const approvedSteps = project.steps.filter(item => item.status === 'Approved')
	// const notApprovedSteps = project.steps.filter(item => item.status !== 'Approved')
	// for (const step of approvedSteps) {
	// 	readySteps = setApprovedStepStatus({ project: { status: 'Approved' }, step, steps: project.steps })
	// }
	// console.log()
	// throw 'eeerr'
	// steps.push(...notApprovedSteps, ...readySteps)

	return { tasks, steps }
}

function updateStepsProgress(task, steps) {
	return steps.map(item => {
		if (task.taskId === item.taskId) {
			item.progress = item.status === 'In progress' && item.targetFile ? 100 : item.progress
		}
		return item
	})
}

function updateWordcountStepsProgress({ steps, task }) {
	const { memoqDocs: docs } = task
	return steps.map(item => {
		if (task.taskId === item.taskId) {
			item.progress = item.status === 'In progress' ? setStepsProgress(item.step.title, docs) : item.progress
		}
		return item
	})
}

function setStepsProgress(title, docs) {
	const prop = title === 'Translation' ? 'ConfirmedWordCount' : 'Reviewer1ConfirmedWordCount'
	const totalProgress = docs.reduce((acc, cur) => {
		acc.wordsDone = acc.wordsDone ? acc.wordsDone + +cur[prop] : +cur[prop]
		acc.totalWordCount = acc.totalWordCount ? acc.totalWordCount + +cur.TotalWordCount : +cur.TotalWordCount
		return acc
	}, {})
	let stepProgress = {}
	for (let doc of docs) {
		stepProgress[doc.DocumentGuid] = {
			wordsDone: +doc[prop],
			totalWordCount: +doc.TotalWordCount,
			fileName: doc.DocumentName
		}
	}
	return { ...stepProgress, ...totalProgress }
}

async function updateNonWordsTaskTargetFile({ project, jobId, path, fileName }) {
	// const steps = project.steps.map(item => {
	// 	if (item.id === jobId) {
	// 		item.status = 'Completed'
	// 		item.progress = 100
	// 	}
	// 	return item
	// })
	//
	// const neededStep = steps.find(item => item.id.toString() === jobId.toString())
	// // const stepCounter = neededStep.stepId.replace('-R', '')[neededStep.stepId.replace('-R', '').length - 1]
	//
	// const tasks = project.tasks.map(item => {
	// 	if (neededStep.taskId === item.taskId) {
	// 		let targetFiles = []
	// 		targetFiles.push({ fileName, path: path.split('./dist').pop() })
	// 		item.targetFiles = targetFiles
	//
	//
	// 		// let targetFilesStage1 = item.targetFilesStage1 || []
	// 		// let targetFilesStage2 = item.targetFilesStage2 || []
	//
	//
	//
	// 		// eval('targetFilesStage' + stepCounter).push({ fileName, path: path.split('./dist').pop() })
	//
	//
	// 		// item.targetFilesStage1 = targetFilesStage1
	// 		// item.targetFilesStage2 = targetFilesStage2
	//
	// 	}
	// 	return item
	// })
	//
	// try {
	// 	return await updateProject({ "_id": project.id }, { steps, tasks })
	// } catch (err) {
	// 	console.log(err)
	// 	console.log("Error in updateNonWordsTaskTargetFiles")
	// 	throw new Error(err.message)
	// }
}

async function updateNonWordsTaskTargetFiles({ project, paths, jobId }) {
	const steps = project.steps.map(item => {
		if (item.id === jobId) {
			item.status = 'Completed'
			item.progress = 100
		}
		return item
	})

	const neededStep = steps.find(item => item.id.toString() === jobId.toString())

	const tasks = project.tasks.map(item => {
		if (neededStep.taskId === item.taskId) {
			let targetFiles = []
			const _idxStage = item.targetFilesStages.findIndex(item => item.stepId === neededStep._id)

			for (let path of paths) {
				targetFiles.push({ fileName: path.split("/").pop(), path: path.split('./dist').pop() })
			}

			if (_idxStage === -1) {
				item.targetFilesStages.push({ stepId: neededStep._id, files: targetFiles })
			} else {
				item.targetFilesStages[_idxStage].files = targetFiles
			}

			item.targetFiles = targetFiles
		}
		return item
	})

	try {
		return await updateProject({ "_id": project.id }, { steps, tasks })
	} catch (err) {
		console.log(err)
		console.log("Error in updateNonWordsTaskTargetFiles")
		throw new Error(err.message)
	}
}

async function getAfterReopenSteps(steps, project) {
	try {
		// const updatedSteps = setStepsStatus({ steps, status: 'Started', project })
		const stepIdentify = steps.map(item => item.taskId + item.name)
		const chosenSteps = updatedSteps.filter(item => stepIdentify.indexOf(item.taskId + item.name) !== -1)
		const updatedtasks = getTasksAfterReopen({ steps: chosenSteps, tasks: project.tasks })
		return await updateProject({ "_id": project.id }, {
			tasks: updatedtasks,
			steps: updatedSteps,
			status: 'In progress'
		})
	} catch (err) {
		console.log(err)
		console.log("Error in getAfterReopenSteps")
		throw new Error(err.message)
	}
}

function getTasksAfterReopen({ steps, tasks }) {
	let updatedTasks = [ ...tasks ]
	for (let step of steps) {
		if (step.status === 'Started') {
			let taskIndex = updatedTasks.findIndex(item => item.taskId === step.taskId)
			updatedTasks[taskIndex].status = "Started"
		}
	}
	return updatedTasks
}

async function updateOtherProject(query, update) {
	return await MemoqProject.findOneAndUpdate(query, update, { new: false })
}

const assignMemoqTranslator = async (vendorId, stepId, projectId) => {
	const vendor = await Vendors.findOne({ _id: vendorId })
	const { steps, tasks } = await Projects.findOne({ _id: projectId }).populate('steps.vendor')
	const users = await getMemoqUsers()

	const neededStep = steps.find(step => step.stepId === stepId)
	const { taskId } = neededStep
	const { memoqProjectId } = tasks.find(item => item.taskId === taskId)

	let assignedSteps = []
	if (/(\sS02)/.exec(`${ stepId }`)) {
		assignedSteps.push(...steps.filter(item => item.taskId === taskId))
	} else {
		assignedSteps.push(neededStep)
	}
	assignedSteps = assignedSteps.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

	let projectUsers = []
	const currentProjectUsers = await getProjectUsers(memoqProjectId)

	if (Array.isArray(currentProjectUsers)) {
		for (let userInfo of currentProjectUsers) assignPM(userInfo)
	} else {
		if (currentProjectUsers.hasOwnProperty('User')) assignPM(currentProjectUsers)
	}
	const memoqUser = users.find(user => user.email === vendor.email)
	if (memoqUser) projectUsers.push({ id: memoqUser.id, isPm: false })

	const areUsersSet = await setMemoqProjectUsers(memoqProjectId, Array.from(new Set(projectUsers.filter((el, i, self) => self.map(item => item.id).indexOf(el.id) === i))))

	return areUsersSet ? await assignMemoqTranslators({ memoqProjectId, assignedSteps, users })
			: new Error("Can't set one or all users in memoQ")

	function assignPM({ ProjectRoles, User: { UserGuid } }) {
		const isPm = ProjectRoles['a:ProjectManager'] === 'true'
		projectUsers.push({ id: UserGuid, isPm })
	}
}

const assignProjectManagers = async ({ manager, memoqProjectId }) => {
	const users = await getMemoqUsers()
	const projectManagers = []
	const pm = await User.findOne({ _id: manager })
	projectManagers.push(await checkAndCreateManager(users, pm))
	await setMemoqProjectUsers(memoqProjectId, projectManagers)
}

const checkAndCreateManager = async (memoqUsers, manager) => {
	const memoqManager = memoqUsers.find(user => user.email === manager.email)

	if (memoqManager) {
		return { id: memoqManager.id, isPm: true }
	} else {
		const guid = await createMemoqUser({ firstName: manager.firstName, email: manager.email, surname: manager.lastName })
		return { id: guid, isPm: true }
	}
}

const checkProjectHasMemoqStep = async (projectId) => {
	let { steps } = await Projects.findOne({ _id: projectId })
	if (steps.length) {
		steps = steps.map(step => step.memoqProjectId)
		return Array.from(new Set(steps.filter(item => !!item)))
	}
	return []
}

const regainWorkFlowStatusByStepId = async (stepId, stepAction) => {
	let workFlowStatus
	let { steps, tasks } = await Projects.findOne({ 'steps.stepId': stepId }).populate('steps.step')
	const { taskId, step: { title: jobType }, memoqDocIds } = steps.find(item => item.stepId === stepId)
	const { memoqProjectId } = tasks.find(item => item.taskId === taskId)

	if (jobType === 'Translation') {
		workFlowStatus = stepAction === 'Start' ? 'TranslationNotStarted' : 'Review1NotStarted'
	} else {
		workFlowStatus = stepAction === 'Start' ? 'Review1NotStarted' : 'Completed'
	}

	const updatedTasks = tasks.map(item => {
		if (item.taskId === taskId) {
			item.memoqDocs.map(doc => {
				doc.WorkflowStatus = workFlowStatus
			})
			return item
		} else {
			return item
		}
	})

	await Projects.updateOne({ 'steps.stepId': stepId }, { tasks: updatedTasks })

	return { workFlowStatus, memoqProjectId, memoqDocIds }
}

const setStepDeadlineProjectAndMemoq = async ({ projectId, stepId }) => {
	const users = await getMemoqUsers()
	const allVendors = await Vendors.find()
	let { steps, tasks } = await Projects.findOne({ '_id': projectId })

	const { taskId } = steps.find(item => item.stepId === stepId)

	const allTasksStep = steps
			.filter(item => item.taskId === taskId)
			.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

	const currentStepIndex = allTasksStep.findIndex(item => item.stepId === stepId)

	if (currentStepIndex === 0) {
		const documentAssigment = generateStructure([ stepId ], steps)
		await setDeadlineByStepId(stepId, documentAssigment)
	}

	if (currentStepIndex === 1) {
		const mappedSteps = allTasksStep.map(({ stepId }) => stepId)
		const documentAssigment = generateStructure(mappedSteps, steps)
		for await (let stepId of mappedSteps) await setDeadlineByStepId(stepId, documentAssigment)
	}

	async function setDeadlineByStepId(stepId, structure) {
		const { memoqDocIds, taskId } = steps.find(item => item.stepId === stepId)
		const { memoqProjectId } = tasks.find(item => item.taskId === taskId)

		for await (let documentGuid of memoqDocIds)
			await setMemoqDocsDeadline(memoqProjectId, documentGuid, structure)
	}

	function generateStructure(arrIds, steps) {
		return arrIds.reduce((acc, curr) => {
			const { deadline, memoqAssignmentRole, vendor: vendorId } = steps.find(item => item.stepId === curr)

			const { email } = allVendors.find(({ _id }) => _id.toString() === vendorId.toString())

			const user = users.find(item => item.email === email)

			acc = acc + `
					<ns:TranslationDocumentUserRoleAssignment>
					<ns:DeadLine>${ deadline }</ns:DeadLine>
					<ns:DocumentAssignmentRole>${ memoqAssignmentRole }</ns:DocumentAssignmentRole>
					<ns:UserGuid>${ user.id }</ns:UserGuid>
					</ns:TranslationDocumentUserRoleAssignment>
				`
			return acc
		}, '')
	}
}

module.exports = {
	cancelProjectInMemoq,
	getProjectAfterCancelTasks,
	updateProjectStatus,
	downloadCompletedFiles,
	updateProjectProgress,
	updateWithApprovedTasks,
	getAfterReopenSteps,
	updateNonWordsTaskTargetFile,
	updateNonWordsTaskTargetFiles,
	updateOtherProject,
	assignMemoqTranslator,
	assignProjectManagers,
	checkProjectHasMemoqStep,
	updateProjectStatusForClientPortalProject,
	regainWorkFlowStatusByStepId,
	setStepDeadlineProjectAndMemoq,
	setApprovedStepStatus
}

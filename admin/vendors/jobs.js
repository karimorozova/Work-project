const {
	getProjectsForVendorPortal,
	getProject,
	taskCompleteNotifyPM,
	notifyManagerStepStarted,
	stepCompletedNotifyPM,
	nextVendorCanStartWorkNotification,
	notifyStepDecisionMade,
	setApprovedStepStatus
} = require('../projects')

const { Projects, Delivery, Languages } = require('../models')
const { updateMemoqProjectUsers } = require('../services/memoqs/projects')
const { dr1Instructions, drInstructionsCompliance } = require('../enums')
const fs = require('fs')

async function getJobs(id) {
	const allLanguages = await Languages.find()
	try {
		let jobs = []
		const projects = await getProjectsForVendorPortal({ 'steps.vendor': id })
		for (let project of projects) {
			const steps = getSteps(project, id, allLanguages)
			jobs.push(...steps)
		}
		return jobs
	} catch (err) {
		console.log(err)
		console.log("Error in getJobs")
	}
}

function getSteps(project, id, allLanguages) {
	try {
		const { steps, tasks } = project
		let assignedSteps = []
		let filteredSteps = steps.filter(item => item.vendor && item.vendor.id === id)
		for (let step of filteredSteps) {
			// if (step.name !== 'invalid') {
			const stepTask = tasks.find(item => item.taskId === step.taskId)
			const prevStep = getPrevStepData(stepTask, steps, step)
			const { targetLanguage, sourceLanguage } = step._doc
			assignedSteps.push({
				...step._doc,
				project_Id: project._id,
				projectId: project.projectId,
				projectName: project.projectName,
				projectStatus: project.status,
				brief: project.brief,
				manager: project.projectManager,
				industry: project.industry,
				memocDocs: stepTask.memoqDocs,
				sourceFiles: stepTask.sourceFiles,
				refFiles: stepTask.refFiles,
				taskTargetFiles: stepTask.targetFiles,
				fullSourceLanguage: getLangBySymbol(sourceLanguage),
				fullTargetLanguage: getLangBySymbol(targetLanguage),
				prevStep
			})
			// }
		}
		return assignedSteps

		function getLangBySymbol(symbol) {
			return allLanguages.find(({ symbol: s }) => s === symbol)
		}
	} catch (err) {
		console.log(err)
	}
}

function getPrevStepData(stepTask, steps, step) {

	const brotherlySteps = steps.filter(item => item.taskId === stepTask.taskId)
	const prevStep = brotherlySteps.find(item => item.stepNumber === step.stepNumber - 1)
	if (!prevStep) return false
	const prevProgress = isNaN(prevStep.progress) ? +(prevStep.progress.wordsDone / prevStep.progress.totalWordCount * 100).toFixed(2) : prevStep.progress

	return {
		status: prevStep.status,
		progress: prevProgress
	}
}

async function updateStepProp({ jobId, prop, value }) {
	try {
		const project = await getProject({ 'steps._id': jobId })

		const steps = project.steps.map(item => {
			if (item.id === jobId) {
				item.status = value
				if (prop === "status" && (value === "Approved" || value === "Rejected")) item.vendorsClickedOffer = [ item.vendor ]
			}
			return item
		})

		if (prop === "status") {
			return await manageStatuses({ project, steps, jobId, status: value })
		}

		await Projects.updateOne({ 'steps._id': jobId }, { steps })
	} catch (err) {
		console.log(err)
		console.log("Error in updateStepProp")
	}
}

async function manageStatuses({ project, steps, jobId, status }) {
	let { status: projectStatus, _id, tasks } = project
	const step = steps.find(item => item.id === jobId)
	const _taskIdx = tasks.findIndex(item => item.taskId === step.taskId)
	try {
		if (status === "Completed") {
			return await manageCompletedStatus({ project, jobId, steps, tasks, taskIndex: tasks[_taskIdx] })
		}

		if (status === "Approved") {
			const updatedSteps = setApprovedStepStatus({ project, step, steps })
			await notifyStepDecisionMade({ project, step, decision: 'accept' })
			return await Projects.updateOne({ "steps._id": jobId }, { steps: updatedSteps })
		}

		if (status === "Rejected") {
			const updatedSteps = setRejectedStatus({ steps, jobId })
			await notifyStepDecisionMade({ project, step, decision: 'rejected' })
			return await Projects.updateOne({ "steps._id": jobId }, { steps: updatedSteps })
		}

		if (status === "In progress") {
			if (tasks[_taskIdx].status !== "In progress") {
				tasks[_taskIdx].status = "In progress"
				projectStatus = projectStatus === 'Approved' ? 'In progress' : projectStatus
				await notifyManagerStepStarted(project, step)
			}
		}

		await Projects.updateOne({ 'steps._id': jobId }, { steps, tasks, status: projectStatus })
	} catch (err) {
		console.log(err)
		console.log("Error in manageStatuses")
	}
}

async function manageCompletedStatus({ project, jobId, steps, tasks, taskIndex }) {
	const step = steps.find(item => item.id === jobId)
	const task = tasks[taskIndex]

	try {
		await stepCompletedNotifyPM(project, step)

		if (isAllStepsCompleted({ steps, task: tasks[taskIndex] })) {
			tasks[taskIndex].status = 'Pending Approval [DR1]'
			await Projects.updateOne({ "steps._id": jobId }, { tasks })
			await pushTasksToDR1(project, task, step)
			await taskCompleteNotifyPM(project, task)
		} else {
			const nextStep = steps
					.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')
					.find(item => item.stepNumber === step.stepNumber + 1)

			if (nextStep) {
				tasks[taskIndex].status = 'In progress'
				const updatedSteps = setApprovedStepStatus({ project, step, steps })
				await Projects.updateOne({ "steps._id": jobId }, { steps: updatedSteps, tasks })
				await nextVendorCanStartWorkNotification({ task, steps, jobId })
			}
		}

		return await Projects.findOne({ "steps._id": jobId })
	} catch (err) {
		console.log(err)
		console.log("Error in manageCompletedStatus")
	}
}

const pushTasksToDR1 = async (project, task, step) => {
	const { _id, projectManager, accountManager } = project
	const instructions = step.serviceStep.title === 'Compliance' ? drInstructionsCompliance : dr1Instructions
	const files = getTaskTargetFilesWithCopy(project, task)
	project.tasksDR1.push({
		dr1Manager: projectManager,
		dr2Manager: accountManager,
		instructions,
		taskId: task.taskId,
		files
	})
	return await Projects.updateOne({ _id: _id }, { tasksDR1: project.tasksDR1 })
}

function getTaskTargetFilesWithCopy(project, task) {
	return task.targetFiles.reduce((acc, cur) => {
		const originalName = cur.path.split("/").pop()
		const dr1FileName = `${ Math.floor(Math.random() * 1000000) }-${ originalName }`

		fs.copyFile(`./dist/projectFiles/${ project._id }/${ originalName }`, `./dist/projectFiles/${ project._id }/${ dr1FileName }`, (err) => {
			if (err) throw err
		})

		acc.push({
			fileName: dr1FileName,
			path: `/projectFiles/${ project._id }/${ dr1FileName }`,
			isFileApproved: false
		})

		return acc
	}, [])
}

function getWithReadyToStartSteps({ task, steps }) {
	// const stage2step = task.service.steps.find(item => item.stage === 'stage2')
	// return steps.map(item => {
	// 	if (stage2step && item.status === 'Waiting to Start' && item.taskId === task.taskId) {
	// 		item.status = 'Ready to Start'
	// 	}
	// 	return item
	// })
}

function setRejectedStatus({ steps, jobId }) {
	return steps.map(item => {
		if (item.id === jobId) {
			item.status = "Rejected"
		}
		return item
	})
}


async function setTaskStatusDR1({ project, jobId, steps, status }) {
	// let { tasks } = project
	// const { taskId } = steps.find(item => item._id.toString() === jobId)
	//
	// const currSteps = steps
	// 		.filter(item => item.taskId === taskId)
	// 		.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')
	//
	// const stepNumbers = currSteps.map(item => item.stepNumber)
	// const maxStepNumber = Math.max.apply(null, stepNumbers)
	//
	//
	// const updatedTasks = tasks.map(item => {
	// 	if (item.taskId === taskId) {
	//
	// 		if (currSteps.stepNumber === maxStepNumber) {
	//
	// 		} else {
	// 			item.status = 'In progress'
	// 		}
	// 		return item
	//
	// 		// if (currSteps.length === 2 && currSteps[0].status === "Completed" && currSteps[1].status === "Completed" ||
	// 		// 		currSteps.length === 1 && currSteps[0].status === "Completed"
	// 		// ) {
	// 		// 	item.status = "Pending Approval [DR1]"
	// 		// } else {
	// 		//
	// 		// }
	// 		// return item
	//
	// 	}
	// 	return item
	// })
	//
	// projectStatus = projectStatus === 'Approved' ? 'In progress' : projectStatus
	// try {
	// 	await Projects.updateOne({ 'steps._id': jobId }, { status: projectStatus, tasks: updatedTasks, steps })
	// } catch (err) {
	// 	console.log(err)
	// 	console.log("Error in setTaskStatusDR1")
	// }
}


function isAllStepsCompleted({ steps, task }) {
	const taskSteps = steps
			.filter(item => item.taskId === task.taskId)
			.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

	return !taskSteps.length ? false : taskSteps.every(item => item.status === 'Completed')
}

module.exports = { getJobs, updateStepProp, setRejectedStatus }

const { getProjects, getProject, taskCompleteNotifyPM, notifyManagerStepStarted, stepCompletedNotifyPM } = require('../projects')
const { Projects, Delivery, Languages } = require('../models')
const { updateMemoqProjectUsers } = require('../services/memoqs/projects')
const { dr1Instructions, drInstructionsCompliance } = require('../enums')
const fs = require('fs');

async function getJobs(id) {
	const allLanguages = await Languages.find()
	try {
		let jobs = []
		const projects = await getProjects({ 'steps.vendor': id })
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
			if (step.name !== 'invalid') {
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
			}
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
	const sameSteps = steps.filter(item => item.taskId === stepTask.taskId && item.stepId !== step.stepId)
	const stage1 = stepTask.service.steps.find(item => item.stage === 'stage1')
	if (!sameSteps.length || stage1.step.title === step.serviceStep.title) {
		return false
	}
	const prevStep = sameSteps.find(item => item.serviceStep.title === stage1.step.title)
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
				item[prop] = value
				
				if(prop === "status" || value === "Accepted" || value === "Rejected" ) {
					item.vendorsClickedOffer = [item.vendor]
				}
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
	const step = steps.find(item => item.id === jobId)
	const task = project.tasks.find(item => item.taskId === step.taskId)
	try {
		if (status === "Completed") {
			return await manageCompletedStatus({ project, jobId, steps, task })
		}
		if (status === "Accepted" || status === "Rejected") {
			const updatedSteps = status === "Accepted"
					? await setAcceptedStepStatus({ project, steps, jobId })
					: setRejectedStatus({ steps, jobId })
			return await Projects.updateOne({ "steps._id": jobId }, { steps: updatedSteps })
		}
		if (status === "Started") {
			if (task.status !== "Started") {
				await setTaskStatusAndSave({ project, jobId, steps, status: "Started" })
				return await notifyManagerStepStarted(project, step)
			}
			await notifyManagerStepStarted(project, step)
		}
		await Projects.updateOne({ 'steps._id': jobId }, { steps })
	} catch (err) {
		console.log(err)
		console.log("Error in manageStatuses")
	}
}

async function manageCompletedStatus({ project, jobId, steps, task }) {
	const step = steps.find(item => item.id === jobId)
	try {
		await stepCompletedNotifyPM(project, step)

		console.log(isAllStepsCompleted({ steps, task }))

		if (isAllStepsCompleted({ steps, task })) {
			await setTaskStatusAndSave({ project, jobId, steps, status: "Pending Approval [DR1]" })
      await pushTasksToDR1(project, task, step)
			return await taskCompleteNotifyPM(project, task)
		}

		const stage1step = task.service.steps.find(item => item.stage === 'stage1')
		if (step.serviceStep.step.toString() === stage1step.step._id.toString()) {
			const updatedSteps = getWithReadyToStartSteps({ task, steps })
			return await Projects.updateOne({ "steps._id": jobId }, { steps: updatedSteps })
		}
		return await Projects.updateOne({ "steps._id": jobId }, { steps })
	} catch (err) {
		console.log(err)
		console.log("Error in manageCompletedStatus")
	}
}

const pushTasksToDR1 = async (project, task, step) =>{
  const {_id, projectManager, accountManager} = project
	const instructions = step.serviceStep.title === 'Compliance' ? drInstructionsCompliance : dr1Instructions
  const files = getTaskTargetFiles(project,task)
  project.tasksDR1.push({
    dr1Manager: projectManager,
    dr2Manager: accountManager,
    instructions,
    taskId: task.taskId,
    files
  })
  return await Projects.updateOne({_id: _id}, {tasksDR1: project.tasksDR1})
}

function getTaskTargetFiles(project,task) {
  return task.targetFiles.reduce((acc, cur) => {
    const originalName = cur.path.split("/").pop()
    const dr1FileName = `${Math.floor(Math.random() * 1000000)}-${originalName}`

    fs.copyFile(`./dist/projectFiles/${project._id}/${originalName}`, `./dist/projectFiles/${project._id}/${dr1FileName}`, (err) => {
      if (err) throw err;
    });

    acc.push({
      fileName: dr1FileName,
      path: `/projectFiles/${project._id}/${dr1FileName}`,
      isFileApproved: false,
    })

    return acc
  }, [])
}


// async function addToDelivery(project, task) {
// 	const files = getTaskTargetFiles(task)
// 	const pair = task.sourceLanguage ? `${ task.sourceLanguage } >> ${ task.targetLanguage }` : `${ task.targetLanguage } / ${ task.packageSize }`
// 	try {
// 		await Delivery.updateOne({ projectId: project.id }, {
// 			$push: {
// 				tasks: {
// 					dr1Manager: project.projectManager,
// 					dr2Manager: project.accountManager,
// 					status: task.deliveryStatus,
// 					pair,
// 					taskId: task.taskId,
// 					instructions: dr1Instructions,
// 					files
// 				}
// 			}
// 		}, { upsert: true })
// 	} catch (err) {
// 		console.log(err)
// 		console.log("Error in the addToDelivery")
// 	}
// }


function getWithReadyToStartSteps({ task, steps }) {
	const stage2step = task.service.steps.find(item => item.stage === 'stage2')
	return steps.map(item => {
		if (stage2step && item.status === 'Waiting to Start' && item.taskId === task.taskId) {
			item.status = 'Ready to Start'
		}
		return item
	})
}

async function setAcceptedStepStatus({ project, steps, jobId }) {
	let status = "Accepted"
	try {
		if (project.status === 'In progress' || project.status === 'Approved') {
			status = 'Ready to Start'
		}
		const step = steps.find(item => item.id === jobId)
		const task = project.tasks.find(item => item.taskId === step.taskId)
		const taskSteps = steps.filter(item => item.taskId === task.taskId)
		if (taskSteps.length > 1) {
			const stage1 = task.service.steps.find(item => item.stage === 'stage1')
			if (step.serviceStep.symbol !== stage1.step.symbol) {
				status = taskSteps[0].status === 'Completed' ? status : 'Waiting to Start'
			}
		}
		const updatedSteps = steps.map(item => {
			item.status = item.id === jobId && item.status !== 'Rejected' ? status : item.status
			return item
		})
		if ((status === 'Ready to Start' || status === 'Waiting to Start')) {
			await updateMemoqProjectUsers(updatedSteps)
		}
		return updatedSteps
	} catch (err) {
		console.log(err)
		console.log("Error in setAcceptedStepStatus")
	}
}

function setRejectedStatus({ steps, jobId }) {
	return steps.map(item => {
		if (item.id === jobId) {
			item.status = "Rejected"
		}
		return item
	})
}

async function setTaskStatusAndSave({ project, jobId, steps, status }) {
	const { tasks } = project
	const { taskId } = steps.find(item => item._id.toString() === jobId)
	const currSteps = steps
				.filter(item => item.taskId === taskId)
				.filter(({status}) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

	const updatedTasks = tasks.map(item => {
		if (item.taskId === taskId) {
			if (currSteps.length === 2 && currSteps[0].status === "Completed" && currSteps[1].status === "Completed" ||
					currSteps.length === 1 && currSteps[0].status === "Completed"
			) {
				item.status = "Pending Approval [DR1]"
			} else {
				item.status = 'In progress'
			}
			return item
		}
		return item
	})
	let projectStatus = getProjectStatus({ project, status, updatedTasks })
	try {
		await Projects.updateOne({ 'steps._id': jobId }, { status: projectStatus, tasks: updatedTasks, steps })
	} catch (err) {
		console.log(err)
		console.log("Error in setTaskStatusAndSave")
	}
}

function getProjectStatus({ project, status, updatedTasks }) {
	let projectStatus = project.status
	if (projectStatus === "Approved" || projectStatus === "Started") {
		return status === 'Started' ? 'In progress' : projectStatus
	}
	const incompletedTasks = updatedTasks.find(item => item.status !== 'Ready for Delivery' && item.status !== 'Cancelled')
	return incompletedTasks ? projectStatus : "Ready for Delivery"
}

function isAllStepsCompleted({ steps, task }) {
	const taskSteps = steps
			.filter(item => item.taskId === task.taskId)
			.filter(({status}) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

	return !taskSteps.length ? false : taskSteps.every(item => item.status === 'Completed')
}

module.exports = { getJobs, updateStepProp }

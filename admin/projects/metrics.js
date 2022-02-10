const { getProject, updateProject } = require('./getProjects')
const { Step, Units, Vendors } = require('../models')
const {
	setTaskMetrics
} = require('../сalculations/wordcount')
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor')
const { getProjectAnalysis } = require('../services/memoqs/projects')
const ObjectId = require('mongodb').ObjectID


async function updateProjectMetricsAndCreateSteps(projectId, tasks) {
	// try {
	// 	const project = await getProject({ "_id": projectId })
	// 	let { steps, customer, tasks: existingTasks, industry, discounts } = project
	// 	let isMetricsExist = true
	//
	// 	if (!tasks) tasks = existingTasks.filter(task => !task.hasOwnProperty('metrics'))
	//
	// 	filterExistingTasks()
	//
	// 	for await (let task of tasks) {
	// 		const { stepsAndUnits } = task
	// 		const isIncludesWordCount = stepsAndUnits.find(item => item.unit === 'CAT Wordcount')
	//
	// 		if (!!isIncludesWordCount && task.status === "Created") {
	// 			const analysis = await tryToGetMemoqMetrics(task.memoqProjectId, undefined)
	//
	// 			if (analysis) {
	// 				const taskMetrics = getTaskMetrics({ task, matrix: project.customer.matrix, analysis })
	// 				task.metrics = task.metrics || { ...taskMetrics }
	//
	// 				let newSteps = await generateStepsForCATTasks(task, industry, customer, discounts, projectId)
	// 				newSteps = checkIsSameVendor(newSteps)
	//
	// 				const stepWithVendor = newSteps.find(step => step.vendor)
	// 				if (stepWithVendor) {
	// 					const vendor = await Vendors.findOne({ _id: stepWithVendor.vendor._id })
	// 					if (vendor) task.metrics = setTaskMetrics({ metrics: task.metrics, matrix: vendor.matrix, prop: 'vendor' })
	// 				}
	// 				steps.push(...newSteps)
	// 			} else {
	// 				isMetricsExist = false
	// 			}
	// 		}
	// 	}
	//
	// 	existingTasks.push(...tasks)
	//
	// 	return await updateProject({ "_id": projectId }, { tasks: existingTasks, steps, isMetricsExist })
	//
	// 	function filterExistingTasks() {
	// 		const newTasksIds = tasks.map(i => i.taskId)
	// 		existingTasks = existingTasks.filter(({ taskId }) => !newTasksIds.includes(taskId))
	// 	}
	// } catch (err) {
	// 	console.log(err)
	// 	console.log("Error in updateProjectMetricsAndCreateSteps")
	// }
}

async function tryToGetMemoqMetrics(memoqProjectId, analysis) {
	return new Promise(async (resolve, reject) => {
		if (analysis) {
			resolve(analysis)
		} else {
			analysis = await getProjectAnalysis(memoqProjectId)
			setTimeout(async () => {
				resolve (await tryToGetMemoqMetrics(memoqProjectId, analysis))
			}, 400)
		}
	})
}

module.exports = {
	updateProjectMetricsAndCreateSteps
	// getProjectWithUpdatedFinance
}

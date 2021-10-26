const { updateProject, getProject } = require("./getProjects")
// const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor')
const { getStepFinanceData, getNewStepFinanceData, calculateProjectTotal } = require('../сalculations/finance')
// const { gatherServiceStepInfo } = require('./helpers')
const ObjectId = require('mongodb').ObjectID

async function createTasksAndStepsForCustomUnits(tasksInfo, iterator = 0) {
	const {
		refFiles,
		sourceFiles,
		industry,
		stepsAndUnits,
		stepsAdditions,
		service,
		targets,
		source,
		projectId: _id,
		internalProjectId: projectId,
		nativeProjectName,
		projectManager,
		customerName
	} = tasksInfo

	const { tasks: projectsTasks } = await getProject({ _id })

	try {
		let tasks = await generateTasksForCustomUnits({ source, service, targets, stepsAndUnits, projectsTasks, projectId, refFiles, sourceFiles }, iterator)
		let { steps, additions } = await generateStepsForCustomUnits({ tasks, stepsAdditions })
		await updateProject({ _id }, { $push: { tasks, steps, additionsSteps: additions } })
		return await calculateProjectTotal(_id)

	} catch (err) {
		console.log(err)
		console.log("Error in createTasksAndStepsForCustomUnits")
	}
}

async function generateTasksForCustomUnits({ source, service, targets, stepsAndUnits, projectsTasks, projectId, refFiles, sourceFiles }, iterator) {
	let tasks = []
	let tasksLength = projectsTasks.length + 1
	const isDuo = service.languageForm === 'Duo'

	for (const item of targets) {
		const idNumber = tasksLength < 10 ? `T0${ tasksLength + iterator }` : `T${ tasksLength + iterator }`
		const taskId = projectId + ` ${ idNumber }`
		tasks.push({
			projectId,
			taskId,
			service,
			stepsAndUnits,
			memoqSource: isDuo ? source.memoq : item.memoq,
			memoqTarget: item.memoq,
			sourceLanguage: isDuo ? source.symbol : item.symbol,
			targetLanguage: item.symbol,
			fullSourceLanguage: isDuo ? source : item,
			fullTargetLanguage: item,
			refFiles,
			sourceFiles
		})
		tasksLength++
	}

	return tasks
}

async function generateStepsForCustomUnits({ tasks, stepsAdditions }) {
	const steps = []
	const additions = []

	for (const task of tasks) {
		const { projectId, taskId, service, stepsAndUnits, memoqSource, memoqTarget, sourceLanguage, targetLanguage, fullSourceLanguage, fullTargetLanguage, metrics } = task
		for (let i = 0; i < stepsAndUnits.length; i++) {

			const { finance, nativeFinance, defaultStepPrice, clientRate, vendorRate, nativeVendorRate } =
					await getNewStepFinanceData({
						projectId,
						fullSourceLanguage,
						fullTargetLanguage,
						metrics,
						step: stepsAndUnits[i].step,
						receivablesUnit: stepsAndUnits[i].receivables.unit,
						receivablesQuantity: stepsAndUnits[i].receivables.quantity,
						payablesQuantity: stepsAndUnits[i].payables.quantity
					}, false)

			steps.push({
				stepNumber: i + 1,
				projectId,
				stepId: `${ taskId } ${ i + 1 < 10 ? `S0${ i + 1 }` : `S${ i + 1 }` }`,
				taskId,
				service,
				progress: 0,
				step: stepsAndUnits[i].step,
				receivablesUnit: stepsAndUnits[i].receivables.unit,
				payablesUnit: stepsAndUnits[i].payables.unit,
				memoqSource,
				memoqTarget,
				sourceLanguage,
				targetLanguage,
				fullSourceLanguage,
				fullTargetLanguage,
				start: stepsAndUnits[i].start,
				deadline: stepsAndUnits[i].deadline,
				stepAndUnit: stepsAndUnits[i],
				finance,
				nativeFinance,
				defaultStepPrice,
				clientRate,
				vendorRate,
				nativeVendorRate
			})
		}

		for (let i = 0; i < stepsAdditions.length; i++) {
			additions.push({
				projectId,
				taskId,
				title: stepsAdditions[i].title,
				finance: {
					Price: {
						receivables: stepsAdditions[i].value
					}
				}
			})
		}

	}
	return { steps, additions }
}

// async function getStepsForUnits(type, allInfo) {
// 	const { tasks, stepsAndUnits, stepsDates, industry, customer, discounts, projectId } = allInfo
// 	const steps = []
//
// 	// for (let i = 0; i < tasks.length; i++) {
// 	// 	const task = tasks.length > 1 ? tasks[i] : tasks[0]
// 	//
// 	// 	const firstStepId = `${ task.taskId } ${ i + 1 < 10 ? `S0${ i + 1 }` : `S${ i + 1 }` }`
// 	// 	const firstStep = await generateStepForCustomTasks(stepsAndUnits[0], task, firstStepId)
// 	//
// 	// 	if (type === 'Duo') {
// 	// 		const secondStepId = `${ task.taskId } ${ i + 2 < 10 ? `S0${ i + 2 }` : `S${ i + 2 }` }`
// 	// 		const secondStep = await generateStepForCustomTasks(stepsAndUnits[1], task, secondStepId)
// 	// 		steps.push(firstStep, secondStep)
// 	// 	} else {
// 	// 		steps.push(firstStep)
// 	// 	}
// 	// }
//
// 	return steps
//
// 	async function generateStepForCustomTasks(serviceStep, task, stepId) {
// 		// serviceStep = await gatherServiceStepInfo(serviceStep)
// 		// const { title, step } = serviceStep
// 		// const { sourceLanguage, targetLanguage } = task
// 		// const stepName = title
// 		// const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry })
//
// 		// const key = serviceStep.hasOwnProperty('quantity') ? 'quantity' : 'hours'
// 		const quantity = { receivables: serviceStep[key], payables: serviceStep[key] }
//
// 		const { finance, clientRate, vendorRate, vendor, defaultStepPrice, nativeFinance, nativeVendorRate } =
// 				await getStepFinanceData({ customer, industry, serviceStep, task, vendorId, quantity, discounts, projectId })
//
// 		return {
// 			...task,
// 			stepId,
// 			serviceStep,
// 			name: stepName,
// 			start: stepsDates[0].start,
// 			deadline: stepsDates[0].deadline,
// 			size: serviceStep.size || 1,
// 			vendor: ObjectId(vendor),
// 			vendorRate,
// 			clientRate,
// 			finance,
// 			defaultStepPrice,
// 			progress: 0,
// 			vendorsClickedOffer: [],
// 			isVendorRead: false,
// 			nativeFinance,
// 			nativeVendorRate,
// 			stepsAndUnits
// 		}
// 	}
// }

module.exports = { createTasksAndStepsForCustomUnits }

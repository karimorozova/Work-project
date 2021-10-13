const { updateProject } = require("./getProjects")
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor')
const { getStepFinanceData } = require('../сalculations/finance')
const { gatherServiceStepInfo } = require('./helpers')
const ObjectId = require('mongodb').ObjectID


async function createTasksAndStepsForCustomUnits(allInfo, iterator = 0) {
	const { project, stepsAndUnits } = allInfo
	try {
		const { customer: { _id: customer }, _id, industry, discounts, projectId } = project

		let steps = []
		let tasks = await getTasksForCustomUnits({ ...allInfo, projectId }, iterator)
		tasks = JSON.parse(JSON.stringify(tasks))

		stepsAndUnits.length === 2
				? steps = await getStepsForUnits('Duo', { ...allInfo, customer, industry, tasks, discounts })
				: steps = await getStepsForUnits('Mono', { ...allInfo, customer, industry, tasks, discounts })

		steps = checkIsSameVendor(steps)
		return await updateProject({ _id }, { $push: { tasks, steps } })
	} catch (err) {
		console.log(err)
		console.log("Error in createTasksWithHoursUnit")
	}
}

async function getTasksForCustomUnits(tasksInfo, iterator) {
	const { stepsAndUnits, projectId, service, targets, source, stepsDates, taskRefFiles } = tasksInfo

	let tasks = []
	let tasksLength = tasksInfo.project.tasks.length + 1
	for (let i = 0; i < targets.length; i++) {
		const idNumber = tasksLength < 10 ? `T0${ tasksLength + iterator }` : `T${ tasksLength + iterator }`
		const taskId = projectId + ` ${ idNumber }`
		tasks.push({
			taskId,
			targetLanguage: targets[i].symbol,
			sourceLanguage: source.symbol,
			languageForm: service.languageForm,
			refFiles: taskRefFiles,
			service,
			stepsAndUnits,
			projectId,
			start: stepsDates[0].start,
			deadline: stepsDates[stepsDates.length - 1].deadline,
			status: 'Created'
		})
		tasksLength++
	}
	return tasks
}

async function getStepsForUnits(type, allInfo) {
	const { tasks, stepsAndUnits, stepsDates, industry, customer, discounts, projectId } = allInfo
	const steps = []

	for (let i = 0; i < tasks.length; i++) {
		const task = tasks.length > 1 ? tasks[i] : tasks[0]

		const firstStepId = `${ task.taskId } ${ i + 1 < 10 ? `S0${ i + 1 }` : `S${ i + 1 }` }`
		const firstStep = await generateStepForCustomTasks(stepsAndUnits[0], task, firstStepId)

		if (type === 'Duo') {
			const secondStepId = `${ task.taskId } ${ i + 2 < 10 ? `S0${ i + 2 }` : `S${ i + 2 }` }`
			const secondStep = await generateStepForCustomTasks(stepsAndUnits[1], task, secondStepId)
			steps.push(firstStep, secondStep)
		} else {
			steps.push(firstStep)
		}
	}

	return steps

	async function generateStepForCustomTasks(serviceStep, task, stepId) {
		serviceStep = await gatherServiceStepInfo(serviceStep)
		const { title, step } = serviceStep
		const { sourceLanguage, targetLanguage } = task
		const stepName = title
		const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry })

		const key = serviceStep.hasOwnProperty('quantity') ? 'quantity' : 'hours'
		const quantity = { receivables: serviceStep[key], payables: serviceStep[key] }

		const { finance, clientRate, vendorRate, vendor, defaultStepPrice, nativeFinance, nativeVendorRate } =
				await getStepFinanceData({ customer, industry, serviceStep, task, vendorId, quantity, discounts, projectId })

		return {
			...task,
			stepId,
			serviceStep,
			name: stepName,
			start: stepsDates[0].start,
			deadline: stepsDates[0].deadline,
			size: serviceStep.size || 1,
			vendor: ObjectId(vendor),
			vendorRate,
			clientRate,
			finance,
			defaultStepPrice,
			progress: 0,
			vendorsClickedOffer: [],
			isVendorRead: false,
			nativeFinance,
			nativeVendorRate,
			stepsAndUnits
		}
	}
}

module.exports = { createTasksAndStepsForCustomUnits }

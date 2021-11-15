const { assignedDefaultTranslator } = require('../services/memoqs/projects')
const { Projects } = require('../models')
const { rateExchangeVendorOntoProject } = require('../helpers/commonFunctions')
const { getProject } = require("../projects")
const { assignmentsEmitter } = require("../events/assignments")
const { updateProject } = require("../projects/getProjects")
const { getRelativeQuantity } = require("../helpers/projectMetrics")

async function removeVendorFromStep({ stepId, projectId }) {
	const project = await Projects.findOne({ _id: projectId })
	let { steps } = project
	const _idx = steps.findIndex(({ _id }) => _id.toString() === stepId.toString())

	if (_idx !== -1) {
		steps[_idx].nativeFinance.Price.payables = steps[_idx].finance.Price.payables = steps[_idx].nativeFinance.Wordcount.payables = steps[_idx].finance.Wordcount.payables = 0
		steps[_idx].nativeVendorRate = steps[_idx].vendorRate = 0
		steps[_idx].vendor = null
		steps[_idx].status = 'Created'
		steps[_idx].vendorsClickedOffer = []
		await Projects.updateOne({ _id: projectId }, { steps })
	}
}


async function reassignVendor({ projectId, stepId, progress, isStart, isPay, reason, vendor }) {
	const project = await getProject({ "_id": projectId })
	let { steps, tasks, projectCurrency, crossRate } = project

	try {
		const _stepIdx = steps.findIndex(({ _id }) => `${ _id }` === `${ stepId }`)
		const _taskIdx = tasks.findIndex(({ taskId }) => taskId === steps[_stepIdx].taskId)
		tasks[_taskIdx].status = "In progress"

		const updatedSteps = makeStep({task: tasks[_taskIdx], step: steps[_stepIdx], progress: +progress, vendor, projectCurrency, crossRate, isStart, isPay })

		const oldStep = updatedSteps().getOldStep()
		const newStep = updatedSteps().getNewStep()

		steps.splice(_stepIdx, 1, oldStep, newStep)

		const neededSteps = steps.filter(({ taskId }) => taskId === tasks[_taskIdx].taskId)
		for (let i = 0; i < neededSteps.length; i++) {
			const { stepId } = neededSteps[i]
			const _idx = steps.findIndex(({ stepId: id }) => id === stepId)
			if (_idx !== -1) steps[_idx].stepNumber = i + 1
		}

		await assignedDefaultTranslator(tasks[_taskIdx].memoqProjectId, newStep)

		assignmentsEmitter.emit('client-decide-tasks', oldStep, reason, isPay, newStep, isStart)

		return await updateProject({ "_id": projectId }, { tasks, steps })

	} catch (err) {
		console.log(err)
		console.log("Error in reassignVendor")
	}
}

const makeStep = ({task, step, progress, vendor, projectCurrency, crossRate, isStart, isPay }) => {
	const { finance, receivablesUnit: { type }, vendorRate, nativeVendorRate, nativeFinance, status, stepId, progress: oldProgress } = step._doc
	const { _id: vendorId, nativeRate: comingNativeVendorRate } = Object.values(vendor)[0]
	const newVendorRate = rateExchangeVendorOntoProject(projectCurrency, 'EUR', +comingNativeVendorRate, crossRate)
	const restProgress = +(100 - progress).toFixed(2)

	const { _id, ...rest } = step._doc
	return function () {
		return {
			getOldStep: () => ({
				...rest,
				stepId: stepId + ' [C]',
				status: isStart && !isPay ? 'Cancelled' : 'Cancelled Halfway',
				progress: getOldStepProgress(type, oldProgress, +progress),
				finance: getOldStepFinance(finance, progress)(vendorRate),
				nativeFinance: getOldStepFinance(nativeFinance, progress)(nativeVendorRate)
			}),

			getNewStep: () => ({
				...rest,
				stepId: stepId + ' [R]',
				//TODO: REMOVE
				status: 'Created',
				// status: 'In progress',
				vendor: vendorId,
				vendorRate: newVendorRate,
				nativeVendorRate: comingNativeVendorRate,
				vendorsClickedOffer: [],
				isVendorRead: false,
				progress: getNewStepProgress(type, oldProgress, +progress),
				finance: getNewStepFinance(finance, restProgress)(newVendorRate),
				nativeFinance: getNewStepFinance(nativeFinance, restProgress)(comingNativeVendorRate)
			})
		}
	}

	function getOldStepFinance(obj, progress) {
		let finance = JSON.parse(JSON.stringify(obj))

		if (isStart && isPay) {
			finance.Wordcount.receivables = finance.Quantity.receivables = finance.Price.receivables = 0
			finance = mutatedFinanceByPercent(finance, progress)
		}
		if (isStart && !isPay) {
			finance.Wordcount.receivables = finance.Quantity.receivables = finance.Price.receivables = 0
			finance.Wordcount.payables = finance.Quantity.payables = finance.Price.payables = 0
		}
		if (!isStart && isPay) {
			finance = mutatedFinanceByPercent(finance, progress)
		}
		if (!isStart && !isPay) {
			finance.Wordcount.payables = finance.Quantity.payables = finance.Price.payables = 0
			finance = mutatedFinanceByPercent(finance, progress)
		}

		return function (rate) {
			finance.Price.payables = +((finance.Quantity.payables || finance.Wordcount.payables || 0) * rate).toFixed(2)
			return finance
		}
	}

	function getNewStepFinance(obj, progress) {
		let finance = JSON.parse(JSON.stringify(obj))

		if (!isStart && isPay) {
			finance = mutatedFinanceByPercent(finance, progress)
		}
		if (!isStart && !isPay) {
			finance = mutatedFinanceByPercent(finance, progress)
		}
		if(isStart && type === 'CAT Wordcount'){
			finance.Wordcount.payables = +getRelativeQuantity(task.metrics, 'vendor')
		}

		return function (rate) {
			finance.Price.payables = +((finance.Quantity.payables || finance.Wordcount.payables || 0) * rate).toFixed(2)
			return finance
		}
	}

	function getOldStepProgress(type) {
		const isCat = type === "CAT Wordcount"
		let newProgress

		if ((isStart && isPay) || (!isStart && isPay) || (!isStart && !isPay)) {
			if (isCat) {
				oldProgress.wordsDone = +(progress * oldProgress.totalWordCount / 100).toFixed(2)
				newProgress = { ...oldProgress }
			} else {
				newProgress = progress
			}
		}
		if (isStart && !isPay) {
			newProgress = isCat ? { ...oldProgress, wordsDone: 0 } : 0
		}

		return newProgress
	}

	function getNewStepProgress(type, oldProgress, progress) {
		const isCat = type === "CAT Wordcount"
		let newProgress

		if (isStart) {
			newProgress = isCat ? { ...oldProgress, wordsDone: 0 } : 0
		} else {
			if (isCat) {
				oldProgress.wordsDone = +(progress * oldProgress.totalWordCount / 100).toFixed(2)
				newProgress = { ...oldProgress }
			} else {
				newProgress = progress
			}
		}
		return newProgress
	}

	function mutatedFinanceByPercent(finance, progress) {
		for (const QWP in finance) if (Object.hasOwnProperty.call(finance, QWP)) {
			for (const RP in finance[QWP]) if (Object.hasOwnProperty.call(finance[QWP], RP)) {
				finance[QWP][RP] = +(finance[QWP][RP] * (progress / 100)).toFixed(2)
			}
		}
		return finance
	}
}

module.exports = { reassignVendor, removeVendorFromStep }

const { returnVendorRate } = require('../сalculations/wordcount')
const { stepMiddleAssignNotification, stepMiddleReassignedNotification } = require('../utils')
const { assignedDefaultTranslator } = require('../services/memoqs/projects')
const { Projects } = require('../models')
const { rateExchangeVendorOntoProject } = require('../helpers/commonFunctions')
const { getProject } = require("../projects")
const { ObjectID: ObjectId } = require("mongodb")

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
	const { steps, tasks, projectCurrency, crossRate } = project

	const _stepIdx = steps.findIndex(({ _id }) => `${ _id }` === `${ stepId }`)
	const _taskIdx = tasks.findIndex(({ taskId }) => taskId === steps[_stepIdx].taskId)

	const updatedSteps = makeStep({ step: steps[_stepIdx], progress: +progress, vendor, projectCurrency, crossRate, isStart, isPay })

	const oldStep = updatedSteps().getOldStep()
	const newStep = updatedSteps().getNewStep()

	steps.splice(_stepIdx, 1, oldStep, newStep)


	// const oldStep = .getOldStep()
	// const newStep = makeStep({ step: steps[_stepIdx], progress, vendor }).getNewStep()


	try {
		// await Projects.updateOne({ "_id": projectId }, { steps })
		throw 'Stop'
		// const { step, vendor, isStart, isPay, reason, progress } = reassignData
		// console.log(projectId, stepId, progress, isStart, isPay, reason, vendor)

		// return

		//
		// const newStep = await getNewStep({ isStart, progress, step, vendor, project, task: tasks[_taskIdx], allUnits })
		// const updatedStep = updateCurrentStep({ step: stepForUpdatedStep, isStart, isPay, progress, allUnits })

		// const updatedIndex = steps.findIndex(item => item.stepId === step.stepId)
		// updatedStep.stepId = updatedStep.stepId + '-Cancelled'

		// steps.splice(updatedIndex, 1, updatedStep, newStep)


		// await assignedDefaultTranslator(tasks[_taskIdx].memoqProjectId, newStep)
		// tasks[_taskIdx].status = "In progress"
		// await stepMiddleReassignedNotification(updatedStep, reason, isPay)
		// await stepMiddleAssignNotification(newStep, isStart)

	} catch (err) {
		console.log(err)
		console.log("Error in reassignVendor")
	}
}

const makeStep = ({ step, progress, vendor, projectCurrency, crossRate, isStart, isPay }) => {
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
				status: 'Cccc',
				progress: type === "CAT Wordcount" ? oldProgress : +progress,
				finance: getOldStepFinance(finance, progress)(vendorRate),
				nativeFinance: getOldStepFinance(nativeFinance, progress)(nativeVendorRate)
			}),

			getNewStep: () => ({
				...rest,
				stepId: stepId + ' [R]',
				status: 'Created',
				vendor: vendorId,
				vendorRate: newVendorRate,
				nativeVendorRate: comingNativeVendorRate,
				vendorsClickedOffer: [],
				isVendorRead: false,
				progress: type === "CAT Wordcount" ? getNewStepProgress(oldProgress, restProgress) : restProgress,
				finance: getNewStepFinance(finance, restProgress)(newVendorRate),
				nativeFinance: getNewStepFinance(nativeFinance, restProgress)(comingNativeVendorRate)
			})
		}
	}

	function getOldStepFinance(obj, progress) {
		let finance = JSON.parse(JSON.stringify(obj))

		if (isStart && isPay) {

		} else if (!isStart && !isPay) {

		} else if (isStart && !isPay) {

		}

		finance = mutatedFinanceByPercent(finance, progress)

		return function (rate) {
			finance.Price.payables = +((finance.Quantity.payables || finance.Wordcount.payables || 0) * rate).toFixed(2)
			return finance
		}
	}

	function getNewStepFinance(obj, progress) {
		let finance = JSON.parse(JSON.stringify(obj))

		if (isStart && isPay) {

		} else if (!isStart && !isPay) {

		} else if (isStart && !isPay) {

		}

		finance = mutatedFinanceByPercent(finance, progress)

		return function (rate) {
			finance.Price.payables = +((finance.Quantity.payables || finance.Wordcount.payables || 0) * rate).toFixed(2)
			return finance
		}
	}

	function mutatedFinanceByPercent(finance, progress) {
		for (const QWP in finance) if (Object.hasOwnProperty.call(finance, QWP)) {
			for (const RP in finance[QWP]) if (Object.hasOwnProperty.call(finance[QWP], RP)) {
				finance[QWP][RP] = +(finance[QWP][RP] * (progress / 100)).toFixed(2)
			}
		}
		return finance
	}

	function getNewStepProgress(oldProgress, progress) {
		const restProgress = +(100 - progress).toFixed(2)
		oldProgress.wordsDone = +(restProgress * oldProgress.totalWordCount / 100).toFixed(2)
		return oldProgress
	}


	// function getNewStepProgress(step, progress, isStart, allUnits) {
	// 	if (!isStart) {
	// 		return getUpdatedStepProgress(step, progress, allUnits)
	// 	}
	// 	let newProgress = 0
	// 	if (type === "CAT Wordcount") {
	// 		newProgress = { ...step.progress, wordsDone: 0 }
	// 	}
	// 	return newProgress
	// }

}


function updateCurrentStep({ step, isStart, isPay, progress, allUnits }) {
	let updatedStep = step
	const { payables, receivables } = updatedStep.finance.Price
	const { payables: nativePayables } = updatedStep.nativeFinance.Price

	if (+progress) {
		updatedStep.status = "Cancelled Halfway"
		calculateFinancePriceForOldStep('halfReceivables', 'halfPayables')
	} else {
		updatedStep.status = "Cancelled"
		calculateFinancePriceForOldStep('receivables', 'payables')
	}

	updatedStep.progress = getUpdatedStepProgress(updatedStep, progress, allUnits)

	function calculateFinancePriceForOldStep(typeClient, typeVendor) {
		const progressPart = progress / 100
		let { finance, nativeFinance } = updatedStep
		switch (true) {
			case !isStart && isPay:
				finance.Price[typeClient] = nativeFinance.Price[typeClient] = sumValues(receivables, progressPart)
				finance.Price[typeVendor] = sumValues(payables, progressPart)
				nativeFinance.Price[typeVendor] = sumValues(nativePayables, progressPart)
				break
			case isStart && isPay:
				finance.Price[typeClient] = nativeFinance.Price[typeClient] = 0
				finance.Price[typeVendor] = sumValues(payables, progressPart)
				nativeFinance.Price[typeVendor] = sumValues(nativePayables, progressPart)
				break
			case !isStart && !isPay:
				finance.Price[typeClient] = sumValues(receivables, progressPart)
				finance.Price[typeVendor] = nativeFinance.Price[typeVendor] = 0
				break
			case isStart && !isPay:
				finance.Price[typeClient] = nativeFinance.Price[typeClient] = 0
				finance.Price[typeVendor] = nativeFinance.Price[typeVendor] = 0
				break
		}
	}

	return updatedStep
}

const sumValues = (A, B) => +(A * B).toFixed(2)


module.exports = { reassignVendor, removeVendorFromStep }

const { getVendors } = require('../vendors/getVendors')
const { getClient } = require('../clients/getClients')
const { updateProject } = require('../projects/getProjects')
const { hasActiveRateValue } = require('./general')
const { getStepFinanceData } = require('./finance')
const { setTaskFinance, getPriceAfterApplyingDiscounts } = require('../projects/helpers')
const { Languages } = require('../models')
const { rateExchangeVendorOntoProject } = require('../helpers/commonFunctions')


function setTaskMetrics({ metrics, matrix, prop }) {
	let taskMetrics = { ...metrics }
	for (let key in matrix) {
		taskMetrics[key][prop] = +matrix[key].rate
	}
	return taskMetrics
}

// async function getAfterWordcountPayablesUpdated({ project, step }) {
// 	try {
// 		let { tasks, steps, customer, industry, discounts, _id: projectId } = project
// 		const taskIndex = tasks.findIndex(item => item.taskId === step.taskId)
// 		const stepIndex = steps.findIndex(item => item.taskId === step.taskId && item.stepId === step.stepId)
//
// 		tasks[taskIndex].metrics = setTaskMetrics({ metrics: tasks[taskIndex].metrics, matrix: step.vendor.matrix, prop: 'vendor' })
// 		const { serviceStep, vendor } = step
//
// 		const quantity = { receivables: tasks[taskIndex].metrics.totalWords, payables: tasks[taskIndex].metrics.totalWords }
//
// 		const { finance, vendorRate, nativeFinance, nativeVendorRate } =
// 				await getStepFinanceData({ customer, industry, serviceStep, task: tasks[taskIndex], vendorId: vendor._id, quantity, discounts, projectId }, true)
//
// 		steps[stepIndex].finance = finance
// 		steps[stepIndex].vendorRate = vendorRate
//
// 		steps[stepIndex].nativeFinance = nativeFinance
// 		steps[stepIndex].nativeVendorRate = nativeVendorRate
//
// 		return await updateProject({ '_id': project.id }, { tasks, steps })
// 	} catch (err) {
// 		console.log(err)
// 		console.log('Error in getAfterWordcountPayablesUpdated')
// 	}
// }

async function payablesCalc({ metrics, project, step }) {
	const { crossRate, projectCurrency } = project
	try {
		const nativeVendorRate = await returnVendorRate(step, project)
		const rate = {
			value: rateExchangeVendorOntoProject(projectCurrency, 'EUR', +nativeVendorRate.value, crossRate)
		}
		return getStepPayables({ rate, metrics, step }, nativeVendorRate)
	} catch (err) {
		console.log(err)
		console.log("Error in payablesCalc")
	}
}

async function returnVendorRate(step, project) {
	const allLanguages = await Languages.find()
	let rate = {}
	if (step.vendor.rates.pricelistTable.length) {
		const { price } = returnPriceFromVendorRate(
				step.vendor.rates.pricelistTable,
				returnIdFromLanguageSymbol(allLanguages, step.sourceLanguage).toString(),
				returnIdFromLanguageSymbol(allLanguages, step.targetLanguage).toString(),
				step.serviceStep.step, step.serviceStep.unit, project.industry._id.toString()
		)
		rate.value = price
		rate.active = true
	} else {
		rate = { value: 0, active: true }
	}

	return rate

	function returnIdFromLanguageSymbol(allLanguages, symbol) {
		return allLanguages.find(item => item.symbol === symbol)._id
	}

	function returnPriceFromVendorRate(vendorRates, source, target, step, unit, industry) {
		return vendorRates.find(i => {
			return i.sourceLanguage._id === source && i.targetLanguage._id === target && i.step._id === step && i.unit._id === unit && i.industry._id === industry
		})
	}
}


function getStepPayables({ rate, metrics, step }, nativeVendorRate) {

	let { finance, nativeFinance } = step
	let rateValue = rate ? rate.value : 0
	let nativeFinanceValue = nativeVendorRate ? nativeVendorRate.value : 0
	const percentageProgress = Math.trunc((step.progress.wordsDone / metrics.totalWords) * 100)

	const fictitiousProgressCountReceivables = +finance.Wordcount.receivables - +(finance.Wordcount.receivables * (percentageProgress / 100))
	const fictitiousProgressCountPayables = +finance.Wordcount.payables - +(finance.Wordcount.payables * (percentageProgress / 100))

	finance.Wordcount = nativeFinance.Wordcount = {
		receivables: +fictitiousProgressCountReceivables,
		payables: +fictitiousProgressCountPayables
	}

	finance.Price.payables = fictitiousProgressCountReceivables * rateValue
	nativeFinance.Price.payables = fictitiousProgressCountPayables * nativeFinanceValue

	return { ...step, finance, vendorRate: rate, nativeVendorRate }
}

function calcCost(metrics, field, rate) {
	let cost = 0
	let wordsSum = 0
	const rateValue = rate ? rate.value : 0
	for (let key in metrics) {
		if (key !== 'totalWords') {
			cost += metrics[key].value * metrics[key][field] * rateValue
			wordsSum += metrics[key].value
		}
	}
	cost += (metrics.totalWords - wordsSum) * rateValue
	if (rate && cost < rate.min) {
		cost = rate.min
	}
	return cost
}

async function updateProjectCosts(project) {
	console.log('updateProjectCosts77')
	// let finance = {
	// 	Wordcount: getProjectFinanceData(project, 'Wordcount'),
	// 	Price: getProjectFinanceData(project, 'Price')
	// }
	// const { receivables, payables } = finance.Price
	// const roi = payables ? ((receivables - payables) / payables).toFixed(2) : 0
	// try {
	// 	const checkStatuses = [ 'Quote sent', 'Approved' ]
	// 	const isPriceUpdated = checkStatuses.indexOf(project.status) !== -1
	// 	return await updateProject({ '_id': project.id }, {
	// 		tasks: project.tasks,
	// 		steps: project.steps,
	// 		finance,
	// 		isPriceUpdated,
	// 		roi
	// 	})
	// } catch (err) {
	// 	console.log(err)
	// 	console.log('Error in updateProjectCosts')
	// }
}

function getProjectFinanceData(project, prop) {
	//FIN53
	// const activeTasks = project.tasks.filter(item => item.status !== "Cancelled")
	// return activeTasks.reduce((acc, cur) => {
	// 	const receivables = +cur.finance[prop].halfReceivables || +cur.finance[prop].receivables
	// 	const payables = +cur.finance[prop].halfPayables || +cur.finance[prop].payables
	// 	acc.receivables = acc.receivables ? +(acc.receivables + receivables).toFixed(2) : receivables
	// 	acc.payables = acc.payables ? +(acc.payables + payables).toFixed(2) : payables
	// 	return acc
	// }, {receivables: +project.paymentAdditions.reduce((acc, {value}) => acc += +value, 0)})
}

module.exports = {
	payablesCalc,
	updateProjectCosts,
	calcCost,
	setTaskMetrics,
	// getAfterWordcountPayablesUpdated,
	returnVendorRate
}

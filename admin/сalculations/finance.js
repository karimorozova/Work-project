const { CurrencyRatio, Pricelist, Projects, Discounts } = require('../models')
const { multiplyPrices } = require('../multipliers')
const { getPriceAfterApplyingDiscounts } = require('../projects/helpers')
const { rateExchangeVendorOntoProject, rateExchangeProjectOntoVendor } = require('../helpers/commonFunctions')
const { getProject, updateProject } = require('../projects/getProjects')
const { setTaskMetrics } = require("../сalculations/wordcount")

const setUpdatedFinanceData = async (data) => {
	const { projectId, stepId, quantityReceivables, quantityPayables, rateReceivables, ratePayables, totalReceivables, totalPayables } = data
	const project = await getProject({ "_id": projectId })
	const { steps, projectCurrency, crossRate } = project
	const _idx = steps.findIndex(item => item._id.toString() === stepId.toString())

	if (_idx === -1) return project

	const { receivablesUnit } = steps[_idx]
	const objectKey = receivablesUnit.type === 'CAT Wordcount' ? 'Wordcount' : 'Quantity'

	steps[_idx].finance.Price = {
		receivables: totalReceivables,
		payables: totalPayables
	}

	steps[_idx].finance[objectKey] = steps[_idx].nativeFinance[objectKey] = {
		receivables: quantityReceivables,
		payables: quantityPayables
	}

	steps[_idx].clientRate = rateReceivables
	steps[_idx].vendorRate = ratePayables
	steps[_idx].nativeVendorRate = rateExchangeProjectOntoVendor(projectCurrency, 'EUR', +ratePayables, crossRate)

	steps[_idx].nativeFinance.Price = {
		receivables: totalReceivables,
		payables: +(rateExchangeProjectOntoVendor(projectCurrency, 'EUR', +ratePayables, crossRate) * quantityPayables).toFixed(2)
	}

	await Projects.updateOne({ "_id": projectId }, { steps })
	return await calculateProjectTotal(projectId)
}

//FINANCE FN #2 USED FOR PROJECT TOTAL ==>
const calculateProjectTotal = async (projectId) => {
	const { steps } = await Projects.findOne({ "_id": projectId })
	const finance = {
		"Price": {
			receivables: 0,
			payables: 0
		}
	}
	steps.forEach(step => {
		const { finance: { Price } } = step
		finance.Price.receivables += +Price.receivables
		finance.Price.payables += +Price.payables
	})
	return await updateProject({ '_id': projectId }, { finance })
}

//FINANCE FN #1 USED FOR STEPS  ==>
const recalculateStepFinance = async (projectId) => {
	const { steps, discounts, minimumCharge, customer } = await getProject({ _id: projectId })
	let newDiscounts = discounts
	const newSteps = updateStepsFinanceWithDiscounts(steps, newDiscounts)
	let queryToUpdateSteps = { steps: newSteps }
	const sum = newSteps.reduce((acc, curr) => acc += curr.finance.Price.receivables, 0)

	const isUsedMinimumCharge = !minimumCharge.toIgnore && (+sum.toFixed(2) <= +minimumCharge.value.toFixed(2) && minimumCharge.value > 0)

	if (isUsedMinimumCharge) {
		newDiscounts = []
		queryToUpdateSteps = await updateStepsWithMinimal(steps, minimumCharge)
	}

	await Projects.updateOne({ _id: projectId }, { "discounts": newDiscounts, "minimumCharge.isUsed": isUsedMinimumCharge, ...queryToUpdateSteps })
}

const updateStepsFinanceWithDiscounts = (steps, discounts = []) => {
	for (let step of steps) {
		let { finance: { Price: { receivables } }, clientRate: value } = step
		const { receivablesUnit: { type } } = step
		const isMemoqCatUnit = type === 'CAT Wordcount'
		const quantity = isMemoqCatUnit ? step.finance.Wordcount.receivables : step.finance.Quantity.receivables
		if (!value) value = 0
		receivables = +quantity * +value

		step.finance.Price.receivables = discounts.length
				? getPriceAfterApplyingDiscounts(discounts, receivables).toFixed(2)
				: receivables.toFixed(2)
	}

	return steps
}

const updateStepsWithMinimal = async (steps, minimumCharge) => {
	const minimumCost = minimumCharge.value / steps.filter(({ status }) => status !== 'Cancelled').length
	const newSteps = steps.map((step) => {
		if (step.status !== "Cancelled") {
			step.finance.Price.receivables = minimumCost
		}
		return step
	})
	return { 'steps': newSteps }
}

const getClientDiscount = async (clientDiscountsIds) => {
	const allDiscounts = await Discounts.find().lean()
	return allDiscounts.filter(({ _id }) => clientDiscountsIds.includes(_id))
}

const getNewStepPayablesFinanceData = async ({ step, vendor, industry, projectCurrency, crossRate, task, nativeRate }) => {
	const currencyRatio = await CurrencyRatio.findOne()
	const defaultVendorPricelist = await Pricelist.findOne({ isVendorDefault: true })
	const { fullSourceLanguage, fullTargetLanguage, payablesUnit } = step
	const { type } = payablesUnit
	const isMemoqCatUnit = type === 'CAT Wordcount'

	const dataForComparison = {
		sourceLanguage: fullSourceLanguage._id,
		targetLanguage: fullTargetLanguage._id,
		step: step.step._id,
		unit: payablesUnit._id,
		industry: industry._id
	}

	let vendorPrice = !!nativeRate
			? nativeRate
			// : getPriceFromPersonRates(vendor.rates.pricelistTable, dataForComparison) || getPriceFromPricelist(defaultVendorPricelist, dataForComparison, vendor.currency, currencyRatio) / 2 || 0
			: getPriceFromPersonRates(vendor.rates.pricelistTable, dataForComparison) || 0

	step.vendorRate = rateExchangeVendorOntoProject(projectCurrency, 'EUR', +vendorPrice, crossRate)
	step.nativeVendorRate = +vendorPrice

	if (isMemoqCatUnit) {
		task.metrics = setTaskMetrics({ metrics: task.metrics, matrix: vendor.matrix, prop: "vendor" })
		step.finance.Wordcount.payables = step.nativeFinance.Wordcount.payables = step.step.title === 'Translation' ? +getRelativeQuantity(task.metrics, 'vendor') : task.metrics.totalWords
	}

	const quantity = isMemoqCatUnit ? step.finance.Wordcount.payables : step.finance.Quantity.payables

	step.finance.Price.payables = (quantity * step.vendorRate).toFixed(2)
	step.nativeFinance.Price.payables = (quantity * step.nativeVendorRate).toFixed(2)

	return { task, step }
}

const getNewStepFinanceData = async ({ projectId, fullSourceLanguage, fullTargetLanguage, metrics, step, receivablesUnit, receivablesQuantity, payablesQuantity }, isMemoq) => {
	const currencyRatio = await CurrencyRatio.findOne()
	const { customer, industry, discounts } = await getProject({ "projectId": projectId })
	const { rates: { pricelistTable }, defaultPricelist, currency } = customer
	const pricelist = await Pricelist.findOne({ "_id": defaultPricelist })

	const dataForComparison = {
		sourceLanguage: fullSourceLanguage._id,
		targetLanguage: fullTargetLanguage._id,
		step: step._id,
		unit: receivablesUnit._id,
		industry: industry._id
	}

	let clientRate = getPriceFromPersonRates(pricelistTable, dataForComparison) || getPriceFromPricelist(pricelist, dataForComparison, currency, currencyRatio)

	const finance = stepFinance()
	const nativeFinance = stepFinance()
	const defaultStepPrice = finance.Price.receivables


	function stepFinance() {
		return {
			Quantity: {
				receivables: receivablesQuantity,
				payables: payablesQuantity
			},
			Wordcount: {
				receivables: isMemoq
						? step.title === 'Translation' ? +getRelativeQuantity(metrics, 'client') : metrics.totalWords
						: 0,
				payables: 0
			},
			Price: {
				receivables: isMemoq
						? step.title === 'Translation' ? +(clientRate * +getRelativeQuantity(metrics, 'client')).toFixed(2) : +(clientRate * +metrics.totalWords).toFixed(2)
						: +(clientRate * receivablesQuantity).toFixed(2),
				payables: 0
			}
		}
	}

	return {
		clientRate,
		vendorRate: 0,
		nativeVendorRate: 0,
		finance,
		nativeFinance,
		defaultStepPrice
	}
}

const getPriceFromPersonRates = (pricelistTable, data) => {
	const { sourceLanguage, targetLanguage, step, unit, industry } = data
	const row = pricelistTable.find(row => (
			row.sourceLanguage.toString() === sourceLanguage.toString() &&
			row.targetLanguage.toString() === targetLanguage.toString() &&
			row.industry.toString() === industry.toString() &&
			row.step.toString() === step.toString() &&
			row.unit.toString() === unit.toString()
	))
	return row ? row.price : undefined
}

const getPriceFromPricelist = (pricelist, data, currency, currencyRatio) => {
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = pricelist
	const { sourceLanguage, targetLanguage, step, unit, industry } = data
	let row = basicPricesTable.find(langPair => `${ langPair.sourceLanguage } ${ langPair.targetLanguage }` === `${ sourceLanguage } ${ targetLanguage }`)
	if (!row) row = {
		euroBasicPrice: 0,
		usdBasicPrice: currencyRatio.USD,
		gbpBasicPrice: currencyRatio.GBP
	}
	const stepRow = stepMultipliersTable.find(item => `${ item.step } ${ item.unit }` === `${ step } ${ unit }`)
	const stepMultiplier = stepRow ? stepRow.multiplier : 100
	const industryRow = industryMultipliersTable.find(item => item.industry.toString() === industry.toString())
	const industryMultiplier = industryRow ? industryRow.multiplier : 100
	const basicPrice = getCorrectBasicPrice(row, currency)
	return multiplyPrices(basicPrice, stepMultiplier, industryMultiplier)
}

const getRelativeQuantity = (metrics, key) => {
	const { totalWords, ...rest } = metrics
	let counter = 0
	for (let item in rest) {
		if (rest.hasOwnProperty(item)) {
			counter += (rest[item].value * rest[item][key]) / 100
		}
	}
	return counter
}

const getCorrectBasicPrice = (basicPriceRow, currency) => {
	if (currency === 'USD') return basicPriceRow.usdBasicPrice
	else if (currency === 'EUR') return basicPriceRow.euroBasicPrice
	else return basicPriceRow.gbpBasicPrice
}

module.exports = {
	setUpdatedFinanceData,
	getPriceFromPersonRates,
	getPriceFromPricelist,
	getCorrectBasicPrice,
	getNewStepFinanceData,
	getNewStepPayablesFinanceData,
	calculateProjectTotal,
	recalculateStepFinance
}

const { CurrencyRatio, Pricelist, Projects } = require('../models')
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

const calculateProjectTotal = async (projectId) => {
	const { steps, additionsSteps } = await Projects.findOne({ "_id": projectId })

	const finance = {
		"Price": {
			receivables: 0,
			payables: 0
		}
	}

	steps.forEach(step => {
		const { status, finance: { Price } } = step

		if (status === 'Cancelled Halfway') {
			finance.Price.receivables += Price.halfReceivables
			finance.Price.payables += Price.halfPayables
		} else {
			finance.Price.receivables += Price.receivables
			finance.Price.payables += Price.payables
		}
	})

	additionsSteps.forEach(step => {
		const { finance: { Price } } = step
		finance.Price.receivables += Price.receivables
	})

	return await updateProject({ '_id': projectId }, { finance })
}

const getNewStepPayablesFinanceData = async ({ step, vendor, industry, projectCurrency, crossRate, task }) => {
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

	let vendorPrice = getPriceFromPersonRates(vendor.rates.pricelistTable, dataForComparison)
			|| getPriceFromPricelist(defaultVendorPricelist, dataForComparison, vendor.currency, currencyRatio) / 2
			|| 0

	step.vendorRate = rateExchangeVendorOntoProject(projectCurrency, 'EUR', +vendorPrice, crossRate)
	step.nativeVendorRate = +vendorPrice

	if (isMemoqCatUnit) {
		task.metrics = setTaskMetrics({ metrics: task.metrics, matrix: vendor.matrix, prop: "vendor" })
		step.finance.Wordcount.payables = +getRelativeQuantity(task.metrics, 'vendor')
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

	if (discounts.length) {
		const { Price: { receivables } } = finance
		finance.Price.receivables = getPriceAfterApplyingDiscounts(discounts, receivables)
	}

	function stepFinance() {
		return {
			Quantity: {
				receivables: receivablesQuantity,
				payables: payablesQuantity
			},
			Wordcount: {
				receivables: isMemoq ? +getRelativeQuantity(metrics, 'client') : 0,
				payables: 0
			},
			Price: {
				receivables: isMemoq ? +(clientRate * +getRelativeQuantity(metrics, 'client')).toFixed(2) : +(clientRate * receivablesQuantity).toFixed(2),
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

const getStepFinanceData = async (projectData, forWords = false) => {
	// const { customer, serviceStep, industry, task, vendorId, quantity, discounts, projectId } = projectData
	// // const { crossRate, projectCurrency } = await Projects.findOne({ "_id": projectId })
	// const { metrics, sourceLanguage, targetLanguage } = task
	//
	// // const client = await Clients.findOne({ _id: customer })
	// // const { rates, defaultPricelist, currency } = client
	// // const currencyRatio = await CurrencyRatio.findOne()
	// // const pricelist = await Pricelist.findOne({ _id: defaultPricelist })
	// // const { _id: sourceId } = await Languages.findOne({ symbol: sourceLanguage })
	// // const { _id: targetId } = await Languages.findOne({ symbol: targetLanguage })
	// const { step, unit, size, title } = serviceStep
	// const fullUnit = await Units.findOne({ _id: unit })
	//
	// let vendor
	// if (vendorId) vendor = await Vendors.findOne({ _id: vendorId })
	//
	// const dataForComparison = {
	// 	sourceLanguage: sourceId,
	// 	targetLanguage: targetId,
	// 	step,
	// 	unit,
	// 	size: size ? size : 1,
	// 	industry: industry._id
	// }
	//
	// let clientPrice = getPriceFromPersonRates(rates.pricelistTable, dataForComparison) || getPriceFromPricelist(pricelist, dataForComparison, currency, currencyRatio)
	// let vendorPrice = vendor ? getPriceFromPersonRates(vendor.rates.pricelistTable, dataForComparison) : 0
	//
	// vendorPrice = (vendorPrice !== undefined) ? vendorPrice : getPriceFromPricelist(defaultVendorPricelist, dataForComparison, vendor.currency, currencyRatio)
	//
	// const clientRate = {
	// 	value: clientPrice,
	// 	active: true
	// }
	//
	// let vendorRate = ""
	// let nativeVendorRate = ""
	//
	// if (!!vendor) {
	// 	vendorRate = { value: rateExchangeVendorOntoProject(projectCurrency, 'EUR', +vendorPrice, crossRate), active: true }
	// 	nativeVendorRate = { value: +vendorPrice, active: true }
	// }
	//
	// const finance = stepFinance(false)
	// const nativeFinance = stepFinance(true)
	//
	// const defaultStepPrice = finance.Price.receivables
	// if (discounts.length) {
	// 	const { Price: { receivables } } = finance
	// 	finance.Price.receivables = getPriceAfterApplyingDiscounts(discounts, receivables)
	// }
	//
	// return {
	// 	clientRate,
	// 	vendorRate,
	// 	nativeVendorRate,
	// 	vendor: vendor ? vendor._id : null,
	// 	finance,
	// 	nativeFinance,
	// 	defaultStepPrice
	// }
	//
	// function stepFinance(isNative) {
	// 	return {
	// 		Quantity: {
	// 			receivables: quantity.receivables,
	// 			payables: quantity.payables
	// 		},
	// 		Wordcount: {
	// 			receivables: getRelativeWordCountByEntity('client', quantity.receivables),
	// 			payables: getRelativeWordCountByEntity('vendor', quantity.payables)
	// 		},
	// 		Price: {
	// 			receivables: getTotalStepPriceClient(),
	// 			payables: getTotalStepPriceVendor()
	// 		}
	// 	}
	//
	// 	function getTotalStepPriceClient() {
	// 		return +clientRate.value * getRelativeWordCountByEntity('client', quantity.receivables)
	// 	}
	//
	// 	function getTotalStepPriceVendor() {
	// 		if (vendor) {
	// 			const rateValue = isNative ? nativeVendorRate.value : vendorRate.value
	// 			return +rateValue * getRelativeWordCountByEntity('vendor', quantity.payables)
	// 		}
	// 		return 0
	// 	}
	//
	// 	function getRelativeWordCountByEntity(entity, quantity) {
	// 		quantity = quantity || 0
	// 		if (forWords) return title === 'Translation' && fullUnit.type === 'CAT Wordcount'
	// 				? +getRelativeQuantity(metrics, entity)
	// 				: +quantity
	//
	// 		return +quantity
	// 	}
	// }

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
	getStepFinanceData,
	getPriceFromPersonRates,
	getPriceFromPricelist,
	getCorrectBasicPrice,
	getNewStepFinanceData,
	getNewStepPayablesFinanceData,
	calculateProjectTotal
}

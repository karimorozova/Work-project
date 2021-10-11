const { CurrencyRatio, Clients, Pricelist, Languages, Vendors, Projects } = require('../models')

const { multiplyPrices } = require('../multipliers')
const { getPriceAfterApplyingDiscounts } = require('../projects/helpers')
const { rateExchangeVendorOntoProject } = require('../helpers/commonFunctions')

const getStepFinanceData = async (projectData, forWords = false) => {
	const { customer, serviceStep, industry, task, vendorId, quantity, discounts, projectId } = projectData
	const { crossRate, projectCurrency } = await Projects.findOne({ "_id": projectId })
	const { metrics, sourceLanguage, targetLanguage } = task

	let vendor
	if (vendorId) {
		vendor = await Vendors.findOne({ _id: vendorId })
	}
	const defaultVendorPricelist = await Pricelist.findOne({ isVendorDefault: true })
	const client = await Clients.findOne({ _id: customer })
	const currencyRatio = await CurrencyRatio.findOne()
	const { rates, defaultPricelist, currency } = client
	const pricelist = await Pricelist.findOne({ _id: defaultPricelist })
	const { _id: sourceId } = await Languages.findOne({ symbol: sourceLanguage })
	const { _id: targetId } = await Languages.findOne({ symbol: targetLanguage })
	const { step, unit, size, title } = serviceStep
	const dataForComparison = {
		sourceLanguage: sourceId,
		targetLanguage: targetId,
		step,
		unit,
		size: size ? size : 1,
		industry: industry._id
	}

	let clientPrice = getPriceFromPersonRates(rates.pricelistTable, dataForComparison) || getPriceFromPricelist(pricelist, dataForComparison, currency, currencyRatio)
	let vendorPrice = vendor ? getPriceFromPersonRates(vendor.rates.pricelistTable, dataForComparison) : 0

  vendorPrice = (vendorPrice !== undefined) ? vendorPrice : getPriceFromPricelist(defaultVendorPricelist, dataForComparison, vendor.currency, currencyRatio)

	const clientRate = {
		value: clientPrice,
		active: true
	}

	let vendorRate = ""
	let nativeVendorRate = ""

	if (!!vendor) {
		vendorRate = { value: rateExchangeVendorOntoProject(projectCurrency, 'EUR', +vendorPrice, crossRate), active: true }
		nativeVendorRate = { value: +vendorPrice, active: true }
	}

	const finance = stepFinance(false)
	const nativeFinance = stepFinance(true)

	const defaultStepPrice = finance.Price.receivables
	if (discounts.length) {
		const { Price: { receivables } } = finance
		finance.Price.receivables = getPriceAfterApplyingDiscounts(discounts, receivables)
	}

	return {
		clientRate,
		vendorRate,
		nativeVendorRate,
		vendor: vendor ? vendor._id : null,
		finance,
		nativeFinance,
		defaultStepPrice
	}

	function stepFinance(isNative) {
		return {
			Wordcount: {
				receivables: forWords ?
						title === 'Translation' ?
								getRelativeQuantity(metrics, 'client') :
								+quantity : 0,
				payables: forWords ?
						title === 'Translation' ?
								getRelativeQuantity(metrics, 'vendor') :
								+quantity : 0
			},
			Price: {
				receivables: +clientRate.value *
						+(title === 'Translation' ? getRelativeQuantity(metrics, 'client') : +quantity),
				payables: vendor ?
						(isNative ? +nativeVendorRate.value : +vendorRate.value) * +(title === 'Translation' ? getRelativeQuantity(metrics, 'vendor') : +quantity) :
						0
			}
		}
	}

}


const getPriceFromPersonRates = (pricelistTable, data) => {
	const { sourceLanguage, targetLanguage, step, unit, size, industry } = data
	const row = pricelistTable.find(row => (
			row.sourceLanguage.toString() === sourceLanguage.toString() &&
			row.targetLanguage.toString() === targetLanguage.toString() &&
			row.industry.toString() === industry.toString() &&
			row.step.toString() === step.toString() &&
			row.unit.toString() === unit.toString() &&
			row.size.toString() === size.toString()
	))
	return row ? row.price : undefined
}

const getPriceFromPricelist = (pricelist, data, currency, currencyRatio) => {
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = pricelist
	const { sourceLanguage, targetLanguage, step, unit, size, industry } = data
	let row = basicPricesTable.find(langPair => (
			`${ langPair.sourceLanguage } ${ langPair.targetLanguage }` === `${ sourceLanguage } ${ targetLanguage }`
	))
	if (!row) row = {
		euroBasicPrice: 1,
		usdBasicPrice: currencyRatio.USD,
		gbpBasicPrice: currencyRatio.GBP
	}
	const stepRow = stepMultipliersTable.find(item => (
			`${ item.step } ${ item.unit } ${ item.size }` === `${ step } ${ unit } ${ size }`
	))
	const stepMultiplier = stepRow ? stepRow.multiplier : 100
	const industryRow = industryMultipliersTable.find(item => (
			item.industry.toString() === industry.toString()
	))
	const industryMultiplier = industryRow ? industryRow.multiplier : 100
	const basicPrice = getCorrectBasicPrice(row, currency)
	return multiplyPrices(basicPrice, stepMultiplier, size, industryMultiplier)
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
	getStepFinanceData,
	getPriceFromPersonRates,
	getPriceFromPricelist,
	getCorrectBasicPrice
}

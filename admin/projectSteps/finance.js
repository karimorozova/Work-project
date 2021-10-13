const { Units } = require('../models')
const { rateExchangeProjectOntoVendor } = require('../helpers/commonFunctions')


async function getStepsWithFinanceUpdated(step, project) {
	let { steps, crossRate, projectCurrency } = project
	const unitType = await checkUnitType(step.serviceStep.unit)
	const stepIdx = steps.findIndex(({ id }) => id === step._id)
	const {
		receivables,
		payables,
		nativePaybles,
		nativeRate
	} = unitType === 'CAT Wordcount' ?
			getWordcountPricesAndRates(step, { crossRate, projectCurrency }) :
			getCommonUnitPricesAndRates(step, unitType, { crossRate, projectCurrency })

	steps[stepIdx] = {
		...step,
		finance: { ...step.finance, Price: { receivables, payables } },
		nativeFinance: { ...step.finance, Price: { receivables, payables: nativePaybles } },
		nativeVendorRate: { value: nativeRate }
	}

	return steps
}


function getCommonUnitPricesAndRates(step, unitType, { crossRate, projectCurrency }) {
	let {
		clientRate,
		vendorRate,
		finance: { Price: { receivables, payables } },
		nativeFinance: { Price: { payables: nativePaybles } }
	} = step
	let nativeRate

	if (clientRate) {
		const { value } = clientRate
		receivables = detectedUnitType(unitType, value)
	}
	if (vendorRate) {
		const { value } = vendorRate
		payables = detectedUnitType(unitType, value)
		nativeRate = rateExchangeProjectOntoVendor(projectCurrency, 'EUR', +vendorRate.value, crossRate)
		nativePaybles = detectedUnitType(unitType, nativeRate)
	}

	//FIN53
	function detectedUnitType(unitType, value) {
		return unitType === 'Packages' ? sumValues(step.quantity, value) : sumValues(step.hours, value)
	}

	return { receivables, payables, nativeRate, nativePaybles }
}


function getWordcountPricesAndRates(step, { crossRate, projectCurrency }) {
	const {
		clientRate,
		vendorRate,
		finance: { Wordcount }
	} = step
	const doesStepHasVendorRate = vendorRate.hasOwnProperty('value')
	const nativeRate = doesStepHasVendorRate ? rateExchangeProjectOntoVendor(projectCurrency, 'EUR', +vendorRate.value, crossRate) : 0

	return {
		receivables: sumValues(Wordcount.receivables, clientRate.value),
		payables: doesStepHasVendorRate ? sumValues(Wordcount.payables, vendorRate.value) : 0,
		nativePaybles: sumValues(Wordcount.payables, nativeRate),
		nativeRate
	}
}

const sumValues = (A, B) => +(A * B).toFixed(2)

const checkUnitType = async (unitId) => {
	const { type } = await Units.findOne({ _id: unitId })
	return type
}

module.exports = { getStepsWithFinanceUpdated }

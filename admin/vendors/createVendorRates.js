const _ = require('lodash')
const { Pricelist, Vendors, Step } = require('../models')
const { filterExtraCombinationsForPriceListTable } = require('./deleteVendorRates')
const { uniqBy } = require('lodash')
const { getVendor } = require('./getVendors')

const {
	getNeededLangPair,
	getNeededCurrency,
	getStepMultipliersCombinations,
	generateNewPricelistCombinations
} = require('../clients')


const updateClientRatesFromSettings = async (vendorId) => {
	const { competencies, qualifications, rates } = await Vendors.findOne({ _id: vendorId })
	const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true })
	let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates

	let allQualificationsCombinationsRow = generateQualificationsCombinations(qualifications)

	let overallStepsArr = []
	competencies.forEach(({ sourceLanguage, targetLanguage, step, industry }) => {
		const obj = allQualificationsCombinationsRow.find(({ sourceLanguage: sourceLanguageQ, targetLanguage: targetLanguageQ, step: stepQ, industry: industryQ }) => {
			return `${ sourceLanguage }-${ targetLanguage }-${ step }-${ industry }` === `${ sourceLanguageQ }-${ targetLanguageQ }-${ stepQ }-${ industryQ }`
		})
		!obj ? overallStepsArr.push(step) : obj.status === 'Passed' && overallStepsArr.push(step)
	})

	const universalSteps = [ ...new Set(overallStepsArr.map(i => i.toString())) ]

	let allCombinationsSteps = []
	for (let step of universalSteps) allCombinationsSteps.push(...await getStepMultipliersCombinations({ _id: step }, defaultPricelist))

	allCombinationsSteps = _.uniqBy(allCombinationsSteps, item => (item.step.toString() + item.unit.toString()))

	for (let elem of stepMultipliersTable) {
		const idx = allCombinationsSteps.findIndex(item => `${ item.step }-${ item.unit }` === `${ elem.step }-${ elem.unit }`)
		if (idx !== -1) {
			delete elem._id
			allCombinationsSteps[idx] = elem
		}
	}

	const allCombinations = generateNewPricelistCombinations(basicPricesTable, allCombinationsSteps, industryMultipliersTable)
	let newPricelistTable = getPriceListTableUnique(filterExtraCombinationsForPriceListTable(allCombinations, competencies, null, qualifications))


	for (let elem of pricelistTable) {
		const idx = newPricelistTable.findIndex(item => `${ item.sourceLanguage }-${ item.targetLanguage }-${ item.step }-${ item.unit }-${ item.industry }` ===
				`${ elem.sourceLanguage }-${ elem.targetLanguage }-${ elem.step }-${ elem.unit }-${ elem.industry }`)
		delete elem._id
		newPricelistTable[idx] = elem
	}

	await Vendors.updateOne({ _id: vendorId }, {
		rates: {
			basicPricesTable, stepMultipliersTable: allCombinationsSteps, industryMultipliersTable, pricelistTable: newPricelistTable
		}
	})

	return await getVendor({ _id: vendorId })

	function generateQualificationsCombinations(qualifications) {
		let listOfQualifications = []
		for (const { source, target, steps, industries, status } of qualifications) {
			steps.forEach(step => {
				industries.forEach(industry => {
					listOfQualifications.push({ sourceLanguage: `${ source._id }`, targetLanguage: `${ target._id }`, industry: `${ industry._id }`, step: `${ step._id }`, status })
				})
			})
		}
		return listOfQualifications
	}

	function getPriceListTableUnique(pricelistTable) {
		return uniqBy(pricelistTable, ({ sourceLanguage, targetLanguage, step, unit, industry }) => (
				sourceLanguage.toString() + targetLanguage.toString() + step.toString() + unit.toString() + industry.toString()
		))
	}

}


const createRateCombinations = async (listForRates, vendorId) => {
	const vendor = await Vendors.findOne({ _id: vendorId })
	const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true })

	const { pricelistTable: oldPricelistTable } = vendor.rates
	const { langPairs, steps, industries } = splitRatesArr(listForRates)

	let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, rates } = await combineVendorRates(langPairs, steps, industries, defaultPricelist, vendor)
	let pricelistTable = [ ...oldPricelistTable, ...generateNewPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable) ]
	rates = { ...rates, pricelistTable }

	return rates
}

const splitRatesArr = (arr) => {
	const langPairs = []
	const steps = []
	const industries = []
	for (let { sourceLanguage, targetLanguage, step, industry } of arr) {
		langPairs.push({ sourceLanguage, targetLanguage })
		steps.push(step)
		industries.push(industry)
	}
	return {
		langPairs: _.uniqBy(langPairs, item => item.sourceLanguage + item.targetLanguage),
		steps: Array.from(new Set(steps)),
		industries: Array.from(new Set(industries))
	}
}

const combineVendorRates = async (langPairs, steps, industries, defaultPricelist, vendor) => {
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = defaultPricelist
	const newLangPairCombinations = []
	const newStepMultiplierCombinations = []
	const newIndustryMultiplierCombinations = []
	const { rates, currency } = vendor

	for (let { sourceLanguage, targetLanguage } of langPairs) {
		const similarLangPair = getNeededLangPair(rates.basicPricesTable, sourceLanguage, targetLanguage)
		if (!similarLangPair) {
			const boundLangPairRow = getNeededLangPair(basicPricesTable, sourceLanguage, targetLanguage)
			let boundBasicPrice = 0
			if (boundLangPairRow) {
				boundBasicPrice = (getNeededCurrency(boundLangPairRow, currency) / 2)
			}
			const langPairCombination = {
				type: sourceLanguage.toString() === targetLanguage.toString() ? 'Mono' : 'Duo',
				sourceLanguage,
				targetLanguage,
				basicPrice: boundBasicPrice ? boundBasicPrice : 0.100
			}
			newLangPairCombinations.push(langPairCombination)
			rates.basicPricesTable.push(langPairCombination)
		} else {
			newLangPairCombinations.push(similarLangPair)
		}
	}

	for (let step of steps) {
		const newStepsArr = []
		const fullStepInfo = await Step.findOne({ _id: step }).populate('calculationUnit')
		if (fullStepInfo.calculationUnit.length) {
			const sameStepMultipliers = checkForStepDuplicates(rates.stepMultipliersTable, fullStepInfo)
			if (!sameStepMultipliers.length) {
				newStepsArr.push(...await getStepMultipliersCombinations({ _id: step }, { stepMultipliersTable: stepMultipliersTable }))
				newStepsArr.map(item => ({ ...item, step: item.step._id }))
				newStepMultiplierCombinations.push(...newStepsArr)
				rates.stepMultipliersTable.push(...newStepsArr)
			} else {
				newStepMultiplierCombinations.push(...sameStepMultipliers)
			}
		}
	}

	for (let industry of industries) {
		const sameIndustryMultiplier = rates.industryMultipliersTable.find(item => item.industry.toString() === industry.toString())
		if (!sameIndustryMultiplier) {
			const neededIndustryRow = industryMultipliersTable.find(item => item.industry.toString() === industry.toString())
			const multiplier = neededIndustryRow ? neededIndustryRow.multiplier : 100
			newIndustryMultiplierCombinations.push({
				industry,
				multiplier
			})
			rates.industryMultipliersTable.push({
				industry,
				multiplier
			})
		} else {
			newIndustryMultiplierCombinations.push(sameIndustryMultiplier)
		}
	}

	return {
		basicPricesTable: newLangPairCombinations,
		stepMultipliersTable: newStepMultiplierCombinations,
		industryMultipliersTable: newIndustryMultiplierCombinations,
		rates
	}

	function checkForStepDuplicates(stepMultipliersTable, step) {
		const occurrences = []
		const { calculationUnit } = step
		for (let unit of calculationUnit) {
			const occurrence = stepMultipliersTable.find(item => `${ item.step } ${ item.unit }` === `${ step._id } ${ unit._id }`)
			if (occurrence) occurrences.push(occurrence)
		}
		return occurrences
	}
}

const createRateRowFromQualification = async (vendorId, qualification) => {
	const vendor = await Vendors.findOne({ _id: vendorId })
	const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true })
	const { pricelistTable: oldPricelistTable } = vendor.rates
	let { source, target, steps } = qualification
	const langPairs = [ { sourceLanguage: source._id, targetLanguage: target._id } ]
	steps = steps.map(item => item._id)
	const industries = qualification.industries.map(i => i._id)
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, rates } = await combineVendorRates(langPairs, steps, industries, defaultPricelist, vendor)
	let pricelistTable = [ ...oldPricelistTable, ...generateNewPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable) ]
	pricelistTable = _.uniqBy(pricelistTable, (item) => (
			item.sourceLanguage.toString() +
			item.targetLanguage.toString() +
			item.step.toString() +
			item.unit.toString() +
			item.industry.toString()
	))
	await Vendors.updateOne({ _id: vendorId }, {
		rates: {
			...rates,
			pricelistTable
		}
	})
}

module.exports = {
	createRateCombinations,
	createRateRowFromQualification,
	splitRatesArr,
	updateClientRatesFromSettings,
	combineVendorRates
}

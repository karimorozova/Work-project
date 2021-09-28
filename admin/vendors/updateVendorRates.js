const { Vendors, Pricelist, LangTest } = require('../models')
const {
	replaceOldItem,
	changePricelistTable,
	generateNewPricelistCombinations
} = require('../clients')
const { getRateInfoFromStepFinance, manageMonoPairRates, manageDuoPairRates } = require("../pricelist/ratesmanage")
const { getVendor, getVendorAfterUpdate } = require("./getVendors")
const { createRateCombinations } = require('./createVendorRates')
const { tableKeys } = require('../enums')
const { getCompetenciesForCheck } = require('./helpers')
const _ = require('lodash')


const updateVendorRatesFromCompetence = async (vendorId, newData, oldData) => {

	const vendor = await Vendors.findOne({ _id: vendorId })
	const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true })

	const sourceLangDifference = compareIds(newData.sourceLanguage, oldData.sourceLanguage)
	const targetLangDifference = compareIds(newData.targetLanguage, oldData.targetLanguage)
	const stepDifference = compareIds(newData.step, oldData.step)
	const industryDifference = compareIds(newData.industry, oldData.industry)

	let updatedRates = vendor.rates
	if (!!sourceLangDifference || !!targetLangDifference) {
		updatedRates = await updateVendorLangPairs(newData, oldData, sourceLangDifference, targetLangDifference, vendor, updatedRates, defaultPricelist)
	}
	if (!!stepDifference) {
		updatedRates = await updateVendorStepMultipliers(oldData, newData, stepDifference, vendor, updatedRates)
	}
	if (!!industryDifference) {
		updatedRates = await updateIndustryMultipliers(oldData, newData, industryDifference, vendor, updatedRates)
	}
	return updatedRates

	function compareIds(obj1, obj2) {
		return obj1._id.toString() === obj2._id.toString() ? undefined : obj1
	}
}


const updateVendorLangPairs = async (newData, oldData, newSourceLang, newTargetLang, vendor, vendorRates, defaultPricelist) => {
	let { competencies, qualifications } = vendor
	const { sourceLanguage, targetLanguage } = oldData
	let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable: oldPricelistTable } = vendorRates
	let pricelistTable

	const [ newSourceLangCheck, newTargetLangCheck ] = [ !!newSourceLang, !!newTargetLang ]

	if (newSourceLangCheck && newTargetLangCheck) {
		if (!findSameLangPairRow(basicPricesTable, newSourceLang._id, newTargetLang._id)) {
			basicPricesTable = pushNewBasicPriceItem(basicPricesTable, defaultPricelist, newSourceLang._id, newTargetLang._id)
		}
	} else if (newSourceLangCheck && !newTargetLangCheck) {
		if (!findSameLangPairRow(basicPricesTable, newSourceLang._id, targetLanguage._id)) {
			basicPricesTable = pushNewBasicPriceItem(basicPricesTable, defaultPricelist, newSourceLang._id, targetLanguage._id)
		}
	} else if (!newSourceLangCheck && newTargetLangCheck) {
		if (!findSameLangPairRow(basicPricesTable, sourceLanguage._id, newTargetLang._id)) {
			basicPricesTable = pushNewBasicPriceItem(basicPricesTable, defaultPricelist, sourceLanguage._id, newTargetLang._id)
		}
	}

	const qualificationLangPairs = qualifications.filter(({ status }) => status === 'Passed').map(({ source, target }) => `${ source } ${ target }`)

	competencies = competencies.filter(row => {
		if (row._id.toString() !== oldData._id.toString()) return row
	})

	if (!findSameLangPairRow(competencies, sourceLanguage._id, targetLanguage._id) && !qualificationLangPairs.includes(`${sourceLanguage._id} ${targetLanguage._id}`)) {
		basicPricesTable = filterRedundantLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id)
	}

	pricelistTable = [ ...oldPricelistTable, ...generateNewPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable) ]

	return {
		basicPricesTable,
		stepMultipliersTable,
		industryMultipliersTable,
		pricelistTable
	}

	function findSameLangPairRow(arr, sourceLangId, targetLangId) {
		return arr.find(item => (`${ item.sourceLanguage } ${ item.targetLanguage }` === `${ sourceLangId } ${ targetLangId }`))
	}

	function filterRedundantLangPair(arr, sourceLangId, targetLangId) {
		return arr.filter(item => (`${ item.sourceLanguage } ${ item.targetLanguage }` !== `${ sourceLangId } ${ targetLangId }`))
	}

	function pushNewBasicPriceItem(basicPricesTable, defaultPricelist, sourceLanguage, targetLanguage) {
		const neededLangRow = defaultPricelist.basicPricesTable.find(item => (`${ item.sourceLanguage } ${ item.targetLanguage }` === `${ sourceLanguage } ${ targetLanguage }`))
		const basicPrice = !!neededLangRow ? (neededLangRow.euroBasicPrice / 2).toFixed(4) : 0.05
		basicPricesTable.push({
			type: sourceLanguage.toString() === targetLanguage.toString() ? 'Mono' : 'Duo',
			sourceLanguage,
			targetLanguage,
			basicPrice
		})
		return basicPricesTable
	}
}

const updateVendorStepMultipliers = async (oldData, newData, newStep, vendor, vendorRates) => {
	const { competencies, _id: vendorId, qualifications} = vendor
	const allTests = await LangTest.find({})
	const neededCompetencies = getCompetenciesForCheck(competencies, oldData._id, allTests)
	const sameStep = vendorRates.stepMultipliersTable.find(item => item.step.toString() === newStep._id.toString())
	const isNotLastStepInCompetence = neededCompetencies.find(item => item.step.toString() === oldData.step._id.toString())
	let passedQualificationsSteps = _.flatten(qualifications.filter(({ status }) => status === 'Passed').map(({steps}) => steps)).map(item => item.toString())

	if (!sameStep) {
		const dataForCreation = [ {
			step: newStep._id,
			sourceLanguage: newData.sourceLanguage._id,
			targetLanguage: newData.targetLanguage._id,
			industry: newData.industry._id
		} ]
		const { stepMultipliersTable, pricelistTable } = await createRateCombinations(dataForCreation, vendorId)
		vendorRates.stepMultipliersTable = [ ...stepMultipliersTable ]
		vendorRates.pricelistTable = [ ...pricelistTable ]
	} else {
		const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable: oldPricelistTable } = vendorRates
		vendorRates.pricelistTable = [ ...oldPricelistTable, ...generateNewPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable) ]
	}
	if (!isNotLastStepInCompetence && !passedQualificationsSteps.includes(oldData.step._id.toString())) {
		vendorRates.stepMultipliersTable = filterRedundantItem(vendorRates.stepMultipliersTable, oldData.step._id, 'step')
	}

	return vendorRates
}

const updateIndustryMultipliers = async (oldData, newData, newIndustry, vendor, vendorRates) => {
	const { competencies, _id: vendorId } = vendor
	const sameIndustry = vendorRates.industryMultipliersTable.find(item => (
			item.industry.toString() === newIndustry._id.toString()
	))
	const isNotLastIndustryInCompetence = competencies.find(item => (
			item.industry.toString() === oldData.industry._id.toString()
	))
	if (!sameIndustry) {
		const dataForCreation = [ {
			industry: newIndustry._id,
			sourceLanguage: newData.sourceLanguage._id,
			targetLanguage: newData.targetLanguage._id,
			step: newData.step._id
		} ]
		const {
			industryMultipliersTable,
			pricelistTable
		} = await createRateCombinations(dataForCreation, vendorId)
		vendorRates.industryMultipliersTable = [ ...industryMultipliersTable ]
		vendorRates.pricelistTable = [ ...pricelistTable ]
	} else {
		const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable: oldPricelistTable } = vendorRates
		vendorRates.pricelistTable = [ ...oldPricelistTable, ...generateNewPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable) ]
	}

	if (!isNotLastIndustryInCompetence) {
		vendorRates.industryMultipliersTable = filterRedundantItem(vendorRates.industryMultipliersTable, oldData.industry._id, 'industry')
	}
	return vendorRates
}

const filterRedundantItem = (arr, itemId, key) => arr.filter(item => item[key].toString() !== itemId.toString())


const updateVendorsRatePrices = async (vendorId, itemIdentifier, updatedItem) => {
	const vendor = await Vendors.findOne({ _id: vendorId })
	const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true })
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = vendor.rates
	let updatedPricelistTable

	switch (itemIdentifier) {
		case tableKeys.basicPricesTable:
			const { basicPrice } = basicPricesTable.find(item => item._id.toString() === updatedItem._id.toString())
			if (basicPrice === Number(updatedItem.basicPrice)) return
			const updatedBasicPricesTable = replaceOldItem(basicPricesTable, updatedItem, defaultPricelist, tableKeys.basicPricesTable, 'Vendor')
			updatedPricelistTable = changePricelistTable(pricelistTable, updatedItem, itemIdentifier, basicPrice)
			vendor.rates.basicPricesTable = updatedBasicPricesTable
			vendor.rates.pricelistTable = updatedPricelistTable
			await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates })
			break

		case tableKeys.stepMultipliersTable:
			const { multiplier: stepMultiplier } = stepMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString())
			if (stepMultiplier === Number(updatedItem.multiplier)) return
			const updatedStepMultipliersTable = replaceOldItem(stepMultipliersTable, updatedItem, defaultPricelist, tableKeys.stepMultipliersTable, 'Vendor')
			updatedPricelistTable = changePricelistTable(pricelistTable, updatedItem, itemIdentifier, stepMultiplier)
			vendor.rates.stepMultipliersTable = updatedStepMultipliersTable
			vendor.rates.pricelistTable = updatedPricelistTable
			await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates })
			break

		case tableKeys.industryMultipliersTable:
			const { multiplier: industryMultiplier } = industryMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString())
			if (industryMultiplier === Number(updatedItem.multiplier)) return
			const updatedIndustryMultipliersTable = replaceOldItem(industryMultipliersTable, updatedItem, defaultPricelist, tableKeys.industryMultipliersTable, 'Vendor')
			updatedPricelistTable = changePricelistTable(pricelistTable, updatedItem, itemIdentifier, industryMultiplier)
			vendor.rates.industryMultipliersTable = updatedIndustryMultipliersTable
			vendor.rates.pricelistTable = updatedPricelistTable
			await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates })
			break

	}
}

async function updateVendorRates(vendor, rateInfo) {
	const { stepsIds, prop, packageSize, industries, source, target, rates } = rateInfo
	try {
		let updatedRates
		if (prop === 'monoRates') {
			updatedRates = await manageMonoPairRates({
				stepsIds, packageSize, industries, target, rates, currentRates: vendor[prop], entity: vendor
			})
		} else {
			updatedRates = await manageDuoPairRates({
				stepsIds, source, target, industries, rates, currentRates: vendor[prop], entity: vendor
			})
		}
		return await getVendorAfterUpdate({ "_id": vendor.id }, { [prop]: updatedRates })
	} catch (err) {
		console.log(err)
		console.log("Error in updateVendorRates")
	}
}

async function getVendorAfterCombinationsUpdated({ project, step, rate }) {
	try {
		const rateInfo = await getRateInfoFromStepFinance({ project, step, rate })
		const vendor = await getVendor({ "_id": step.vendor._id })
		return await updateVendorRates(vendor, rateInfo)
	} catch (err) {
		console.log(err)
		console.log("Error in getVendorAfterCombinationsUpdated")
	}
}


module.exports = {
	updateVendorRatesFromCompetence,
	updateVendorsRatePrices,
	getVendorAfterCombinationsUpdated
}

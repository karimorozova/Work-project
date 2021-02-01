const { Vendors, Pricelist, LangTest } = require('../models')
const {
	replaceOldItem,
	changePricelistTable,
	generateNewPricelistCombinations
} = require('../clients')
const { getRateInfoFromStepFinance, manageMonoPairRates, manageDuoPairRates } = require("../pricelist/ratesmanage")
const { getVendor, getVendorAfterUpdate } = require("./index")
const { createRateCombinations } = require('./createVendorRates')
const { tableKeys } = require('../enums')
const { getCompetenciesForCheck } = require('./helpers')
const _ = require('lodash')

/**
 *
 * @param {String} vendorId - updating subject's id
 * @param {String} newData - updated competence example from frontend
 * @param {String} oldData - old competence example from database
 * @return nothing - updates vendor's rates
 */
const updateVendorRatesFromCompetence = async (vendorId, newData, oldData) => {
	const vendor = await Vendors.findOne({ _id: vendorId })
	const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true })
	const sourceLangDifference = compareIds(newData.sourceLanguage, oldData.sourceLanguage)
	const targetLangDifference = compareIds(newData.targetLanguage, oldData.targetLanguage)
	const stepDifference = compareIds(newData.step, oldData.step)
	const industryDifference = compareIds(newData.industry, oldData.industry)
	let updatedRates = vendor.rates
	if (sourceLangDifference || targetLangDifference) {
		updatedRates = await updateVendorLangPairs(newData, oldData, sourceLangDifference, targetLangDifference, vendor, updatedRates, defaultPricelist)
	}
	if (stepDifference) {
		updatedRates = await updateVendorStepMultipliers(oldData, newData, stepDifference, vendor, updatedRates)
	}
	if (industryDifference) {
		updatedRates = await updateIndustryMultipliers(oldData, newData, industryDifference, vendor, updatedRates)
	}
	return updatedRates

	function compareIds(obj1, obj2) {
		return obj1._id.toString() === obj2._id.toString() ? undefined : obj1
	}
}

/**
 *
 * @param {Object} newData - new competence example from frontend
 * @param {Object} oldData - old example from database
 * @param {Object} newSourceLang - new source language value of rate row
 * @param {Object} newTargetLang - new target language value of rate row
 * @param {Object} vendor - current vendor's data
 * @param {Object} defaultPricelist - default pricelist data
 * @param {Object} vendorRates - updated vendor's rates
 * @return nothing - updates vendor's rates
 */
const updateVendorLangPairs = async (newData, oldData, newSourceLang, newTargetLang, vendor, vendorRates, defaultPricelist) => {
	let { competencies, qualifications } = vendor
	const { sourceLanguage, targetLanguage } = oldData
	let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable: oldPricelistTable } = vendorRates
	let pricelistTable = oldPricelistTable
	if (newSourceLang && newTargetLang) {
		const sameLangPairRow = findSameLangPairRow(basicPricesTable, newSourceLang._id, newTargetLang._id)
		if (!sameLangPairRow) {
			basicPricesTable = pushNewBasicPriceItem(basicPricesTable, defaultPricelist, newSourceLang._id, newTargetLang._id)
			pricelistTable = [ ...await generateNewPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable, oldPricelistTable) ]
		}
	} else if (newSourceLang && !newTargetLang) {
		const sameLangPairRow = findSameLangPairRow(basicPricesTable, newSourceLang._id, targetLanguage._id)
		if (!sameLangPairRow) {
			basicPricesTable = pushNewBasicPriceItem(basicPricesTable, defaultPricelist, newSourceLang._id, targetLanguage._id)
			pricelistTable = [ ...await generateNewPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable, oldPricelistTable) ]
		}
	} else {
		const sameLangPairRow = findSameLangPairRow(basicPricesTable, sourceLanguage._id, newTargetLang._id)
		if (!sameLangPairRow) {
			basicPricesTable = pushNewBasicPriceItem(basicPricesTable, defaultPricelist, sourceLanguage, newTargetLang._id)
			pricelistTable = [ ...await generateNewPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable, oldPricelistTable) ]
		}
	}

	const qualificationLangPairs = qualifications.map(({ source, target }) => `${ source } ${ target }`)
	competencies = competencies.filter(row => {
		const { sourceLanguage, targetLanguage, _id } = row
		if (!qualificationLangPairs.includes(`${ sourceLanguage } ${ targetLanguage }`)
				&& _id.toString() !== oldData._id.toString()) {
			return row
		}
	})

	const sameLangPairRow = findSameLangPairRow(competencies, sourceLanguage._id, targetLanguage._id)
	if (!sameLangPairRow) {
		basicPricesTable = filterRedundantLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id)
		pricelistTable = filterRedundantLangPair(pricelistTable, sourceLanguage._id, targetLanguage._id)
	}

	pricelistTable = _.uniqBy(pricelistTable, (item) => (
			item.sourceLanguage.toString() +
			item.targetLanguage.toString() +
			item.step.toString() +
			item.unit.toString() +
			item.size +
			item.industry.toString()
	))
	return {
		basicPricesTable,
		stepMultipliersTable,
		industryMultipliersTable,
		pricelistTable
	}


	function findSameLangPairRow(arr, sourceLangId, targetLangId) {
		return arr.find(item => (
				`${ item.sourceLanguage } ${ item.targetLanguage }` === `${ sourceLangId } ${ targetLangId }`
		))
	}

	function filterRedundantLangPair(arr, sourceLangId, targetLangId) {
		return arr.filter(item => (
				`${ item.sourceLanguage } ${ item.targetLanguage }` !== `${ sourceLangId } ${ targetLangId }`
		))
	}

	function pushNewBasicPriceItem(basicPricesTable, defaultPricelist, sourceLanguage, targetLanguage) {
		const neededLangRow = defaultPricelist.basicPricesTable.find(item => (
				`${ item.sourceLanguage } ${ item.targetLanguage }` === `${ sourceLanguage } ${ targetLanguage }`
		))
		const basicPrice = neededLangRow ? neededLangRow.basicPrice : 1
		basicPricesTable.push({
			type: sourceLanguage.toString() === targetLanguage.toString() ? 'Mono' : 'Duo',
			sourceLanguage,
			targetLanguage,
			basicPrice
		})
		return basicPricesTable
	}
}

/**
 *
 * @param {Object} oldData - old example from database
 * @param {Object} newData - new example from frontend
 * @param {Object} newStep - new step value of rate row
 * @param {Object} vendor - current vendor's data
 * @param {Object} vendorRates - updated vendor's rates
 * @return nothing - updates vendor's rates
 */
const updateVendorStepMultipliers = async (oldData, newData, newStep, vendor, vendorRates) => {
	const { competencies, _id: vendorId } = vendor
	const allTests = await LangTest.find({})
	const neededCompetencies = getCompetenciesForCheck(competencies, oldData._id, allTests)
	const sameStep = vendorRates.stepMultipliersTable.find(item => item.step.toString() === newStep._id.toString())
	const isNotLastStepInCompetence = neededCompetencies.find(item => item.step.toString() === oldData.step._id.toString())
	if (!sameStep) {
		const dataForCreation = [ {
			step: newStep._id,
			sourceLanguage: newData.sourceLanguage._id,
			targetLanguage: newData.targetLanguage._id,
			industry: newData.industry._id
		} ]
		const {
			stepMultipliersTable,
			pricelistTable
		} = await createRateCombinations(dataForCreation, vendorId)
		vendorRates.stepMultipliersTable = [ ...stepMultipliersTable ]
		vendorRates.pricelistTable = [ ...pricelistTable ]
	}
	if (!isNotLastStepInCompetence) {
		vendorRates.stepMultipliersTable = filterRedundantItem(
				vendorRates.stepMultipliersTable, oldData.step._id, 'step')
		vendorRates.pricelistTable = filterRedundantItem(vendorRates.pricelistTable, oldData.step._id, 'step')
	}
	return vendorRates
}

/**
 *
 * @param {Object} oldData - old example from database
 * @param {Object} newData - new example from frontend
 * @param {Object} newIndustry - new industry of rate row
 * @param {Object} vendor - current vendor's data
 * @param {Object} vendorRates - updated vendor's rates
 * @return nothing - updates vendor's rates
 */
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
	}
	if (!isNotLastIndustryInCompetence) {
		vendorRates.industryMultipliersTable = filterRedundantItem(
				vendorRates.industryMultipliersTable, oldData.industry._id, 'industry')
		vendorRates.pricelistTable = filterRedundantItem(vendorRates.pricelistTable, oldData.industry._id, 'industry')
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

const { Step, Services } = require('../models')
const _ = require('lodash')


const updateClientLangPairs = async (operationObj) => {
	let { client, sourceLangDifference, targetLangDifference, updatedService, oldService } = operationObj
	const { services, rates, defaultPricelist, currency } = client
	let { basicPricesTable } = rates

	const otherServices = services.filter(({ targetLanguages, services, industries, sourceLanguage }) =>
			`${ targetLanguages[0] }-${ services[0] }-${ industries[0] }-${ sourceLanguage }` !==
			`${ updatedService.targetLanguages[0] }-${ updatedService.services[0] }-${ updatedService.industries[0] }-${ updatedService.sourceLanguage }`
	)

	if (!!sourceLangDifference) {
		const { newItem, oldItem } = sourceLangDifference
		const sameOldLangPairExists = findSameLangPair(oldItem, oldService.targetLanguages[0]._id)
		const sameNewLangPairExists = findSameLangPair(newItem, updatedService.targetLanguages[0])
		if (!sameOldLangPairExists) basicPricesTable = basicPricesTable.filter(row => (`${ row.sourceLanguage } ${ row.targetLanguage }` !== `${ oldService.sourceLanguage._id } ${ oldService.targetLanguages[0]._id }`))
		if (!sameNewLangPairExists) pushNewLangPair(newItem, updatedService.targetLanguages[0])
		return basicPricesTable
	}
	if (!!targetLangDifference) {
		const { newItem, oldItem } = targetLangDifference
		const sameOldLangPairExists = findSameLangPair(oldService.sourceLanguage._id, oldItem)
		const sameNewLangPairExists = findSameLangPair(updatedService.sourceLanguage, newItem)
		if (!sameOldLangPairExists) basicPricesTable = basicPricesTable.filter(row => (`${ row.sourceLanguage } ${ row.targetLanguage }` !== `${ oldService.sourceLanguage._id } ${ oldService.targetLanguages[0]._id }`))
		if (!sameNewLangPairExists) pushNewLangPair(updatedService.sourceLanguage, newItem)
		return basicPricesTable
	}
	if (!!sourceLangDifference && !!targetLangDifference) {
		const { newItem: newSourceItem, oldItem: oldSourceItem } = sourceLangDifference
		const { newItem: newTargetItem, oldItem: oldTargetItem } = targetLangDifference
		const sameOldLangPairExists = findSameLangPair(oldSourceItem, oldTargetItem)
		const sameNewLangPairExists = findSameLangPair(newSourceItem, newTargetItem)
		if (!sameOldLangPairExists) basicPricesTable = basicPricesTable.filter(row => (`${ row.sourceLanguage } ${ row.targetLanguage }` !== `${ oldSourceItem } ${ oldTargetItem }`))
		if (!sameNewLangPairExists) pushNewLangPair(newSourceItem, newTargetItem)
		return basicPricesTable
	}

	function pushNewLangPair(newSourceLanguage, newTargetLanguage, toReturn = false) {
		const sameDefaultPair = defaultPricelist.basicPricesTable.find(row => `${ row.sourceLanguage } ${ row.targetLanguage }` === `${ newSourceLanguage } ${ newTargetLanguage }`)
		let basicPrice = 0.100
		if (sameDefaultPair) {
			switch (currency) {
				case 'USD':
					basicPrice = sameDefaultPair.usdBasicPrice
					break
				case 'GBP':
					basicPrice = sameDefaultPair.gbpBasicPrice
					break
				default:
					basicPrice = sameDefaultPair.euroBasicPrice
			}
			if (toReturn) {
				return [ {
					sourceLanguage: newSourceLanguage,
					targetLanguage: updatedService.targetLanguages[0],
					basicPrice
				} ]
			}
			basicPricesTable.push({
				sourceLanguage: newSourceLanguage,
				targetLanguage: updatedService.targetLanguages[0],
				basicPrice
			})
		} else {
			if (toReturn) {
				return [ {
					sourceLanguage: newSourceLanguage,
					targetLanguage: updatedService.targetLanguages[0],
					basicPrice: 0.100
				} ]
			}
			basicPricesTable.push({
				sourceLanguage: newSourceLanguage,
				targetLanguage: updatedService.targetLanguages[0],
				basicPrice: 0.100
			})
		}
	}

	function findSameLangPair(sourceLanguage, targetLanguage) {
		return otherServices.find(row => {
			const { targetLanguages } = row
			const otherLangPairs = targetLanguages.map(lang => `${ row.sourceLanguage } - ${ lang }`)
			if (otherLangPairs.includes(`${ sourceLanguage } - ${ targetLanguage }`)) {
				return row
			}
		})
	}
}

const updateClientStepMultipliers = async (operationObj) => {
	const { client, serviceStepDifference, updatedService } = operationObj
	const { services, rates, defaultPricelist } = client
	let { stepMultipliersTable } = rates

	const otherServices = services.filter(({ targetLanguages, services, industries, sourceLanguage }) =>
			`${ targetLanguages[0] }-${ services[0] }-${ industries[0] }-${ sourceLanguage }` !==
			`${ updatedService.targetLanguages[0] }-${ updatedService.services[0] }-${ updatedService.industries[0] }-${ updatedService.sourceLanguage }`
	)

	const otherServicesStepsRow = await Promise.all(otherServices.map(async (item) => {
		let elements = await findStepRows(item.services[0])
		return elements.map(({ stepId }) => stepId)
	}))

	const { newItem: newService, oldItem } = serviceStepDifference

	const sameOldServiceExists = findSameService(oldItem)
	const sameNewServiceExists = findSameService(newService)

	if (!sameOldServiceExists) {
		let stepsForDelete = await findStepRows(oldItem)
		let mappedStepsForDelete = stepsForDelete.map(({ stepId }) => stepId)
		let otherServicesStepsRowFlat = _.flatten(otherServicesStepsRow).map(i => i.toString())
		mappedStepsForDelete = mappedStepsForDelete.filter(item => !otherServicesStepsRowFlat.includes(item.toString()))
		if (mappedStepsForDelete.length) {
			stepMultipliersTable = await deleteOldUniqueSteps(stepMultipliersTable, mappedStepsForDelete)
		}
	}
	if (!sameNewServiceExists) {
		const newUniqueStepRows = await findUniqueStepRows(newService)
		if (newUniqueStepRows.length) pushNewSteps(newUniqueStepRows)
	}

	return stepMultipliersTable

	function pushNewSteps(newStepsArr, toReturn = false) {
		let arrToReturn = []
		for (let { stepId, unitId } of newStepsArr) {
			const row = defaultPricelist.stepMultipliersTable.find(row => `${ row.step } ${ row.unit }` === `${ stepId } ${ unitId }`)
			if (toReturn) {
				arrToReturn.push({
					step: stepId,
					unit: unitId,
					multiplier: row ? row.multiplier : 100
				})
			} else {
				stepMultipliersTable.push({
					step: stepId,
					unit: unitId,
					multiplier: row ? row.multiplier : 100
				})
			}
		}
		return arrToReturn
	}

	async function deleteOldUniqueSteps(table, stepsArr) {
		const stepCombinationRows = []
		for (let step of stepsArr) {
			const { calculationUnit } = await Step.findOne({ _id: step }).populate('calculationUnit')
			for (let { _id: unitId } of calculationUnit) stepCombinationRows.push(`${ step } ${ unitId }`)
		}
		return table.filter(row => !stepCombinationRows.includes(`${ row.step } ${ row.unit }`))
	}

	async function findStepRows(serviceId) {
		let uniqueStepRows = []
		const { steps } = await Services.findOne({ _id: serviceId })
		const allSteps = await Step.find().populate('calculationUnit')

		for (let i = 0; i < steps.length; i++) {
			const { step: stepId } = steps[i]
			const { calculationUnit } = allSteps.find(item => item._id.toString() === stepId.toString())
			for (let { _id: unitId } of calculationUnit) uniqueStepRows.push({ stepId, unitId })
		}
		return uniqueStepRows
	}

	async function findUniqueStepRows(serviceId) {
		let uniqueStepRows = []
		const { steps } = await Services.findOne({ _id: serviceId })
		const allSteps = await Step.find().populate('calculationUnit')

		for (let i = 0; i < steps.length; i++) {
			const { step: stepId } = steps[i]
			const { calculationUnit } = allSteps.find(item => item._id.toString() === stepId.toString())
			for (let { _id: unitId } of calculationUnit) {
				const uniqueRow = findUniqueStepTableRow(stepId, unitId)
				uniqueRow && uniqueStepRows.push({ stepId, unitId })
			}
		}
		return uniqueStepRows

		function findUniqueStepTableRow(stepId, unitId) {
			return stepMultipliersTable.every(row => {
				if (row.step.toString() !== stepId.toString() || row.unit.toString() !== unitId.toString()) return row
			})
		}
	}

	function findSameService(service) {
		return otherServices.find(row => {
			const serviceIdsArr = row.services.map(item => item.toString())
			if (serviceIdsArr.includes(service)) {
				return row
			}
		})
	}
}

const updateClientIndustryMultipliers = async (operationObj) => {
	let { client, industryDifference, updatedService } = operationObj
	const { services, rates, defaultPricelist } = client
	let { industryMultipliersTable } = rates
	const { newItem: newIndustry, oldItem } = industryDifference

	const otherServices = services.filter(({ targetLanguages, services, industries, sourceLanguage }) =>
			`${ targetLanguages[0] }-${ services[0] }-${ industries[0] }-${ sourceLanguage }` !==
			`${ updatedService.targetLanguages[0] }-${ updatedService.services[0] }-${ updatedService.industries[0] }-${ updatedService.sourceLanguage }`
	)

	const sameOldIndustryExists = findSameIndustry(oldItem)
	const sameNewIndustryExists = findSameIndustry(newIndustry)

	if (!sameOldIndustryExists) {
		industryMultipliersTable = industryMultipliersTable.filter(({ industry }) => industry.toString() !== oldItem.toString())
	}

	if (!sameNewIndustryExists) {
		const sameDefaultIndustryRow = defaultPricelist.industryMultipliersTable.find(({ industry }) => industry.toString() === newIndustry.toString())
		industryMultipliersTable.push({
			industry: newIndustry,
			multiplier: sameDefaultIndustryRow ? sameDefaultIndustryRow.multiplier : 100
		})
	}

	return industryMultipliersTable

	function findSameIndustry(industry) {
		return otherServices.find(row => {
			const industryIdsArr = row.industries.map(item => item.toString())
			if (industryIdsArr.includes(industry)) {
				return row
			}
		})
	}
}

module.exports = {
	updateClientLangPairs,
	updateClientStepMultipliers,
	updateClientIndustryMultipliers
}

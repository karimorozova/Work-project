const { Clients, Step, Services, Pricelist, Languages, Industries } = require('../models')
const ObjectId = require('mongodb').ObjectID
const _ = require('lodash')
const { multiplyPrices } = require('../multipliers/pricelist')
const {
	updateClientLangPairs,
	updateClientStepMultipliers,
	updateClientIndustryMultipliers
} = require('./editClientRates')

const { tableKeys } = require('../enums')
const { getRateInfoFromStepFinance } = require('../pricelist/ratesmanage')
const { getClient } = require('./getClients')

const updateClientRatesFromSettings = async (clientId) => {
	const { services, defaultPricelist, rates } = await Clients.findOne({ _id: clientId }).populate('services.services')
	const boundPricelist = await Pricelist.findOne({ _id: defaultPricelist })
	let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates

	let newSteps = []
	for (let { services: service } of services) {
		for (let { step } of service[0].steps) {
			newSteps.push({ _id: step._id })
		}
	}

	let allCombinationsSteps = []
	for (let step of newSteps) allCombinationsSteps.push(...await getStepMultipliersCombinations(step, boundPricelist))

	allCombinationsSteps = _.uniqBy(allCombinationsSteps, item => (item.step.toString() + item.unit.toString() + item.size))

	for (let elem of stepMultipliersTable) {
		const idx = allCombinationsSteps.findIndex(item => `${ item.step }-${ item.unit }-${ item.size }` === `${ elem.step }-${ elem.unit }-${ elem.size }`)
		if (idx !== -1) {
			delete elem._id
			allCombinationsSteps[idx] = elem
		}
	}

	const allCombinations = await filteredCombinationsResultRatesTable(generateNewPricelistCombinations(basicPricesTable, allCombinationsSteps, industryMultipliersTable), clientId)

	for (let elem of pricelistTable) {
		const idx = allCombinations.findIndex(item => `${ item.sourceLanguage }-${ item.targetLanguage }-${ item.step }-${ item.unit }-${ item.size }-${ item.industry }` ===
				`${ elem.sourceLanguage }-${ elem.targetLanguage }-${ elem.step }-${ elem.unit }-${ elem.size }-${ elem.industry }`)
		delete elem._id
		allCombinations[idx] = elem
	}

	await Clients.updateOne({ _id: clientId }, {
		rates: {
			basicPricesTable, stepMultipliersTable: allCombinationsSteps, industryMultipliersTable, pricelistTable: allCombinations
		}
	})

	return await getClient({ _id: clientId })
}

const filteredCombinationsResultRatesTable = async (priceListTable, clientId) => {
	const { services } = await Clients.findOne({ _id: clientId }).populate('services.services')
	const steps = await Step.find()

	let servicesStepCombinations = services.reduce((acc, curr) => {
		let result = []
		curr.services[0].steps.forEach(step => {
			let { calculationUnit } = steps
					.find(i => i._id.toString() === step.step.toString())
			calculationUnit.forEach(unit => {
				result.push({
					sourceLanguage: curr.sourceLanguage,
					targetLanguage: curr.targetLanguages[0],
					industry: curr.industries[0],
					step: step.step,
					unit
				})
			})
		})
		acc.push(...result)
		return acc
	}, [])

	servicesStepCombinations = servicesStepCombinations
			.map(row => `${ row.sourceLanguage }-${ row.targetLanguage }-${ row.step }-${ row.unit }-${ row.industry }`)

	return priceListTable.filter(finalTableItem => {
		return !!servicesStepCombinations
				.includes(`${ finalTableItem.sourceLanguage }-${ finalTableItem.targetLanguage }-${ finalTableItem.step }-${ finalTableItem.unit }-${ finalTableItem.industry }`)
	})
}

const updateClientRates = async (clientId, itemIdentifier, updatedItem) => {
	const client = await Clients.findOne({ _id: clientId })
	const boundPricelist = await Pricelist.findOne({ _id: client.defaultPricelist })
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = client.rates
	let updatedPricelistTableTable
	switch (itemIdentifier) {
		case tableKeys.basicPricesTable:
			const { basicPrice } = basicPricesTable.find(item => item._id.toString() === updatedItem._id.toString())
			if (basicPrice === Number(updatedItem.basicPrice)) return
			const updatedBasicPriceTable = replaceOldItem(
					basicPricesTable,
					updatedItem,
					boundPricelist,
					tableKeys.basicPricesTable,
					'Client'
			)
			updatedPricelistTableTable = changePricelistTable(
					pricelistTable,
					updatedItem,
					itemIdentifier,
					basicPrice
			)
			client.rates.basicPricesTable = updatedBasicPriceTable
			client.rates.pricelistTable = updatedPricelistTableTable
			break
		case tableKeys.stepMultipliersTable:
			const { multiplier: stepMultiplier } = stepMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString())
			if (stepMultiplier === Number(updatedItem.multiplier)) return
			const updatedStepMultipliersTable = replaceOldItem(
					stepMultipliersTable,
					updatedItem,
					boundPricelist,
					tableKeys.stepMultipliersTable,
					'Client'
			)
			updatedPricelistTableTable = changePricelistTable(
					pricelistTable,
					updatedItem,
					itemIdentifier,
					stepMultiplier
			)
			client.rates.stepMultipliersTable = updatedStepMultipliersTable
			client.rates.pricelistTable = updatedPricelistTableTable
			break
		case tableKeys.industryMultipliersTable:
			const { multiplier: industryMultiplier } = industryMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString())
			if (industryMultiplier === Number(updatedItem.multiplier)) return
			const updatedIndustryMultipliersTable = replaceOldItem(
					industryMultipliersTable,
					updatedItem,
					boundPricelist,
					tableKeys.industryMultipliersTable,
					'Client'
			)
			updatedPricelistTableTable = changePricelistTable(
					pricelistTable,
					updatedItem,
					itemIdentifier,
					industryMultiplier
			)
			client.rates.industryMultipliersTable = updatedIndustryMultipliersTable
			client.rates.pricelistTable = updatedPricelistTableTable
			break
	}
	await Clients.updateOne({ _id: clientId }, { rates: client.rates })
}

const replaceOldItem = (arr, replacementItem, boundPricelist, key, personKey) => {
	const { _id } = replacementItem
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = boundPricelist
	let altered
	switch (key) {
		case tableKeys.basicPricesTable:
			const { sourceLanguage, targetLanguage } = replacementItem
			const neededLangPair = getNeededLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id)
			altered = neededLangPair ? neededLangPair.altered : false
			break
		case tableKeys.stepMultipliersTable:
			const { step, unit, size } = replacementItem
			const neededStepRow = getNeededStepRow(stepMultipliersTable, step, unit, size)
			altered = neededStepRow ? neededStepRow.altered : false
			break
		case tableKeys.industryMultipliersTable:
			const { industry } = replacementItem
			const neededIndustryRow = industryMultipliersTable.find(item => (
					item.industry.toString() === industry._id.toString()
			))
			altered = neededIndustryRow ? neededIndustryRow.altered : false
	}
	replacementItem.notification = `${ personKey }'s data is different from pricelist`
	const itemToUpdateIndex = findIndexToReplace(arr, _id)
	arr.splice(itemToUpdateIndex, 1, replacementItem)
	return arr
}

const findIndexToReplace = (arr, searchItemId) => arr.findIndex(item => item._id.toString() === searchItemId)

const changePricelistTable = (pricelistTable, updatedItem, key, oldMultiplier) => {
	let updatedPricelistTable
	switch (key) {
		case tableKeys.basicPricesTable:
			const { sourceLanguage, targetLanguage, basicPrice } = updatedItem
			updatedPricelistTable = pricelistTable.map(item => {
				if (!item.altered && `${ item.sourceLanguage } ${ item.targetLanguage }` === `${ sourceLanguage._id } ${ targetLanguage._id }`) {
					item.price /= oldMultiplier
					item.price *= Number(basicPrice)
					item.price = item.price.toFixed(4)
				}
				return item
			})
			break
		case tableKeys.stepMultipliersTable:
			const { step, unit, size, multiplier: stepMultiplier } = updatedItem
			updatedPricelistTable = pricelistTable.map(item => {
				if (!item.altered && `${ item.step } ${ item.unit } ${ item.size }` === `${ step._id } ${ unit._id } ${ size }`) {
					item.price /= oldMultiplier
					item.price *= Number(stepMultiplier)
					item.price = item.price.toFixed(4)
				}
				return item
			})
			break
		case tableKeys.industryMultipliersTable:
			const { industry, multiplier: industryMultiplier } = updatedItem
			updatedPricelistTable = pricelistTable.map(item => {
				if (!item.altered && item.industry.toString() === industry._id) {
					item.price /= oldMultiplier
					item.price *= Number(industryMultiplier)
					item.price = item.price.toFixed(4)
				}
				return item
			})
			break
	}
	return updatedPricelistTable
}

const addNewRateComponents = async (clientId, newServicesArr) => {
	const { rates, currency, defaultPricelist } = await Clients.findOne({ _id: clientId })
	const boundPricelist = await Pricelist.findOne({ _id: defaultPricelist })
	const allLanguages = await Languages.find()
	const allServices = await Services.find()
	const allIndustries = await Industries.find()
	const allSteps = await Step.find()

	let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates

	const freshBasicPriceRows = []
	const newStepMultiplierCombinations = []
	const newIndustryMultiplierCombinations = []

	for (let newService of newServicesArr) {

		newService = gatherFullServiceInfo(newService, { allLanguages, allServices, allIndustries })
		const { sourceLanguage, targetLanguages } = newService
		const { uniqueServiceSteps, uniqueIndustries } = getUniqueServiceItems(newService, rates, allSteps)

		const newSteps = []
		for (let { steps } of newService.services) {
			for (let { step } of steps) {
				newSteps.push({ _id: step._id })
			}
		}
		for (let step of newSteps) {
			newStepMultiplierCombinations.push(...await getStepMultipliersCombinations(step, boundPricelist))
		}

		const newIndustries = newService.industries.map(item => item._id)
		for (let industry of newIndustries) {
			const neededIndustryRow = boundPricelist.industryMultipliersTable
					.find(item => item.industry.toString() === industry.toString())
			const multiplier = neededIndustryRow ? neededIndustryRow.multiplier : 100
			newIndustryMultiplierCombinations.push({ industry, multiplier })
		}

		for (let { _id } of targetLanguages) {
			const neededLangPair = getNeededLangPair(boundPricelist.basicPricesTable, sourceLanguage._id, _id)
			const boundBasicPrice = neededLangPair ? getNeededCurrency(neededLangPair, currency) : 1
			const newBasicPriceObj = {
				type: sourceLanguage._id.toString() === _id.toString() ? 'Mono' : 'Duo',
				sourceLanguage: sourceLanguage._id,
				targetLanguage: _id,
				basicPrice: boundBasicPrice
			}
			basicPricesTable.push(newBasicPriceObj)
			freshBasicPriceRows.push(newBasicPriceObj)
		}

		if (uniqueServiceSteps.length) for (let service of uniqueServiceSteps) stepMultipliersTable.push(...await getStepMultipliersCombinations(service, boundPricelist))

		if (uniqueIndustries.length)
			for (let { _id } of uniqueIndustries) {
				const neededIndustryRow = boundPricelist.industryMultipliersTable.find(({ industry }) => industry.toString() === _id.toString())
				const multiplier = !!neededIndustryRow ? neededIndustryRow.multiplier : 100
				industryMultipliersTable.push({ industry: _id, multiplier })
			}

	}
	pricelistTable = [ ...pricelistTable, ...generateNewPricelistCombinations(freshBasicPriceRows, newStepMultiplierCombinations, newIndustryMultiplierCombinations) ]

	basicPricesTable = _.uniqBy(basicPricesTable, item => (item.sourceLanguage.toString() + item.targetLanguage.toString()))
	pricelistTable = _.uniqBy(pricelistTable, item => (item.sourceLanguage.toString() + item.targetLanguage.toString() + item.step.toString() + item.unit.toString() + item.size + item.industry.toString()))

	const newRates = {
		basicPricesTable,
		stepMultipliersTable,
		industryMultipliersTable,
		pricelistTable: await filteredCombinationsResultRatesTable(pricelistTable, clientId)
	}

	await Clients.updateOne({ _id: clientId }, { rates: newRates })
}

const gatherFullServiceInfo = ({ sourceLanguage: sourceLanguageId, targetLanguages: targetLanguageId, services: serviceId, industries: industryId }, allData) => {
	const { allLanguages, allServices, allIndustries } = allData
	return {
		sourceLanguage: allLanguages.find(({ _id }) => _id.toString() === sourceLanguageId.toString()),
		targetLanguages: [ allLanguages.find(({ _id }) => _id.toString() === targetLanguageId.toString()) ],
		services: [ allServices.find(({ _id }) => _id.toString() === serviceId.toString()) ],
		industries: [ allIndustries.find(({ _id }) => _id.toString() === industryId.toString()) ]
	}
}

const getNeededCurrency = (basicPriceObj, clientCurrency) => {
	const { euroBasicPrice, usdBasicPrice, gbpBasicPrice } = basicPriceObj
	if (clientCurrency === 'EUR') {
		return euroBasicPrice
	} else if (clientCurrency === 'USD') {
		return usdBasicPrice
	} else {
		return gbpBasicPrice
	}
}

const getNeededLangPair = (arr, sourceLangId, targetLangId) => (arr.find(item => (item.sourceLanguage.toString() === sourceLangId.toString() && item.targetLanguage.toString() === targetLangId.toString())))

const getNeededStepRow = (arr, step, unit, size) => (arr.find(item => (`${ item.step } ${ item.unit } ${ item.size }` === `${ step._id } ${ unit._id } ${ size }`)))

const getUniqueServiceItems = (newService, rates, allSteps) => {
	const { services: newServices, industries: newIndustries } = newService
	const { stepMultipliersTable, industryMultipliersTable } = rates
	const newStepUnitCombination = getStepUnitCombinations(newServices, allSteps)
	const currentIndustries = industryMultipliersTable.map(item => item.industry)
	const currentStepUnitCombinations = stepMultipliersTable.map(({ step, unit }) => `${ step } - ${ unit }`)
	let uniqueServiceStepsCombinations = newStepUnitCombination.length ?
			newStepUnitCombination.filter(item => !currentStepUnitCombinations.includes(item))
			: []
	const uniqueServiceSteps = []
	if (uniqueServiceStepsCombinations.length) {
		uniqueServiceStepsCombinations = uniqueServiceStepsCombinations.map(item => item.split(' ')[0])
		uniqueServiceStepsCombinations = Array.from(new Set(uniqueServiceStepsCombinations))
		for (let id of uniqueServiceStepsCombinations) {
			const neededStep = allSteps.find(({ _id }) => _id.toString() === id.toString())
			uniqueServiceSteps.push(neededStep)
		}
	}
	const uniqueIndustries = newIndustries.filter(industry => !currentIndustries.includes(industry._id))
	return {
		uniqueServiceSteps,
		uniqueIndustries
	}
}

const getStepUnitCombinations = (newServices, allSteps) => {
	const stepUnitCombinations = []
	for (let { steps } of newServices) {
		for (let { step } of steps) {
			step = allSteps.find(({ _id }) => _id.toString() === step.toString())
			const { _id, calculationUnit } = step
			for (let { _id: unitId } of calculationUnit) {
				stepUnitCombinations.push(`${ _id } - ${ unitId }`)
			}
		}
	}
	return Array.from(new Set(stepUnitCombinations))
}

const getStepMultipliersCombinations = async ({ _id }, { stepMultipliersTable }) => {
	const stepUnitSizeCombinations = []
	const { calculationUnit } = await Step.findOne({ _id }).populate('calculationUnit')
	if (!calculationUnit.length) {
		return []
	} else {
		for (let item of calculationUnit) {
			const { _id: unitId } = item
			const sizes = item.sizes !== null ? item.sizes : []

			if (sizes.length) {
				sizes.forEach(size => {
					const neededStepRow = stepMultipliersTable.find(item => (
							`${ item.step } ${ item.unit } ${ item.size }` === `${ _id } ${ unitId } ${ size }`
					))
					const multiplier = !!neededStepRow ? neededStepRow.multiplier : 100
					stepUnitSizeCombinations.push({
						step: _id,
						unit: unitId,
						size,
						multiplier
					})
				})
			} else {
				const neededStepRow = stepMultipliersTable.find(({ step, unit }) => (
						`${ step } ${ unit }` === `${ _id } ${ unitId }`
				))
				const multiplier = !!neededStepRow ? neededStepRow.multiplier : 100
				stepUnitSizeCombinations.push({
					step: _id,
					unit: unitId,
					size: 1,
					defaultSize: true,
					multiplier
				})
			}
		}
	}
	return stepUnitSizeCombinations
}

const generateNewPricelistCombinations = (newBasicPriceRows, newStepMultiplierRows, newIndustryMultiplierRows) => {
	const newPricelistCombinations = []
	for (let { step, unit, size, multiplier: stepMultiplierValue } of newStepMultiplierRows) {
		for (let { sourceLanguage, targetLanguage, basicPrice } of newBasicPriceRows) {
			for (let { industry, multiplier: industryMultiplierValue } of newIndustryMultiplierRows) {
				newPricelistCombinations.push({
					sourceLanguage,
					targetLanguage,
					step,
					unit,
					size,
					industry,
					price: multiplyPrices(basicPrice, stepMultiplierValue, size, industryMultiplierValue)
				})
			}
		}
	}
	return newPricelistCombinations
}

const getPricelistCombinations = (basicPricesTable, stepMultipliersTable, industryMultipliersTable, oldPricelistTable, fromDelete = false) => {
	const newPricelistCombinations = []
	for (let { step, unit, size, multiplier: stepMultiplierValue } of stepMultipliersTable) {
		for (let { sourceLanguage, targetLanguage, basicPrice } of basicPricesTable) {
			for (let { industry, multiplier: industryMultiplierValue } of industryMultipliersTable) {
				newPricelistCombinations.push({
					sourceLanguage,
					targetLanguage,
					step,
					unit,
					size,
					industry,
					price: multiplyPrices(basicPrice, stepMultiplierValue, size, industryMultiplierValue)
				})
			}
		}
	}
	const newPricelistComboIds = newPricelistCombinations.map(item => (
			`${ item.sourceLanguage } ${ item.targetLanguage } ${ item.step } ${ item.unit } ${ item.unit } ${ item.size } ${ item.industry }`
	))
	newPricelistCombinations.push(...oldPricelistTable)
	const unique = oldPricelistTable.filter(item => (
			newPricelistComboIds.includes(
					`${ item.sourceLanguage } ${ item.targetLanguage } ${ item.step } ${ item.unit } ${ item.unit } ${ item.size } ${ item.industry }`
			)
	))
	return fromDelete ? unique : _.uniqBy(newPricelistCombinations, (item) => (
			item.sourceLanguage.toString() +
			item.targetLanguage.toString() +
			item.step.toString() +
			item.unit.toString() +
			item.size +
			item.industry.toString()
	))
}

Object.fromEntries = l => l.reduce((a, [ k, v ]) => ({ ...a, [k]: v }), {})

const updateClientRatesFromServices = async (client, updatedService, oldService) => {
	const { _id, rates } = client

	let updatedBasicPricesTable = rates.basicPricesTable
	let updatedStepMultipliersTable = rates.stepMultipliersTable
	let updatedIndustryMultipliersTable = rates.industryMultipliersTable
	let updatedPricelistTable = rates.pricelistTable

	const sourceLangDifference = getSourceLangDifference(updatedService.sourceLanguage, oldService.sourceLanguage._id)
	const targetLangDifference = getArrDifference(updatedService.targetLanguages, oldService.targetLanguages)
	const serviceStepDifference = getArrDifference(updatedService.services, oldService.services)
	const industryDifference = getArrDifference(updatedService.industries, oldService.industries)

	if (!!sourceLangDifference || !!targetLangDifference) {
		updatedBasicPricesTable = await updateClientLangPairs({ client, sourceLangDifference, targetLangDifference, updatedService, oldService })
	}
	if (!!serviceStepDifference) {
		updatedStepMultipliersTable = await updateClientStepMultipliers({ client, serviceStepDifference, updatedService })
	}
	if (!!industryDifference) {
		updatedIndustryMultipliersTable = await updateClientIndustryMultipliers({ client, industryDifference, updatedService })
	}

	updatedPricelistTable = getPricelistCombinations(updatedBasicPricesTable, updatedStepMultipliersTable, updatedIndustryMultipliersTable, updatedPricelistTable)
	updatedPricelistTable = _.uniqBy(updatedPricelistTable, item => (item.sourceLanguage.toString() + item.targetLanguage.toString() + item.step.toString() + item.unit.toString() + item.size + item.industry.toString()))

	await Clients.updateOne({ _id }, {
		rates: {
			basicPricesTable: updatedBasicPricesTable,
			stepMultipliersTable: updatedStepMultipliersTable,
			industryMultipliersTable: updatedIndustryMultipliersTable,
			pricelistTable: await filteredCombinationsResultRatesTable(updatedPricelistTable, _id)
		}
	})

	function getSourceLangDifference(newSourceLang, oldSourceLang) {
		if (newSourceLang.toString() !== oldSourceLang.toString()) return { newItem: newSourceLang.toString(), oldItem: oldSourceLang.toString() }
		return null
	}

	function getArrDifference(newItemsArr, oldItemsArr) {
		oldItemsArr = oldItemsArr.map(({ _id }) => _id.toString())
		newItemsArr = newItemsArr.map(_id => _id.toString())
		const differenceArr = _.difference(newItemsArr, oldItemsArr)
		const oldItem = _.difference(oldItemsArr, newItemsArr)[0]
		if (differenceArr.length) {
			return { newItem: differenceArr[0], oldItem }
		}
		return null
	}
}

const generateServiceCombinations = async (dataToUpdate, oldServices) => {
	const servicesCombinations = []
	const { services: arrServices } = dataToUpdate
	const serviceDataIds = {
		sourceLanguage: [ ObjectId(dataToUpdate.sourceLanguage._id) ],
		targetLanguages: dataToUpdate.targetLanguages.map(item => ObjectId(item._id)),
		services: dataToUpdate.services.map(item => ObjectId(item._id)),
		industries: dataToUpdate.industries.map(item => ObjectId(item._id))
	}

	serviceDataIds.sourceLanguage.forEach(sourceLanguage => {
		serviceDataIds.targetLanguages.forEach(targetLanguages => {
			serviceDataIds.services.forEach(services => {
				serviceDataIds.industries.forEach(industries => {
					const isMono = arrServices.find(item => item._id === services.toString()).languageForm
					if (isMono === 'Mono') {
						const isSame = checkForDuplicateRow(oldServices, sourceLanguage, targetLanguages, services, industries)
						if (!isSame) {
							servicesCombinations.push({ sourceLanguage: targetLanguages, targetLanguages, services, industries })
						}
					} else {
						servicesCombinations.push({ sourceLanguage, targetLanguages, services, industries })
					}
				})
			})
		})
	})
	return servicesCombinations
}

const checkForDuplicateRow = (oldServices, newSourceLang, newTargetLang, newService, newIndustry) => {
	let isIdentical = false
	for (let { sourceLanguage, targetLanguages, services, industries } of oldServices) {
		const isSameSource = sourceLanguage.toString() === newSourceLang.toString()
		const isSameTarget = targetLanguages.find(item => item.toString() === newTargetLang.toString())
		const isSameService = services.find(item => item.toString() === newService.toString())
		const isSameIndustry = industries.find(item => item.toString() === newIndustry.toString())
		isIdentical = isSameSource && !!isSameTarget && isSameService && !!isSameIndustry
	}
	return isIdentical
}

const getUniqueServiceCombinations = (newServices, oldServices) => {
	return newServices.filter(newItem => (
			oldServices.every(oldItem => (
					newItem.sourceLanguage.toString() !== oldItem.sourceLanguage.toString() ||
					newItem.targetLanguages.toString() !== oldItem.targetLanguages[0].toString() ||
					newItem.services.toString() !== oldItem.services[0].toString() ||
					newItem.industries.toString() !== oldItem.industries[0].toString()
			))
	))
}

const getObjDifferences = (obj1, obj2) => {
	let diffs = {}
	let key
	const compare = (item1, item2, key) => {
		item1 = item1._id ? item1._id : item1
		if (item1.toString() !== item2.toString()) {
			diffs[key] = item1.toString()
		}
	}
	for (key in obj1) {
		if (obj1.hasOwnProperty(key)) {
			compare(obj1[key], obj2[key], key)
		}
	}
	return diffs
}

const clearClientRates = (client, rowToDelete) => {
	const { rates, services } = client
	let { pricelistTable } = rates
	let { sourceLanguage, targetLanguages, services: servicesToDelete, industries } = rowToDelete
	const langPair = `${ sourceLanguage._id } ${ targetLanguages[0]._id }`

	const filteredBasicPricesTable = filterRedundantLangPair(
			rates,
			services,
			rowToDelete._id,
			langPair
	)
	const filteredStepsTable = filterRedundantSteps(
			rates,
			services,
			rowToDelete._id,
			servicesToDelete[0]
	)
	const filteredIndustriesTable = filterRedundantIndustry(
			rates,
			services,
			rowToDelete._id,
			industries[0]
	)
	pricelistTable = getPricelistCombinations(
			filteredBasicPricesTable,
			filteredStepsTable,
			filteredIndustriesTable,
			pricelistTable,
			true
	)
	return {
		basicPricesTable: filteredBasicPricesTable,
		stepMultipliersTable: filteredStepsTable,
		industryMultipliersTable: filteredIndustriesTable,
		pricelistTable
	}
}

const filterRedundantLangPair = (rates, services, rowToDeleteId, langPair) => {
	const { basicPricesTable } = rates
	const otherServices = services.filter(
			row => row._id.toString() !== rowToDeleteId.toString()
	)
	const otherLangPairs = otherServices.map(
			row => `${ row.sourceLanguage._id } ${ row.targetLanguages[0]._id }`
	)
	const redundantLangPairs = []
	if (!otherLangPairs.includes(langPair)) redundantLangPairs.push(langPair)
	if (redundantLangPairs.length) {
		return basicPricesTable.filter(
				({ sourceLanguage, targetLanguage }) =>
						!redundantLangPairs.includes(`${ sourceLanguage } ${ targetLanguage }`)
		)
	}
	return basicPricesTable
}

const filterRedundantSteps = (rates, services, rowToDeleteId, serviceToDelete) => {
	const { stepMultipliersTable } = rates
	const otherServices = services.filter(
			row => row._id.toString() !== rowToDeleteId.toString()
	)
	const stepIdsToDelete = serviceToDelete.steps.map(
			({ step }) => step.toString()
	)
	let otherSteps = otherServices.map(
			row => row.services.map(({ steps }) => steps.map(({ step }) => step.toString()))
	)
	otherSteps = Array.from(new Set(flatArr(otherSteps)))
	const redundantSteps = []
	for (let step of stepIdsToDelete) {
		if (!otherSteps.includes(step)) redundantSteps.push(step)
	}
	if (redundantSteps.length) {
		return stepMultipliersTable.filter(({ step }) => !redundantSteps.includes(step.toString()))
	}
	return stepMultipliersTable

	function flatArr(arr) {
		return arr.reduce((acc, cur) => {
			return acc.concat(Array.isArray(cur) ? flatArr(cur) : cur)
		}, [])
	}
}

const filterRedundantIndustry = (rates, services, rowToDeleteId, industryToDelete) => {
	const { industryMultipliersTable } = rates
	const otherServices = services.filter(
			row => row._id.toString() !== rowToDeleteId.toString()
	)
	const otherIndustries = otherServices.map(
			row => row.industries[0]._id
	)
	const redundantIndustries = []
	if (!otherIndustries.includes(industryToDelete._id)) redundantIndustries.push(industryToDelete._id.toString())
	if (redundantIndustries.length) {
		return industryMultipliersTable.filter(({ industry }) => !redundantIndustries.includes(industry.toString()))
	}
	return industryMultipliersTable
}

async function getClientAfterCombinationsUpdated({ project, step, rate }) {
	try {
		const rateInfo = await getRateInfoFromStepFinance({ project, step, rate })
		const client = await getClient({ '_id': project.customer.id })
		return await updateClientRates(client, rateInfo)
	} catch (err) {
		console.log(err)
		console.log('Error in getClientAfterCombinationsUpdated')
	}
}

module.exports = {
	updateClientRates,
	addNewRateComponents,
	updateClientRatesFromServices,
	clearClientRates,
	getStepMultipliersCombinations,
	getNeededCurrency,
	getNeededLangPair,
	getNeededStepRow,
	getPricelistCombinations,
	getObjDifferences,
	replaceOldItem,
	changePricelistTable,
	generateNewPricelistCombinations,
	getClientAfterCombinationsUpdated,
	generateServiceCombinations,
	getUniqueServiceCombinations,
	filteredCombinationsResultRatesTable,
	updateClientRatesFromSettings
}

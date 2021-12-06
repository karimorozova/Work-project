const { Clients, Services } = require('../models')
const ObjectId = require('mongodb').ObjectID
const { getClientAfterUpdate, getClient } = require('./getClients')
const {
	addNewRateComponents,
	updateClientRatesFromServices,
	clearClientRates,
	generateServiceCombinations,
	getUniqueServiceCombinations,
	filteredCombinationsResultRatesTable
} = require('./clientRates')


const updateClientService = async (clientId, dataToUpdate, oldData) => {
	try {
		const settingServices = await Services.find()
		let client = await Clients.findOne({ _id: clientId }).populate('defaultPricelist')
		const { services } = client
		let { sourceLanguage, targetLanguages, services: servicesFromDataUpdate, industries } = dataToUpdate
		let dataForSave = {
			sourceLanguage: ObjectId(sourceLanguage._id),
			targetLanguages: getMappedArr(targetLanguages),
			services: getMappedArr(servicesFromDataUpdate),
			industries: getMappedArr(industries)
		}
		if (dataToUpdate._id) {
			const neededServiceIndex = services.findIndex(service => service._id.toString() === dataToUpdate._id)
			const { languageForm } = settingServices.find(({ _id }) => _id.toString() === dataForSave.services[0].toString())
			dataForSave.sourceLanguage = languageForm === 'Mono' ? dataForSave.targetLanguages[0] : dataForSave.sourceLanguage
			services.splice(neededServiceIndex, 1, dataForSave)
			await Clients.updateOne({ _id: clientId }, { services })
			let client = await Clients.findOne({ _id: clientId }).populate('defaultPricelist')
			await updateClientRatesFromServices(client, dataForSave, oldData)

			const isChanged = isSomethingChanged(dataToUpdate, oldData)
			await deleteImpossibleGroups(clientId, oldData, isChanged)
		} else {
			let generatedServiceCombinations = [ ...await generateServiceCombinations(dataToUpdate, services) ]
			generatedServiceCombinations = getUniqueServiceCombinations(generatedServiceCombinations, services)
			services.push(...generatedServiceCombinations)
			await Clients.updateOne({ _id: clientId }, { services })
			await addNewRateComponents(clientId, generatedServiceCombinations)
		}

		return await getClient({ _id: clientId })
	} catch (err) {
		console.log(err)
		console.log('Error in updateClientService')
	}

	function getMappedArr(arr) {
		return arr.map(item => ObjectId(item._id))
	}
}
const isSomethingChanged =  (newServiceData, oldServiceData) => {
	return oldServiceData.targetLanguages[0]._id.toString() !== newServiceData.targetLanguages[0]._id.toString()
		|| oldServiceData.services[0]._id.toString() !== newServiceData.services[0]._id.toString()
		|| oldServiceData.industries[0]._id.toString() !== newServiceData.industries[0]._id.toString()
		|| oldServiceData.sourceLanguage._id.toString() !== newServiceData.sourceLanguage._id.toString()
}
const deleteImpossibleGroups = async (customerId, old, isChanged) => {
	try {
		console.log({ customerId, old, isChanged })
		if (!isChanged || Object.keys(old).length < 4) return

		const { servicesGroups: clientServicesGroups } = await getClientServicesGroups(customerId)
		const clearedServicesGroups = clientServicesGroups.map((group) => {
			if (
					group.service._id.toString() === old.services[0]._id
					&& group.industry._id.toString() === old.industries[0]._id
					&& group.source._id.toString() === old.sourceLanguage.hasOwnProperty('_id') ? old.sourceLanguage._id : old.sourceLanguage
			) {
				group.target = group.target.filter(targetLang => {
					return targetLang._id.toString() !== (old.targetLanguages[0].hasOwnProperty('_id') ? old.targetLanguages[0]._id.toString() : old.targetLanguages[0].toString())
				})

			}
			return group
		}).filter(({target}) => target.length)
		await Clients.findByIdAndUpdate(customerId, {servicesGroups: clearedServicesGroups})
	} catch (e) {
		console.log(e)
	}
}

const deleteClientService = async (clientId, serviceId) => {
	try {
		const client = await Clients.findOne({ _id: clientId })
				.populate('services.services')
				.populate('services.industries')

		const { services } = client
		const neededServiceIndex = services.findIndex(service => service._id.toString() === serviceId)
		const oldService = neededServiceIndex > 0 ? JSON.parse(JSON.stringify(services[neededServiceIndex])) : {}
		let rates = clearClientRates(client, services[neededServiceIndex])
		services.splice(neededServiceIndex, 1)
		await Clients.updateOne({ _id: clientId }, { services })
		if (!services.length) {
			rates = {
				basicPricesTable: [],
				stepMultipliersTable: [],
				industryMultipliersTable: [],
				pricelistTable: []
			}
		} else {
			rates = {
				...rates,
				pricelistTable: await filteredCombinationsResultRatesTable(rates.pricelistTable, clientId)
			}
		}
		await getClientAfterUpdate({ _id: clientId }, { rates })

		await deleteImpossibleGroups(clientId, oldService, true)

		return await getClient({_id: clientId})

	} catch (err) {
		console.log(err)
		console.log('Error in deleteClientService')
	}
}

async function getClientServices(id) {
	return await Clients.findById(id, {"services": 1})
			.populate('services.sourceLanguage', [ 'lang' ])
			.populate('services.targetLanguages', [ 'lang' ])
			.populate('services.industries', [ 'name' ])
			.populate('services.services', [ 'title', 'steps', 'languageForm'])
			.lean()
}

async function getClientServicesGroups(id) {
	return await Clients.findById(id, {"servicesGroups": 1})
			.populate('servicesGroups.source', [ 'symbol', 'lang' ])
			.populate('servicesGroups.target', [ 'lang' ])
			.populate('servicesGroups.industry', [ 'name' ])
			.populate('servicesGroups.service', [ 'title', 'steps', 'languageForm'])
			.lean()
}

async function deleteClientServiceGroups(clientId, id) {
	return await Clients.findByIdAndUpdate(clientId, {$pull: { "servicesGroups": { _id: id } } },{"servicesGroups": 1}, )
			.populate('servicesGroups.source', [ 'symbol', 'lang' ])
			.populate('servicesGroups.target', [ 'lang' ])
			.populate('servicesGroups.industry', [ 'name' ])
			.populate('servicesGroups.service', [ 'title', 'steps', 'languageForm'])
			.lean()
}

async function createClientServicesGroup(groupData) {
	try {
		const {clientId, groupName, industry, service, source, target} = groupData
		await Clients.findByIdAndUpdate(clientId, {$push: {servicesGroups: {groupName, industry, service, source, target}}} )
	} catch (err) {
		console.log(err)
		console.log('Error in createClientServiceGroup')
	}
}

async function editClientServicesGroup(clientId, id ,groupData) {
	try {
		const { groupName, industry, service, source, target} = groupData
		await Clients.updateOne({ _id: clientId, "servicesGroups._id": id }, {$set: {"servicesGroups.$": {groupName, industry, service, source, target}}} )
	} catch (err) {
		console.log(err)
		console.log('Error in createClientServiceGroup')
	}

}

module.exports = {
	updateClientService,
	deleteClientService,
	generateServiceCombinations,
	getUniqueServiceCombinations,
	getClientServices,
	createClientServicesGroup,
	getClientServicesGroups,
	deleteClientServiceGroups,
	editClientServicesGroup,
}

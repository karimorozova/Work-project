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


const deleteClientService = async (clientId, serviceId) => {
	try {
		const client = await Clients.findOne({ _id: clientId })
				.populate('services.services')
				.populate('services.industries')

		const { services } = client
		const neededServiceIndex = services.findIndex(service => service._id.toString() === serviceId)
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

		return await getClientAfterUpdate({ _id: clientId }, { rates })

	} catch (err) {
		console.log(err)
		console.log('Error in deleteClientService')
	}
}

module.exports = {
	updateClientService,
	deleteClientService,
	generateServiceCombinations,
	getUniqueServiceCombinations
}

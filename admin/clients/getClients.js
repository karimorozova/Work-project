const { Clients, ClientsTasks, ClientsNotes } = require('../models/')
const { getClientsFilteringQuery } = require('./filter')
const { InvoicingPayables, InvoicingReceivables } = require("../models")

const getClientForPortal = async (obj) => {
	const agg = await Clients.aggregate([
		{
			$match: { ...obj }
		},
		{
			$project: {
				"billingInfo": 1,
				"name": 1,
				"officialCompanyName": 1,
				"currency": 1,
				"status": 1,
				"accountManager": 1,
				"projectManager": 1,
				"timeZone": 1,
				"services": 1,
				"contacts.timezone": 1,
				"contacts.leadContact": 1,
				"contacts._id": 1,
				"contacts.firstName": 1,
				"contacts.surname": 1,
				"contacts.email": 1,
				"contacts.gender": 1,
				"contacts.position": 1,
				"contacts.phone": 1,
				"contacts.photo": 1,
				"contacts.country": 1,
				"contacts.notes": 1
			}
		}
	])

	const [ client ] = await Clients.populate(agg, [
		{ path: 'services.sourceLanguage', select: [ 'lang' ] },
		{ path: 'services.targetLanguages', select: [ 'lang' ] },
		{ path: 'services.services', select: [ 'title', 'steps' ] },
		{ path: 'services.industries', select: [ 'name' ] }
	])
	return client
}

async function getClient(obj) {
	return await Clients.findOne(obj)
			.populate('industries', [ 'name', 'icon' ])
			.populate('nativeLanguage', [ 'lang' ])
			.populate('services.sourceLanguage', [ 'lang' ])
			.populate('services.targetLanguages', [ 'lang' ])
			.populate('services.industries', [ 'name' ])
			.populate('sourceLanguages', [ 'lang' ])
			.populate('targetLanguages', [ 'lang' ])
			.populate('rates.industryMultipliersTable.industry', [ 'name', 'icon' ])
			.populate('rates.stepMultipliersTable.step', [ 'title' ])
			.populate('rates.stepMultipliersTable.unit', [ 'type' ])
			.populate('rates.basicPricesTable.sourceLanguage', [ 'lang', 'iso1' ])
			.populate('rates.basicPricesTable.targetLanguage', [ 'lang', 'iso1' ])
			.populate('rates.pricelistTable.sourceLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.targetLanguage', [ 'lang' ])
			.populate('rates.pricelistTable.step', [ 'title' ])
			.populate('rates.pricelistTable.unit', [ 'type' ])
			.populate('rates.pricelistTable.industry', [ 'name' ])
			.populate('timeZone')
			.populate('defaultPricelist', [ 'name' ])
			.populate('services.services', [ 'title', 'steps' ])
}

async function getSimpleClients(find = {}, filter = {}) {
	return await Clients.find(find, filter)
			.populate('industries', [ 'name', 'icon' ])
}

async function getClientWithActions(obj) {

	const client = await Clients.findOne(obj)
			.populate([
				{ path: 'industries', select: [ 'name', 'icon' ] },
				{ path: 'nativeLanguage', select: [ 'lang' ] },
				{ path: 'services.sourceLanguage', select: [ 'lang' ] },
				{ path: 'services.targetLanguages', select: [ 'lang' ] },
				{ path: 'services.industries', select: [ 'name' ] },
				{ path: 'sourceLanguages', select: [ 'lang' ] },
				{ path: 'targetLanguages', select: [ 'lang' ] },
				{ path: 'rates.industryMultipliersTable.industry', select: [ 'name', 'icon' ] },
				{ path: 'rates.stepMultipliersTable.step', select: [ 'title' ] },
				{ path: 'rates.stepMultipliersTable.unit', select: [ 'type' ] },
				{ path: 'rates.basicPricesTable.sourceLanguage', select: [ 'lang', 'iso1' ] },
				{ path: 'rates.basicPricesTable.targetLanguage', select: [ 'lang', 'iso1' ] },
				{ path: 'rates.pricelistTable.sourceLanguage', select: [ 'lang' ] },
				{ path: 'rates.pricelistTable.targetLanguage', select: [ 'lang' ] },
				{ path: 'rates.pricelistTable.step', select: [ 'title' ] },
				{ path: 'rates.pricelistTable.unit', select: [ 'type' ] },
				{ path: 'rates.pricelistTable.industry', select: [ 'name' ] },
				{ path: 'timeZone' },
				{ path: 'defaultPricelist', select: [ 'name' ] },
				{ path: 'services.services', select: [ 'title', 'steps' ] }
			]).lean()

	await ClientsTasks.updateMany({ client: obj._id, status: "Upcoming", dateTime: { $lte: new Date() } }, { $set: { status: "Overdue" } })

	client.tasks = await ClientsTasks.find({ client: obj._id })
			.populate([
				{ path: 'assignedTo', select: [ 'firstName', 'lastName' ] }
			]) || []

	client.activityNotes = await ClientsNotes.find({ client: obj._id })
			.populate([
				{ path: 'assignedTo', select: [ 'firstName', 'lastName' ] }
			]) || []

	client.billingInfo = client.billingInfo.map((billInfo) => {
		billInfo.contacts = client.contacts.filter(({ _id }) => billInfo.contacts.map(({ _id }) => _id.toString()).includes(_id.toString()))
		return billInfo
	})

	return client
}

/**
 *
 * @param {Object} obj - query for searching needed clients
 * @returns {Object} returns clients with populated(fullfilled) rows
 */
async function getClients(obj) {
	return await Clients.find(obj)
			.populate('industries', [ 'name', 'icon' ])
			.populate('nativeLanguage', [ 'lang' ])
			.populate('services.sourceLanguage', [ 'lang' ])
			.populate('services.targetLanguages', [ 'lang' ])
			.populate('services.industries', [ 'name' ])
			.populate('sourceLanguages', [ 'lang' ])
			.populate('targetLanguages', [ 'lang' ])
			.populate('rates.industryMultipliersTable.industry', [ 'icon' ])
			.populate('rates.stepMultipliersTable.step', [ 'title' ])
			.populate('rates.stepMultipliersTable.unit', [ 'type' ])
			.populate('rates.basicPricesTable.sourceLanguage', [ 'lang', 'iso1' ])
			.populate('rates.basicPricesTable.targetLanguage', [ 'lang', 'iso1' ])
			.populate('timeZone')
			.populate('defaultPricelist', [ 'name' ])
			.populate('services.services', [ 'title', 'steps' ])
}

/**
 *
 * @param {Object} query - query for searching needed client
 * @param {Object} update - object that includes changed values
 * @returns {Object} - returns an updated client with populated rows
 */
async function getClientAfterUpdate(query, update) {
	return await Clients.findOneAndUpdate(query, update, { new: true })
			.populate('industries', [ 'name', 'icon' ])
			.populate('nativeLanguage', [ 'lang' ])
			.populate('services.sourceLanguage', [ 'lang' ])
			.populate('services.targetLanguages', [ 'lang' ])
			.populate('services.industries', [ 'name' ])
			.populate('sourceLanguages', [ 'lang' ])
			.populate('targetLanguages', [ 'lang' ])
			.populate('rates.industryMultipliersTable.industry', [ 'icon' ])
			.populate('rates.stepMultipliersTable.step', [ 'title' ])
			.populate('rates.stepMultipliersTable.unit', [ 'type' ])
			.populate('rates.basicPricesTable.sourceLanguage', [ 'lang', 'iso1' ])
			.populate('rates.basicPricesTable.targetLanguage', [ 'lang', 'iso1' ])
			.populate('timeZone')
			.populate('defaultPricelist', [ 'name' ])
			.populate('discounts')
			.populate('services.services', [ 'title', 'steps' ])
}

/**
 *
 * @param {Object} filters - filters for getting needed clients
 * @returns {Array} - returns filtered, sorted and limited value of clients
 */
async function gerFilteredClients(filters) {
	try {
		const query = getClientsFilteringQuery(filters)
		return await Clients.find(query,
				{
					name: 1,
					status: 1,
					website: 1,
					industries: 1,
					leadSource: 1,
					isTest: 1,
					clientType: 1
				})
				.sort({ _id: 1 }).limit(25)
				.populate('industries', [ 'icon' ])
	} catch (err) {
		console.log(err)
		console.log("Error on filtering clients")
	}
}

/**
 *
 * @param {Object} obj - query to search needed client
 * @returns {Object} - returns client with populated rate values
 */
const getClientRates = async (obj) => {
	return Clients.findOne(obj)
			.populate('rates.industryMultipliersTable.industry')
			.populate('rates.stepMultipliersTable.step')
			.populate('rates.stepMultipliersTable.unit')
			.populate('rates.basicPricesTable.sourceLanguage')
			.populate('rates.basicPricesTable.targetLanguage')
			.populate('rates.pricelistTable.sourceLanguage')
			.populate('rates.pricelistTable.targetLanguage')
			.populate('rates.pricelistTable.step')
			.populate('rates.pricelistTable.unit')
			.populate('rates.pricelistTable.industry')
}

/**
 *
 * @returns {Array} - returns an array of clients with needed values
 */
const getClientsForNewProject = async () => {
	return await Clients
			.find({ $or: [ { status: 'Active' }, { status: 'Potential' } ] }, { _id: 1, name: 1, services: 1, billingInfo: 1, clientType: 1 })
			.populate('services.industries')
}

module.exports = {
	getClient,
	getClients,
	getClientAfterUpdate,
	gerFilteredClients,
	getClientsForNewProject,
	getClientRates,
	getClientWithActions,
	getSimpleClients,
	getClientForPortal
}

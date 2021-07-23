const ObjectId = require('mongodb').ObjectID

function getFilterdProjectsQuery(filters, allLanguages, allServices) {

	const reg = /[.*+?^${}()|[\]\\]/g
	let query = {}

	const {
		status,
		projectId,
		projectName,
		lastDate,
		clientName,
		projectManager,
		accountManager,
		startDate,
		deadline,
		sourceLanguages,
		targetLanguages,
		industry,
		services,
		isTest,
		projectCurrency,
		paymentProfile,
		vendors,
	} = filters

	if (status !== 'All') query["status"] = status

	if (projectId) {
		const filter = projectId.replace(reg, '\\$&')
		query['projectId'] = { "$regex": new RegExp(filter, 'i') }
	}

	if (projectName) {
		const filter = projectName.replace(reg, '\\$&')
		query['projectName'] = { "$regex": new RegExp(filter, 'i') }
	}

	if (lastDate) {
		query['startDate'] = { $lt: new Date(lastDate) }
	}

	if (clientName) {
		query["customer.name"] = { "$regex": new RegExp(`${ clientName }`, 'i') }
	}

	if (projectManager) {
		query["projectManager"] = ObjectId(projectManager)
	}

	if (accountManager) {
		query["accountManager"] = ObjectId(accountManager)
	}

	if (startDate) {
		query["startDate"] = { $gte: new Date(`${ startDate }T00:00:00.000Z`), $lt: new Date(`${ startDate }T24:00:00.000Z`) }
	}

	if (deadline) {
		query["deadline"] = { $gte: new Date(`${ deadline }T00:00:00.000Z`), $lt: new Date(`${ deadline }T24:00:00.000Z`) }
	}

	if (sourceLanguages) {
		query["tasks.sourceLanguage"] = { $in: sourceLanguages.split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	}
	if (targetLanguages) {
		query["tasks.targetLanguage"] = { $in: targetLanguages.split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	}

	if (industry) {
		query["industry"] = ObjectId(industry)
	}

	if (services) {
		query["tasks.service.title"] = { $in: services.split(',').map(item => allServices.find(({ _id }) => _id.toString() === item.toString()).title) }
	}

	if (vendors) {
		query["steps.vendor"] = { $in: vendors.split(',').map(item => ObjectId(item)) }
	}

	if (isTest) {
		query["isTest"] = isTest === "Yes"
	}

	if (projectCurrency) {
		query["projectCurrency"] = projectCurrency
	}

	if (paymentProfile) {
		console.log(paymentProfile)
		query["paymentProfile"] = paymentProfile
	}
	return query
}

module.exports = { getFilterdProjectsQuery }
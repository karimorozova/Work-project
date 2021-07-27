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
		tasksStatuses
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
		const filter = clientName.replace(reg, '\\$&')
		query["customer.name"] = { "$regex": new RegExp(filter, 'i') }
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

	if (tasksStatuses) {
		const tasksStatusesArr = tasksStatuses.split(',')
		if(tasksStatusesArr.includes('In progress') && !tasksStatusesArr.includes('Started')) tasksStatusesArr.push('Started')
		console.log(tasksStatusesArr)
		query["tasks.status"] = { $in: tasksStatusesArr }
	}

	if (isTest) {
		query["isTest"] = isTest === "Yes"
	}

	if (projectCurrency) {
		query["projectCurrency"] = projectCurrency
	}

	if (paymentProfile) {
		query["paymentProfile"] = paymentProfile
	}
	return query
}

module.exports = { getFilterdProjectsQuery }
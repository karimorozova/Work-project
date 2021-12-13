const { Projects } = require("../models")
const { ObjectID: ObjectId } = require("mongodb")
const { Languages, Services, ClientRequest } = require("../models/")

const reg = /[.*+?^${}()|[\]\\]/g

// function getProjectsForPipeline  (countToSkip , countToGet) {
exports.getProjectsForPipeline  = async (queryPage , queryLimit, filters) => {
	const page = queryPage * 1 || 1;
	const limit = queryLimit * 1 || 100;
	const skip = (page - 1) * limit;
	let query = {}


	const allLanguages = await Languages.find()
	const allServices = await Services.find()
	const allRequests = await ClientRequest.find()


	const {
		// status,
		projectId,
		projectName,
		// lastDate,
		// clientName,
		projectManager,
		accountManager,
		// startDate,
		// deadline,
		sourceLanguages,
		targetLanguages,
		// industry,
		services,
		// isTest,
		// projectCurrency,
		// paymentProfile,
		// vendors,
		tasksStatuses,
		// requestId
	} = filters
	console.log(filters)
	if (projectId) {
		const filter = projectId.replace(reg, '\\$&')
		query['projectId'] = { "$regex": new RegExp(filter, 'i') }
	}
	if (projectName) {
		const filter = projectName.replace(reg, '\\$&')
		query['projectName'] = { "$regex": new RegExp(filter, 'i') }
	}
	if (tasksStatuses) {
		const tasksStatusesArr = tasksStatuses.split(',')
		// if (tasksStatusesArr.includes('In progress') && !tasksStatusesArr.includes('Started')) tasksStatusesArr.push('Started')
		query["steps.status"] = { $in: tasksStatusesArr }
	}
	if (projectManager) {
		query["projectManager"] = ObjectId(projectManager)
	}
	if (accountManager) {
		query["accountManager"] = ObjectId(accountManager)
	}
	if (sourceLanguages) {
		query["steps.sourceLanguage"] = { $in: sourceLanguages.split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	}
	if (targetLanguages) {
		query["steps.targetLanguage"] = { $in: targetLanguages.split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	}
	if (services) {
		console.log(services.split(',').map(item => ObjectId(item)))
		query["steps.service"] = { $in: services.split(',').map(item => ObjectId(item)) }
	}

	const STATUSES = ["In Progress", "Ready to Start", "Waiting to Start", "Rejected", "Request Sent", "Approved"]
	query['status'] = {$in: STATUSES}
	query['isTest'] =  false
	return await getAllSteps(skip, limit, query)
}

const getAllSteps = async (countToSkip, countToGet, queryForStep) => {
	const queryPipeline = [
		{ $unwind: "$steps" },
		{
			$match: {
				// clientBillingInfo: { $exists: true, $ne: null },
				// $or: [ { "steps.isInReportReceivables": false }, { "steps.isInReportReceivables": { $exists: false } } ],
				...queryForStep
			}
		},
		{
			$project: {
				'steps.stepAndUnit.step': 1,
				'steps.vendor': 1,
				'steps.sourceLanguage': 1,
				'steps.targetLanguage': 1,
				'steps.status': 1,
				"projectId": 1,
				'projectName': 1,
				'deadline': 1,
				'startDate': 1,
				// 'billingDate': 1,
				// 'projectCurrency': 1,
				// 'paymentProfile': 1,
				// 'clientBillingInfo': 1,
				'projectManager': 1,
				'accountManager': 1,
				'customer': 1,
			}
		},
		{ $skip: countToSkip },
		{ $sort: {'deadline': 1 }}
	]
	if (countToGet > 0) {
		queryPipeline.push({ $limit: countToGet })
	}
	const test = await Projects.aggregate(queryPipeline)
	return (await Projects.populate(test, [
		{ path: 'projectManager', select: [ 'firstName', 'lastName' ] },
		{ path: 'accountManager', select: [ 'firstName', 'lastName' ] },
		{ path: 'customer', select: ['name']  },
		{ path: 'steps.vendor', select: [ 'firstName', 'surname' ] },
	]))
}

const { Projects } = require("../models")
const { ObjectID: ObjectId } = require("mongodb")
const { Languages, Services, ClientRequest } = require("../models/")

const reg = /[.*+?^${}()|[\]\\]/g

// function getProjectsForPipeline  (countToSkip , countToGet) {
exports.getProjectsForPipeline = async (queryPage, queryLimit, filters) => {
	const page = queryPage * 1 || 1
	const limit = queryLimit * 1 || 100
	const skip = (page - 1) * limit
	let query = {}

	const STATUSES = [ 'Created', 'Approved', 'Rejected', 'Request Sent', 'Ready to Start', 'Waiting to Start', 'In progress' ]

	const allLanguages = await Languages.find()
	const allServices = await Services.find()
	const allRequests = await ClientRequest.find()

	const {
		// status,
		projectId,
		projectName,
		// lastDate,
		clients,
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
		vendors,
		stepsStatuses,
		startDateFrom,
		startDateTo,
		deadlineFrom,
		deadlineTo
	} = filters

	const stepsStatusesArr = stepsStatuses.split(',').filter(status => STATUSES.includes(status))
	query["steps.status"] = { $in: stepsStatusesArr.length ? stepsStatusesArr : STATUSES }

	if (projectId) {
		const filter = projectId.replace(reg, '\\$&')
		query['projectId'] = { "$regex": new RegExp(filter, 'i') }
	}
	if (projectName) {
		const filter = projectName.replace(reg, '\\$&')
		query['projectName'] = { "$regex": new RegExp(filter, 'i') }
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
		query["steps.step"] = { $in: services.split(',').map(item => ObjectId(item)) }
	}
	if (vendors) {
		query["steps.vendor"] = { $in: vendors.split(',').map(item => ObjectId(item)) }
	}
	if (clients) {
		query["customer"] = { $in: clients.split(',').map(item => ObjectId(item)) }
	}
	if (startDateFrom && startDateTo) {
		console.log(new Date(+startDateFrom), new Date(+startDateTo))
		query["steps.start"] = { $gte: new Date(+startDateFrom), $lte: new Date(+startDateTo) }
	}
	if (deadlineFrom && deadlineTo) {
		query["steps.deadline"] = { $gte: new Date(+deadlineFrom), $lte: new Date(+deadlineTo) }
	}
	const PROJECT_STATUSES = [ "In progress", "Approved" ]
	query['status'] = { $in: PROJECT_STATUSES }
	query['isTest'] = false
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
				"crossRate": 1,
				"industry": 1,
				"projectId": 1,
				'projectName': 1,
				'deadline': 1,
				'startDate': 1,
				'projectCurrency': 1,
				'projectManager': 1,
				'accountManager': 1,
				'customer': 1,
				'minimumCharge': 1,
				'status': 1,
				'discounts': 1,
				'steps': 1,
				'tasks': 1
			}
		},
		{
			$addFields: {
				"tasks": {
					$filter: {
						"input": "$tasks",
						"as": "item",
						"cond": { $eq: [ "$$item.taskId", "$steps.taskId" ] }
					}
				}
			}
		},
		{ $skip: countToSkip },
		{ $sort: { 'steps.deadline': 1 } }
	]
	if (countToGet > 0) {
		queryPipeline.push({ $limit: countToGet })
	}
	const steps = await Projects.aggregate(queryPipeline)

	return (await Projects.populate(steps, [
		{ path: 'projectManager', select: [ 'firstName', 'lastName', 'photo', 'email' ] },
		{ path: 'accountManager', select: [ 'firstName', 'lastName', 'photo', 'email' ] },
		{ path: 'customer', select: [ 'name' ] },
		{ path: 'steps.vendor', select: [ 'firstName', 'surname', 'email', 'guid', 'photo' ] },
		{ path: 'steps.step' },
		{ path: 'steps.fullSourceLanguage' },
		{ path: 'steps.fullTargetLanguage' },
		{ path: 'steps.receivablesUnit' },
		{ path: 'steps.payablesUnit' },
		{ path: 'industry' }
	]))
}

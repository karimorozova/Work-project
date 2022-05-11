const { Projects } = require("../models")
const { ObjectID: ObjectId } = require("mongodb")
const { Languages, Services, ClientRequest } = require("../models")

const defaultOptions = {
	hasSkip: true,
	hasLimit: true,
	hasSort: true
}

// const getAllSteps = async (countToSkip, countToGet, queryForStep) => {
// 	const matchProject = {
// 		$match: {
// 			clientBillingInfo: { $exists: true, $ne: null }
// 		}
// 	}
// 	if ('customer' in queryForStep) {
// 		matchProject.$match.customer = queryForStep.customer
// 		delete queryForStep.customer
// 	}
// 	if('clientBillingInfo' in queryForStep){
// 		matchProject.$match.clientBillingInfo = queryForStep.clientBillingInfo
// 		delete queryForStep.clientBillingInfo
// 	}
// 	if('billingDate' in queryForStep ){
// 		matchProject.$match.billingDate = queryForStep.billingDate
// 		delete queryForStep.billingDate
// 	}
// 	if('projectId' in queryForStep ){
// 		matchProject.$match._id =  queryForStep.projectId
// 		delete queryForStep.projectId
// 	}
//
// 	const lookup = {
// 		$lookup:
// 				{
// 					from: "clients",
// 					localField: "customer",
// 					foreignField: "_id",
// 					as: "customer"
// 				}
// 	}
// 	const addFields1 = getExtraFieldStructure('Classic')
// 	const addFields2 = getExtraFieldStructure('Extra')
// 	const unset = {
// 		$unset: [
// 			'customer.rates',
// 			'customer.services',
// 			'additionsSteps'
// 		]
// 	}
// 	const neededFields = {
// 		"projectId": 1,
// 		'projectName': 1,
// 		'deadline': 1,
// 		'startDate': 1,
// 		'billingDate': 1,
// 		'projectCurrency': 1,
// 		'clientBillingInfo': 1
// 	}
//
// 	const queryPipelineClassicSteps = [
// 		matchProject,
// 		lookup,
// 		{
// 			$project: {
// 				'steps': 1,
// 				...neededFields,
// 				'customer': { $arrayElemAt: [ "$customer", 0 ] }
// 			}
// 		},
// 		addFields1,
// 		{ $unwind: "$steps" },
// 		{
// 			$match: {
// 				$and: [
// 					{$or: [ { "steps.isInReportReceivables": false }, { "steps.isInReportReceivables": { $exists: false } } ]},
// 					{$or: [ {"steps.isReceivableVisible": true,}, {"steps.isReceivablesVisible": true,} ]}
// 				],
// 				"steps.status": { $in: [ 'Completed', 'Cancelled Halfway', 'Created'] },
// 				"steps.finance.Price.receivables": { $gt: 0 },
// 				...queryForStep
// 			}
// 		},
// 		unset
// 	]
//
// 	const queryPipelineExtraSteps = [
// 		matchProject,
// 		lookup,
// 		{
// 			$project: {
// 				'additionsSteps': 1,
// 				...neededFields,
// 				'customer': { $arrayElemAt: [ "$customer", 0 ] }
// 			}
// 		},
// 		addFields2,
// 		{ $unwind: "$additionsSteps" },
// 		{
// 			$match: {
// 				$or: [ { "additionsSteps.isInReportReceivables": false }, { "additionsSteps.isInReportReceivables": { $exists: false } } ],
// 				"additionsSteps.finance.Price.receivables": { $gt: 0 },
// 				...queryForStep
// 			}
// 		},
// 		{
// 			$addFields: {
// 				"steps": "$additionsSteps"
// 			}
// 		},
// 		unset
// 	]
//
// 	const classicSteps = await Projects.aggregate(queryPipelineClassicSteps)
// 	const extraSteps = await Projects.aggregate(queryPipelineExtraSteps)
//
// 	return classicSteps.concat(extraSteps).slice(countToSkip, countToSkip + countToGet)
//
// 	function getExtraFieldStructure(type) {
// 		return {
// 			$addFields: {
// 				"type": type,
// 				"selectedBillingInfo": {
// 					$arrayElemAt: [
// 						{
// 							$filter: {
// 								input: "$customer.billingInfo",
// 								cond: { $eq: [ "$$this._id", "$clientBillingInfo" ] }
// 							}
// 						},
// 						0
// 					]
// 				}
// 			}
// 		}
// 	}
// }
module.exports = getReceivablesSteps = async ({ project = {}, query = {}, queryForStep = {},  sort = {}, options = {}, countToSkip = 0, countToGet = 50 }) => {
	// const allLanguages = await Languages.find()
	// const allRequests = await ClientRequest.find()
	try {
	sort = handlerSort(sort)
	query = handlerQuery(query)

	options = {
		...defaultOptions,
		...options
	}

	const data = await Projects.aggregate([
		...(Object.keys(query).length ? [ { $match: { clientBillingInfo: { $exists: true, $ne: null }, ...query } } ] : []),
		...(Object.keys(project).length ? [ { $project: { ...project } } ] : []),
		{
			$addFields: {
				"type": "Classic",
				"selectedBillingInfo": {
					$arrayElemAt: [
						{
							$filter: {
								input: "$customer.billingInfo",
								cond: { $eq: [ "$$this._id", "$clientBillingInfo" ] }
							}
						},
						0
					]
				}
			}
		},
		{ $unwind: "$steps" },
		{
			$match: {
				$or: [ { "additionsSteps.isInReportReceivables": false }, { "additionsSteps.isInReportReceivables": { $exists: false } } ],
				"additionsSteps.finance.Price.receivables": { $gt: 0 },
				...queryForStep
			},
		},

		// {
		// 	$addFields: {
		// 		total: { $add: [ "$finance.Price.receivables", { $sum: '$additionsSteps.finance.Price.receivables' } ] },
		// 		margin: { $subtract: [ "$finance.Price.receivables", "$finance.Price.payables" ] },
		// 		marginPercent: {
		// 			$multiply: [
		// 				100,
		// 				{
		// 					$subtract: [
		// 						1,
		// 						{
		// 							$divide: [
		// 								{ $sum: [ "$finance.Price.payables", 0.001 ] },
		// 								{ $sum: [ "$finance.Price.receivables", 0.001 ] }
		// 							]
		// 						}
		// 					]
		// 				}
		// 			]
		// 		},
		// 		roi: {
		// 			$multiply: [
		// 				100,
		// 				{
		// 					$divide: [
		// 						{
		// 							$subtract: [
		// 								"$finance.Price.receivables",
		// 								"$finance.Price.payables"
		// 							]
		// 						},
		// 						{ $sum: [ "$finance.Price.payables", 0.001 ] }
		// 					]
		// 				}
		// 			]
		// 		}
		// 	}
		// },
		...(!!options.hasSort && Object.keys(sort).length ? [ { $sort: sort } ] : []),
		...(!!options.hasSkip ? [ { $skip: countToSkip } ] : []),
		...(!!options.hasLimit ? [ { $limit: countToGet } ] : [])
	])
	return Projects.populate(data, [
		{ path: 'customer', select: [ 'name' ] },
	])
	}catch(e) {
		console.log(e)
	}
}

const handlerSort = (rawSort, allowedFields = ['projectId', 'projectName']) => {
	const sort = {}

	if (!Object.keys(rawSort).length) return { _id: -1 }

	Object.keys(rawSort).forEach(el => {
		console.log(el.split('_')[1])
		if (allowedFields.includes(el.split('_').at(-1))) sort[el.split('_')[1]] = +rawSort[el];
	});

	// if (rawSort['sf_projectID']) {
	// 	sort['projectId'] = +rawSort['sf_projectID']
	// }
	// if (rawSort['sf_projectName']) {
	// 	sort['projectName'] = +rawSort['sf_projectName']
	// }
	// if (rawSort['sf_clientName']) {
	// 	sort['customer'] = +rawSort['sf_clientName']
	// }
	// if (rawSort['sf_startDate']) {
	// 	sort['startDate'] = +rawSort['sf_startDate']
	// }
	// if (rawSort['sf_deadline']) {
	// 	sort['deadline'] = +rawSort['sf_deadline']
	// }
	// if (rawSort['sf_projectManager']) {
	// 	sort['projectManager'] = +rawSort['sf_projectManager']
	// }
	// if (rawSort['sf_accountManager']) {
	// 	sort['accountManager'] = +rawSort['sf_accountManager']
	// }
	// if (rawSort['sf_industry']) {
	// 	sort['industry'] = +rawSort['sf_industry']
	// }
	// if (rawSort['sf_isTest']) {
	// 	sort['isTest'] = +rawSort['sf_isTest']
	// }
	// if (rawSort['sf_payables']) {
	// 	sort['finance.Price.payables'] = +rawSort['sf_payables']
	// }
	// if (rawSort['sf_receivables']) {
	// 	sort['finance.Price.receivables'] = +rawSort['sf_receivables']
	// }
	// if (rawSort['sf_total']) {
	// 	sort['total'] = +rawSort['sf_total']
	// }
	// if (rawSort['sf_margin']) {
	// 	sort['margin'] = +rawSort['sf_margin']
	// }
	// if (rawSort['sf_marginPercent']) {
	// 	sort['marginPercent'] = +rawSort['sf_marginPercent']
	// }
	// if (rawSort['sf_roi']) {
	// 	sort['roi'] = +rawSort['sf_roi']
	// }
	// if (rawSort['sf_projectCurrency']) {
	// 	sort['projectCurrency'] = +rawSort['sf_projectCurrency']
	// }
	// if (rawSort['sf_status']) {
	// 	sort['status'] = +rawSort['sf_status']
	// }
	// if (rawSort['sf_urgent']) {
	// 	sort['isUrgent'] = +rawSort['sf_urgent']
	// }
	// if (rawSort['sf_requestId']) {
	// 	sort['requestId'] = +rawSort['sf_requestId']
	// }

	return sort
}

const handlerQuery = (rawQuery, models) => {
	const query = {}
	const reg = /[.*+?^${}()|[\]\\]/g
	// const { allLanguages, allRequests } = models

	console.log('rawQuery', rawQuery)

	if (rawQuery['f_customer']) {
	// 	matchProject.$match.customer = queryForStep.customer
			query["customer"] = rawQuery['f_customer']
	}
	if(rawQuery['f_clientBillingInfo']){
		// matchProject.$match.clientBillingInfo = queryForStep.clientBillingInfo
		query["clientBillingInfo"] = rawQuery['f_clientBillingInfo']
	}
	if(rawQuery['f_billingDate'] ){
	// 	matchProject.$match.billingDate = queryForStep.billingDate

		query["billingDate"] = rawQuery['f_billingDate']
	}
	if(rawQuery['f_projectId']){
		query["_id"] = rawQuery['f_projectId']
	}



	// if (rawQuery['status'] && rawQuery['status'] !== 'All') {
	// 	query["status"] = rawQuery['status']
	// }
	// if (rawQuery['f_projectId']) {
	// 	const filter = rawQuery['f_projectId'].replace(reg, '\\$&')
	// 	query['projectId'] = { "$regex": new RegExp(filter, 'i') }
	// }
	// if (rawQuery['f_deadline']) {
	// 	query["deadline"] = { $gte: new Date(+rawQuery['f_deadline'].split('_')[0]), $lt: new Date(+rawQuery['f_deadline'].split('_')[1]) }
	// }
	// if (rawQuery['f_startDate']) {
	// 	query["startDate"] = { $gte: new Date(+rawQuery['f_startDate'].split('_')[0]), $lt: new Date(+rawQuery['f_startDate'].split('_')[1]) }
	// }
	// if (rawQuery['f_projectName']) {
	// 	const filter = rawQuery['f_projectName'].replace(reg, '\\$&')
	// 	query['projectName'] = { "$regex": new RegExp(filter, 'gi') }
	// }
	// if (rawQuery['f_vendors']) {
	// 	query["steps.vendor"] = { $in: rawQuery['f_vendors'].split(',').map(item => ObjectId(item)) }
	// }
	// if (rawQuery['f_clients']) {
	// 	query["customer"] = { $in: rawQuery['f_clients'].split(',').map(item => ObjectId(item)) }
	// }
	// if (rawQuery['f_projectManager']) {
	// 	query["projectManager"] = ObjectId(rawQuery['f_projectManager'])
	// }
	// if (rawQuery['f_accountManager']) {
	// 	query["accountManager"] = ObjectId(rawQuery['f_accountManager'])
	// }
	// if (rawQuery['f_sourceLanguages']) {
	// 	query["tasks.sourceLanguage"] = { $in: rawQuery['f_sourceLanguages'].split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	// }
	// if (rawQuery['f_targetLanguages']) {
	// 	query["tasks.targetLanguage"] = { $in: rawQuery['f_targetLanguages'].split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	// }
	// if (rawQuery['f_industry']) {
	// 	query["industry"] = ObjectId(rawQuery['f_industry'])
	// }
	// if (rawQuery['f_tasksServices']) {
	// 	query["tasks.service"] = { $in: rawQuery['f_tasksServices'].split(',').map(i => ObjectId(i)) }
	// }
	// if (rawQuery['f_tasksStatuses']) {
	// 	query["tasks.status"] = { $in: rawQuery['f_tasksStatuses'].split(',') }
	// }
	// if (rawQuery['f_stepsStatuses']) {
	// 	query["steps.status"] = { $in: rawQuery['f_stepsStatuses'].split(',') }
	// }
	// if (rawQuery['f_isTest']) {
	// 	query["isTest"] = rawQuery['f_isTest'] === "Yes"
	// }
	// if (rawQuery['f_projectCurrency']) {
	// 	query["projectCurrency"] = rawQuery['f_projectCurrency']
	// }
	// if (rawQuery['f_requestId']) {
	// 	const requests = allRequests.filter(({ projectId }) => projectId.includes(rawQuery['f_requestId']))
	// 	console.log(requests)
	// 	if (requests.length) query['requestId'] = { $in: requests.map(i => ObjectId(i._id)) }
	// }
	// if (rawQuery['f_stepsServices']) {
	// 	query["steps.step"] = { $in: rawQuery['f_stepsServices'].split(',').map(i => ObjectId(i)) }
	// }

	console.log('FIN', query)

	return query
}

const { Projects, InvoicingReceivables } = require("../models")
const moment = require('moment')
const { ObjectID: ObjectId } = require('mongodb')


const reportsFiltersQuery = ({ reportId, clients, billingDateTo, billingDateFrom, status }) => {
	const q = {}
	const reg = /[.*+?^${}()|[\]\\]/g

	if (reportId) {
		const f = reportId.replace(reg, '\\$&')
		q['reportId'] = { "$regex": new RegExp(f, 'i') }
	}
	if (clients) {
		q["client"] = { $in: clients.split(',').map(item => ObjectId(item)) }
	}
	if (status) {
		q["status"] = status
	}

	if (!!billingDateTo && !!billingDateFrom) {
		q['firstPaymentDate'] = { $gte: new Date(+billingDateFrom) }
		q['lastPaymentDate'] = { $lt: new Date(+billingDateTo) }
	}

	return q
}

// TODO: Refactoring == >
// const getReportById = async (id) => {
// 	const report = await getReportByIdFromDb(id)
// 	const { result, sumPaymentAdditions, uniquePaymentAdditions } = getReceivableTotal(report[0])
// 	report[0].total = result + sumPaymentAdditions
// 	return report
// }
// const getAllReports = async (countToSkip, countToGet, query) => {
// 	const reports = await getAllReportsFromDb(countToSkip, countToGet, query)
// 	// for (const report of reports) {
// 	// 	const { result, sumPaymentAdditions } = getReceivableTotal(report)
// 	// 	report.total = result + sumPaymentAdditions
// 	// }
// 	return reports
// }
// const getReceivableTotal = (report) => {
// 	const uniquePaymentAdditions = getUniquePaymentAdditions(report)
// 	const test = getProjectMinimumChargeAndSumReceivables(report)
// 	const result = Object.values(test).reduce((acc, { receivables, minimumCharge }) => acc += minimumCharge > receivables ? minimumCharge : receivables, 0)
// 	return { result, sumPaymentAdditions: uniquePaymentAdditions.reduce((acc, { finance }) => acc += finance.Price.receivables, 0), uniquePaymentAdditions }
// }
// const getUniquePaymentAdditions = (report) => {
// 	let uniquePaymentAdditions = []
// 	let countedProjectIds = []
// 	if (!report) return []
// 	for (const { projectNativeId, projectId, paymentAdditions = [] } of report.stepsWithProject) {
//
// 		if (!countedProjectIds.includes(projectNativeId.toString())) {
// 			const paymentAdditionsWithProjId = paymentAdditions.map(item => {
// 				item.projectId = projectId
// 				return item
// 			})
// 			uniquePaymentAdditions.push(...paymentAdditions)
// 			countedProjectIds.push(projectNativeId.toString())
// 		}
// 	}
// 	return uniquePaymentAdditions
// }
// const getProjectMinimumChargeAndSumReceivables = (report) => {
// 	let groupedReports = {}
// 	if (!report) return {}
// 	for (const { projectNativeId, finance, minimumCharge = { toIgnore: true } } of report.stepsWithProject) {
// 		if (Boolean(groupedReports[projectNativeId])) {
// 			groupedReports[projectNativeId].receivables += finance.Price.receivables
// 		} else {
// 			groupedReports[projectNativeId] = { receivables: finance.Price.receivables, minimumCharge: !minimumCharge.toIgnore ? minimumCharge.value : 0 }
// 		}
// 	}
// 	return groupedReports
// }
// const getReportByIdFromDb = async (id) => {
// 	const queryResult = await InvoicingReceivables.aggregate([
// 		{ $match: { "_id": ObjectId(id) } },
// 		{
// 			$lookup: {
// 				from: "projects",
// 				let: { 'steps': '$stepsAndProjects.step' },
// 				pipeline: [
// 					{ "$unwind": "$steps" },
// 					{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
// 					{ "$addFields": { "steps.projectNativeId": '$_id' } },
// 					{ "$addFields": { "steps.projectId": '$projectId' } },
// 					{ "$addFields": { "steps.projectName": '$projectName' } },
// 					{ "$addFields": { "steps.projectCurrency": '$projectCurrency' } },
// 					{ '$replaceRoot': { newRoot: '$steps' } }
// 				],
// 				as: "stepsWithProject"
// 			}
// 		},
// 		{
// 			$addFields: {
// 				total: { $sum: "$stepsWithProject.finance.Price.receivables" }
// 			}
// 		}
// 	])
//
// 	return await InvoicingReceivables.populate(queryResult, [
// 				{ path: 'client', select: [ 'name', 'billingInfo' ] }
// 			]
// 	)
// }

const getAllReportsFromDb = async (countToSkip, countToGet, query) => {
	const queryResult = await InvoicingReceivables.aggregate([
		{
			$lookup: {
				from: "projects",
				let: { 'steps': '$stepsAndProjects.step' },
				pipeline: [
					{ $unwind: "$steps" },
					{ $match: { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
					{ $addFields: { "steps.projectNativeId": '$_id' } },
					{ $addFields: { "steps.projectName": '$projectName' } },
					{ $addFields: { "steps.projectCurrency": '$projectCurrency' } },
					{ $replaceRoot: { newRoot: '$steps' } }
				],
				as: "stepsClassic"
			}
		},
		{
			$lookup: {
				from: "projects",
				let: { 'additionsSteps': '$stepsAndProjects.step' },
				pipeline: [
					{ $unwind: "$additionsSteps" },
					{ $match: { "$expr": { "$in": [ "$additionsSteps._id", "$$additionsSteps" ] } } },
					{ $addFields: { "additionsSteps.projectNativeId": '$_id' } },
					{ $addFields: { "additionsSteps.projectName": '$projectName' } },
					{ $addFields: { "steps.projectCurrency": '$projectCurrency' } },
					{ $replaceRoot: { newRoot: '$additionsSteps' } }
				],
				as: "stepsExtra"
			}
		},
		{ $addFields: { "stepsWithProject": { $concatArrays: [ '$stepsClassic', '$stepsExtra' ] } } },
		{ $addFields: { "total": { $sum: '$stepsWithProject.finance.Price.receivables' } } },
		{ $unset: [ 'stepsClassic', 'stepsExtra' ] },
		{ $match: { ...query } },
		{ $sort: { reportId: -1 } },
		{ $skip: countToSkip },
		{ $limit: countToGet }
	])

	return await InvoicingReceivables.populate(queryResult, [
				{ path: 'client', select: [ 'name', 'billingInfo' ] }
			]
	)
}

const getAllSteps = async (countToSkip, countToGet, queryForStep) => {
	const match1 = {
		$match: {
			clientBillingInfo: { $exists: true, $ne: null }
		}
	}
	const lookup = {
		$lookup:
				{
					from: "clients",
					localField: "customer",
					foreignField: "_id",
					as: "customer"
				}
	}
	const addFields1 = getExtraFieldStructure('Classic')
	const addFields2 = getExtraFieldStructure('Extra')
	const unset = {
		$unset: [
			'customer.rates',
			'customer.services',
			'additionsSteps'
		]
	}
	const queryPipelineClassicSteps = [
		match1,
		lookup,
		{
			$project: {
				'steps': 1,
				"projectId": 1,
				'projectName': 1,
				'deadline': 1,
				'startDate': 1,
				'billingDate': 1,
				'projectCurrency': 1,
				'clientBillingInfo': 1,
				'customer': { $arrayElemAt: [ "$customer", 0 ] }
			}
		},
		addFields1,
		{ $unwind: "$steps" },
		{
			$match: {
				$or: [ { "steps.isInReportReceivables": false }, { "steps.isInReportReceivables": { $exists: false } } ],
				"steps.status": { $in: [ 'Completed', 'Cancelled Halfway' ] },
				"steps.finance.Price.receivables": { $gt: 0 },
				...queryForStep
			}
		},
		unset
	]
	const queryPipelineExtraSteps = [
		match1,
		lookup,
		{
			$project: {
				'additionsSteps': 1,
				"projectId": 1,
				'projectName': 1,
				'deadline': 1,
				'startDate': 1,
				'billingDate': 1,
				'projectCurrency': 1,
				'clientBillingInfo': 1,
				'customer': { $arrayElemAt: [ "$customer", 0 ] }
			}
		},
		addFields2,
		{ $unwind: "$additionsSteps" },
		{
			$match: {
				$or: [ { "additionsSteps.isInReportReceivables": false }, { "additionsSteps.isInReportReceivables": { $exists: false } } ],
				"additionsSteps.finance.Price.receivables": { $gt: 0 },
				...queryForStep
			}
		},
		{
			$addFields: {
				"steps": "$additionsSteps"
			}
		},
		unset
	]

	const classicSteps = await Projects.aggregate(queryPipelineClassicSteps)
	const extraSteps = await Projects.aggregate(queryPipelineExtraSteps)

	return classicSteps.concat(extraSteps).slice(countToSkip, countToSkip + countToGet)

	function getExtraFieldStructure(type) {
		return {
			$addFields: {
				"type": type,
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
		}
	}
}

module.exports = {
	// getReportByIdFromDb,
	getAllReportsFromDb,
	reportsFiltersQuery,
	getAllSteps
}

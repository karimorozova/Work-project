const { Projects, InvoicingReceivables } = require("../models")
const moment = require('moment')
const { ObjectID: ObjectId } = require('mongodb')


const reportsFiltersQuery = ({ reportId, clients, to, from, status }) => {
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
	if (!to) to = moment().add(2, 'years').format('YYYY-MM-DD')
	if (!from) from = '1970-01-01'

	q['firstPaymentDate'] = { $gte: new Date(`${ from }T00:00:00.000Z`) }
	q['lastPaymentDate'] = { $lt: new Date(`${ to }T24:00:00.000Z`) }

	return q
}


const getReportByIdFromDb = async (id) => {
	const queryResult = await InvoicingReceivables.aggregate([
		{ $match: { "_id": ObjectId(id) } },
		{
			$lookup: {
				from: "projects",
				let: { 'steps': '$stepsAndProjects.step' },
				pipeline: [
					{ "$unwind": "$steps" },
					{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
					{ "$addFields": { "steps.projectNativeId": '$_id' } },
					{ "$addFields": { "steps.projectId": '$projectId' } },
					{ "$addFields": { "steps.projectName": '$projectName' } },
					{ "$addFields": { "steps.projectCurrency": '$projectCurrency' } },
					{ "$addFields": { "steps.paymentAdditions": '$additionsSteps' } },
					{ "$addFields": { "steps.minimumCharge": '$minimumCharge' } },
					{ '$replaceRoot': { newRoot: '$steps' } }
				],
				as: "stepsWithProject"
			}
		},
		{
			$addFields: {
				total: { $sum: "$stepsWithProject.finance.Price.receivables" }
			}
		}
	])

	return await InvoicingReceivables.populate(queryResult, [
				{ path: 'client', select: [ 'name', 'billingInfo' ] }
			]
	)
}

const getReportById = async (id) => {
	const report = await getReportByIdFromDb(id)
	const { result, sumPaymentAdditions,  uniquePaymentAdditions} = getReceivableTotal(report[0])
	report[0].total = result + sumPaymentAdditions
	return report
}

const getAllReports = async (countToSkip, countToGet, query) => {
	const reports = await getAllReportsFromDb(countToSkip, countToGet, query)
	for (const report of reports) {
		const { result, sumPaymentAdditions} = getReceivableTotal(report)
		report.total = result + sumPaymentAdditions
	}
	return reports
}


const getReceivableTotal = (report) => {
	const uniquePaymentAdditions = getUniquePaymentAdditions(report)
	const test = getProjectMinimumChargeAndSumReceivables(report)
	const result =  Object.values(test).reduce((acc, {receivables, minimumCharge}) => acc += minimumCharge > receivables ? minimumCharge : receivables  , 0)
	return { result, sumPaymentAdditions:  uniquePaymentAdditions.reduce((acc, {finance}) => acc += finance.Price.receivables, 0),  uniquePaymentAdditions}
}

const getUniquePaymentAdditions = (report) => {
	let uniquePaymentAdditions = []
	let countedProjectIds = []
	if(!report) return []
	for (const { projectNativeId, projectId ,paymentAdditions = [] } of report.stepsWithProject) {

		if (!countedProjectIds.includes(projectNativeId.toString())) {
			const paymentAdditionsWithProjId = paymentAdditions.map(item => {
				item.projectId = projectId
				return item
			})
			uniquePaymentAdditions.push(...paymentAdditions)
			countedProjectIds.push(projectNativeId.toString())
		}
	}
	return uniquePaymentAdditions
}

const getProjectMinimumChargeAndSumReceivables = (report) => {
	let groupedReports = {}
	if(!report) return {}
 	for (const { projectNativeId, finance, minimumCharge = {toIgnore: true} } of report.stepsWithProject) {
		if (Boolean(groupedReports[projectNativeId])) {
			groupedReports[projectNativeId].receivables += finance.Price.receivables
		} else {
			groupedReports[projectNativeId] = { receivables: finance.Price.receivables, minimumCharge: !minimumCharge.toIgnore ? minimumCharge.value : 0 }
		}
	}
	return groupedReports
}

const getAllReportsFromDb = async (countToSkip, countToGet, query) => {
	const queryResult = await InvoicingReceivables.aggregate([
		{
			$lookup: {
				from: "projects",
				let: { 'steps': '$stepsAndProjects.step' },
				pipeline: [
					{ "$unwind": "$steps" },
					{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
					{ "$addFields": { "steps.projectNativeId": '$_id' } },
					{ "$addFields": { "steps.projectName": '$projectName' } },
					{ "$addFields": { "steps.paymentAdditions": '$paymentAdditions' } },
					{ "$addFields": { "steps.minimumCharge": '$minimumCharge' } },
					{ '$replaceRoot': { newRoot: '$steps' } }
				],
				as: "stepsWithProject"
			}
		},
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
	const {status, ...stepsQuery} = queryForStep
	const queryPipeline = [
		{
			$match: {
				clientBillingInfo: { $exists: true, $ne: null },
				status
			}
		},
		{
			$lookup:
					{
						from: "clients",
						localField: "customer",
						foreignField: "_id",
						as: "customer"
					}
		},
		{
			$project: {
				'steps': 1,
				"projectId": 1,
				'projectName': 1,
				'deadline': 1,
				'startDate': 1,
				'billingDate': 1,
				'projectCurrency': 1,
				// 'paymentProfile': 1,
				'clientBillingInfo': 1,
				'customer': { $arrayElemAt: [ "$customer", 0 ] },
			}
		},
		{$addFields: {
				"selectedBillingInfo": {
					$arrayElemAt: [
						{$filter: {
							input: "$customer.billingInfo",
							cond: { $eq: ["$$this._id",  "$clientBillingInfo"]}
						}},
							0
					]
				}
			}
		},
		{ $unwind: "$steps" },
		{ $match: {
				$or: [ { "steps.isInReportReceivables": false }, { "steps.isInReportReceivables": { $exists: false } } ],
				...stepsQuery
			}
		},
		{
			$unset: [
				'customer.rates',
				'customer.services'
			]
		},
		{ $skip: countToSkip }
	]
	if (countToGet > 0) {
		queryPipeline.push({ $limit: countToGet })
	}
	return (await Projects.aggregate(queryPipeline))
}

module.exports = {
	getReportById,
	reportsFiltersQuery,
	getAllSteps,
	getAllReports,
	getReceivableTotal,
}

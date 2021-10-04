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


const getReportById = async (id) => {
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
					{ "$addFields": { "steps.projectName": '$projectName' } },
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

const getAllReports = async (countToSkip, countToGet, query) => {
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
	const queryPipeline = [
		{ $unwind: "$steps" },
		{
			$match: {
				clientBillingInfo: { $exists: true, $ne: null },
				$or: [ { "steps.isInReportReceivables": false }, { "steps.isInReportReceivables": { $exists: false } } ],
				...queryForStep
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
				'paymentProfile': 1,
				'clientBillingInfo': 1,
				'customer': { $arrayElemAt: [ "$customer", 0 ] }
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
	getAllReports
}

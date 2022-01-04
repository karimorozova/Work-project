const { ObjectID: ObjectId } = require("mongodb")
const moment = require("moment")
const { InvoicingPayables, Projects } = require("../models")


const getPayablesDateRange = (steps) => {
	return steps.reduce((acc, { billingDate }) => {
		acc.firstPaymentDate = moment.min(moment(billingDate.toString()), moment(acc.firstPaymentDate)).toISOString()
		acc.lastPaymentDate = moment.max(moment(billingDate.toString()), moment(acc.lastPaymentDate)).toISOString()
		return acc
	}, { firstPaymentDate: moment().add(20, 'years').toISOString(), lastPaymentDate: moment().subtract(20, 'years') })
}

const stepsFiltersQuery = ({ vendors, clients, sourceLanguages, targetLanguages, billingDateTo, billingDateFrom, step }, allLanguages) => {
	const q = {}
	if (vendors) {
		q["steps.vendor"] = { $in: vendors.split(',').map(item => ObjectId(item)) }
	}
	if (clients) {
		q["customer"] = { $in: clients.split(',').map(item => ObjectId(item)) }
	}
	if (sourceLanguages) {
		q["steps.sourceLanguage"] = { $in: sourceLanguages.split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	}
	if (targetLanguages) {
		q["steps.targetLanguage"] = { $in: targetLanguages.split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	}
	if (step) {
		q["steps.stepAndUnit.step.title"] = step
	}
	if (!!billingDateTo && !!billingDateFrom) {
		q["billingDate"] = { $gte: new Date(+billingDateFrom), $lt: new Date(+billingDateTo) }
	}

	return q
}

const payablesFiltersQuery = ({ reportId, vendors, to, from, status }) => {
	const q = {}
	const reg = /[.*+?^${}()|[\]\\]/g

	if (reportId) {
		const f = reportId.replace(reg, '\\$&')
		q['reportId'] = { "$regex": new RegExp(f, 'i') }
	}
	if (vendors) {
		q["vendor"] = { $in: vendors.split(',').map(item => ObjectId(item)) }
	}
	if (status) {
		q["status"] = status
	}

	if (!to) to = moment().add(1, 'days').format('YYYY-MM-DD')
	if (!from) from = '1970-01-01'

	q['firstPaymentDate'] = { $gte: new Date(`${ from }T00:00:00.000Z`) }
	q['lastPaymentDate'] = { $lt: new Date(`${ to }T24:00:00.000Z`) }

	return q
}


const getAllPayables = async (countToSkip, countToGet, query) => {
	const invoicingReprots = await InvoicingPayables.aggregate([
				{
					$lookup: {
						from: "projects",
						let: { 'steps': '$steps' },
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.nativeFinance.Price.projectName": '$projectName' } },
							{ '$replaceRoot': { newRoot: '$steps.nativeFinance.Price' } }
						],
						as: "stepFinance"
					}
				},
				{ $match: { ...query } },
				{ $sort: { reportId: -1 } },
				{ $skip: countToSkip },
				{ $limit: countToGet }
			]
	)
	return (await InvoicingPayables.populate(invoicingReprots, { path: 'vendor', select: [ 'firstName', 'surname' ] }))
}

const getPayable = async (id) => {
	const invoicingReports = await InvoicingPayables.aggregate([
				{ $match: { "_id": ObjectId(id) } },
				{
					$lookup: {
						from: "projects",
						let: { 'steps': '$steps', 'steps2': '$billingDate' },
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.projectNativeId": '$_id' } },
							{ "$addFields": { "steps.projectName": '$projectName' } },
							{ "$addFields": { " steps.billingDate": '$billingDate' } },
							{ '$replaceRoot': { newRoot: '$steps' } }
						],
						as: "steps"
					}
				}
			]
	)
	return (await InvoicingPayables.populate(invoicingReports, { path: 'vendor', select: [ 'firstName', 'surname', 'billingInfo' ] }))
}

const getPayableByVendorId = async (id) => {
	return await InvoicingPayables.aggregate([
				{ $match: { "vendor": ObjectId(id), "status": { $ne: 'Created' } } },
				{
					$lookup: {
						from: "projects",
						let: { 'steps': '$steps', 'steps2': '$billingDate' },
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.billingDate": '$billingDate' } },
							{ '$replaceRoot': { newRoot: '$steps' } }
						],
						as: "steps"
					}
				},
				{
					$unset: [
						"steps.finance",
						"steps.nativeFinance.Price.receivables",
						"steps.refFiles",
						"steps.defaultStepPrice",
						"steps.clientRate",
						"steps.targetFile",
						"steps.vendor",
						"steps.service",
						"steps.memoqDocIds"
					]
				}
			]
	)
}

const getPayablesProjectsAndSteps = async (id) => {
	const invoicingReprots = await InvoicingPayables.aggregate([
		{ $match: { "_id": ObjectId(id) } },
		{
			$lookup: {
				from: "projects",
				let: { 'steps': '$steps' },
				pipeline: [
					{ "$unwind": "$steps" },
					{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } }
				],
				as: "steps"
			}
		} ]
	)
	return (await InvoicingPayables.populate(invoicingReprots, [ 'vendor' ]))
}

const getAllSteps = async (countToSkip, countToGet, queryForStep) => {
	const queryPipeline = [
		// { $match: { status: "Closed" } },
		{ $unwind: "$steps" },
		{
			$match: {
				$or: [ { "steps.isInReportPayables": false }, { "steps.isInReportPayables": { $exists: false } } ],
				'steps.status': { $in: [ 'Completed', 'Cancelled Halfway' ] },
				"steps.nativeFinance.Price.payables": { $gt: 0 },
				...queryForStep
			}
		},
		{
			$lookup:
					{
						from: "vendors",
						localField: "steps.vendor",
						foreignField: "_id",
						as: "steps.vendor"
					}
		},
		{
			$project: {
				'steps': 1,
				"testVendors": 1,
				"projectId": 1,
				'projectName': 1,
				'deadline': 1,
				'startDate': 1,
				'billingDate': 1,
				'currentVendor': { $arrayElemAt: [ "$steps.vendor", 0 ] }
			}
		},
		{ $sort: { deadline: 1 } },
		{ $unset: [ 'steps.vendor', 'currentVendor.rates' ] },
		{ $skip: countToSkip }
	]
	if (countToGet > 0) {
		queryPipeline.push({ $limit: countToGet })
	}
	return (await Projects.aggregate(queryPipeline))
}

module.exports = {
	getPayableByVendorId,
	stepsFiltersQuery,
	getAllPayables,
	getPayable,
	getAllSteps,
	payablesFiltersQuery,
	getPayablesDateRange,
	getPayablesProjectsAndSteps
}
const { ObjectID: ObjectId } = require("mongodb")
const moment = require("moment")
const { InvoicingPayables, Projects } = require("../models")


const getPayablesDateRange = (steps) => {
	return steps.reduce((acc, { deadline }) => {
		acc.firstPaymentDate = moment.min(moment(deadline.toString()), moment(acc.firstPaymentDate)).toISOString()
		acc.lastPaymentDate = moment.max(moment(deadline.toString()), moment(acc.lastPaymentDate)).toISOString()
		return acc
	}, { firstPaymentDate: moment().add(20, 'years').toISOString(), lastPaymentDate: moment().subtract(20, 'years') })
}

const stepsFiltersQuery = ({ vendors, clients, sourceLanguages, targetLanguages, deadlineDateTo, deadlineDateFrom, step }, allLanguages) => {
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
	if (!!deadlineDateTo && !!deadlineDateFrom) {
		q["deadline"] = { $gte: new Date(+deadlineDateFrom), $lt: new Date(+deadlineDateTo) }
	}

	return q
}

const payablesFiltersQuery = ({ reportId, vendors, deadlineDateTo, deadlineDateFrom, status }) => {
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

	if (!!deadlineDateTo && !!deadlineDateFrom) {
		q['firstPaymentDate'] = { $gte: new Date(+deadlineDateFrom) }
		q['lastPaymentDate'] = { $lt: new Date(+deadlineDateTo) }
	}

	return q
}

const getAllPayables = async (countToSkip, countToGet, query) => {
	const invoicingReports = await InvoicingPayables.aggregate([
				{
					$lookup: {
						from: "projects",
						let: { 'steps': '$steps' },
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.nativeFinance.Price.projectName": '$projectName' } },
							{ "$addFields": { "steps.deadline": '$deadline' } },
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
	return (await InvoicingPayables.populate(invoicingReports, { path: 'vendor', select: [ 'firstName', 'surname', 'email' ] }))
}

const getPayable = async (id) => {
	const invoicingReports = await InvoicingPayables.aggregate([
				{ $match: { "_id": ObjectId(id) } },
				{
					$lookup: {
						from: "projects",
						let: {
							'steps': '$steps'
						},
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.projectNativeId": '$_id' } },
							{ "$addFields": { "steps.projectName": '$projectName' } },
							{ "$addFields": { "steps.deadline": '$deadline' } },
							{ '$replaceRoot': { newRoot: '$steps' } }
						],
						as: "steps"
					}
				},
				{
					$addFields: {
						totalPrice: { $sum: "$steps.nativeFinance.Price.payables" },
						paidAmount: { $sum: "$paymentInformation.paidAmount" }
					}
				},
				{
					$addFields: {
						unpaidAmount: { $subtract: [ "$totalPrice", "$paidAmount" ] }
					}
				}
			]
	)
	return (await InvoicingPayables.populate(invoicingReports, { path: 'vendor', select: [ 'firstName', 'surname', 'billingInfo', 'photo', 'email' ] }))
}

const getAllPayableByDefaultQuery = async (query = {}) => {
	const invoicingReports = await InvoicingPayables.aggregate([
				{ $match: query },
				{
					$lookup: {
						from: "projects",
						let: {
							'steps': '$steps'
						},
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.projectNativeId": '$_id' } },
							{ "$addFields": { "steps.projectName": '$projectName' } },
							{ "$addFields": { "steps.deadline": '$deadline' } },
							{ '$replaceRoot': { newRoot: '$steps' } }
						],
						as: "steps"
					}
				},
				{
					$addFields: {
						totalPrice: { $sum: "$steps.nativeFinance.Price.payables" },
						paidAmount: { $sum: "$paymentInformation.paidAmount" }
					}
				},
				{
					$addFields: {
						unpaidAmount: { $subtract: [ "$totalPrice", "$paidAmount" ] }
					}
				}
			]
	)
	return (await InvoicingPayables.populate(invoicingReports, { path: 'vendor', select: [ 'firstName', 'surname', 'billingInfo', 'photo', 'email' ] }))
}


const getPayableByVendorId = async (id) => {
	return (await InvoicingPayables.aggregate([
				{ $match: { "vendor": ObjectId(id), "status": { $ne: 'Created' } } },
				{
					$lookup: {
						from: "projects",
						let: {
							'steps': '$steps'
						},
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.deadline": '$deadline' } },
							{ '$replaceRoot': { newRoot: '$steps' } }
						],
						as: "steps"
					}
				},
				{
					$addFields: {
						totalPrice: { $sum: "$steps.nativeFinance.Price.payables" }
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
	))
}

const getPayablesProjectsAndSteps = async (id) => {
	const invoicingReports = await InvoicingPayables.aggregate([
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
	return (await InvoicingPayables.populate(invoicingReports, [ 'vendor' ]))
}

const getAllSteps = async (countToSkip, countToGet, queryForStep) => {
	const queryPipeline = [
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
				"projectId": 1,
				'projectName': 1,
				'deadline': 1,
				'startDate': 1,
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
	getAllPayableByDefaultQuery,
	getAllSteps,
	payablesFiltersQuery,
	getPayablesDateRange,
	getPayablesProjectsAndSteps
}
const { ObjectID: ObjectId } = require("mongodb")
const moment = require("moment")
const { InvoicingReports, Projects } = require("../models")


const getReportsDateRange = (steps) => {
	return steps.reduce((acc, { billingDate }) => {
		acc.firstPaymentDate = moment.min(moment(billingDate.toString()), moment(acc.firstPaymentDate)).toISOString()
		acc.lastPaymentDate = moment.max(moment(billingDate.toString()), moment(acc.lastPaymentDate)).toISOString()
		return acc
	}, {firstPaymentDate: moment().add(20, 'years').toISOString(), lastPaymentDate: moment().subtract(20,'years')})
}

const stepsFiltersQuery = ({ vendors, sourceLanguages, targetLanguages, to, from, step }, allLanguages) => {
	const q = {}
	if (vendors) {
		q["steps.vendor"] = { $in: vendors.split(',').map(item => ObjectId(item)) }
	}
	if (sourceLanguages) {
		q["steps.sourceLanguage"] = { $in: sourceLanguages.split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	}
	if (targetLanguages) {
		q["steps.targetLanguage"] = { $in: targetLanguages.split(',').map(item => allLanguages.find(({ _id }) => _id.toString() === item.toString()).symbol) }
	}
	if(step){
		q["steps.serviceStep.title"] = step
	}
	if(!to) to = moment().add( 1, 'days').format('YYYY-MM-DD');
	if(!from) from = '1970-01-01'

	q["billingDate"] = { $gte: new Date(`${ from }T00:00:00.000Z`), $lt: new Date(`${ to }T24:00:00.000Z`) }

	return q
}

const reportsFiltersQuery = ({reportId,  vendors, to, from, status }) => {
	const q = {}
	const reg = /[.*+?^${}()|[\]\\]/g

	if(reportId){
		const f = reportId.replace(reg, '\\$&')
		q['reportId'] = { "$regex": new RegExp(f, 'i') }
	}
	if (vendors) {
		q["vendor"] = { $in: vendors.split(',').map(item => ObjectId(item)) }
	}
	if(status) {
		q["status"] = status
	}

	if(!to) to = moment().add( 1, 'days').format('YYYY-MM-DD');
	if(!from) from = '1970-01-01'

	q['firstPaymentDate'] = {  $gte: new Date(`${ from }T00:00:00.000Z`) }
	q['lastPaymentDate'] = { $lt: new Date(`${ to }T24:00:00.000Z`) }

	return q
}


const getAllReports = async (countToSkip, countToGet, query) => {
	const invoicingReprots = await InvoicingReports.aggregate([
				{
					$lookup: {
						from: "projects",
						let: { 'steps': '$steps' },
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ '$replaceRoot': { newRoot: '$steps.nativeFinance.Price' } }
						],
						as: "stepFinance"
					}
				},
				{ $match: {...query} },
				{ $sort : { reportId : -1 }},
				{ $skip: countToSkip },
				{ $limit: countToGet}
			]
	)
	return (await InvoicingReports.populate(invoicingReprots, { path: 'vendor', select: [ 'firstName', 'surname' ] }))
}

const getReport = async (id) => {
	const invoicingReprots = await InvoicingReports.aggregate([
		{ $match: {"_id": ObjectId(id)}},
		{
			$lookup: {
				from: "projects",
				let: { 'steps': '$steps' },
				pipeline: [
					{ "$unwind": "$steps" },
					{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
					{ '$replaceRoot': { newRoot: '$steps' } }
				],
				as: "steps"
			}
		}]
	)
	return (await InvoicingReports.populate(invoicingReprots, ['vendor']))
}

const getReportProjectsAndSteps = async (id) => {
	const invoicingReprots = await InvoicingReports.aggregate([
		{ $match: {"_id": ObjectId(id)}},
		{
			$lookup: {
				from: "projects",
				let: { 'steps': '$steps' },
				pipeline: [
					{ "$unwind": "$steps" },
					{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
				],
				as: "steps"
			}
		}]
	)
	return (await InvoicingReports.populate(invoicingReprots, ['vendor']))
}

const getAllSteps = async (countToSkip, countToGet, queryForStep) => {
	const queryPipeline =  [
		{ $match: { status: "Closed" } },
		{ $unwind: "$steps" },
		{ $match: { $or: [ { "steps.isInReports": false }, { "steps.isInReports": { $exists: false } } ], "steps.status": "Completed", ...queryForStep } },
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
		{ $unset: 'steps.vendor' },
		{ $skip: countToSkip },
	]
	if (countToGet > 0) {
		queryPipeline.push( { $limit: countToGet} )
	}
	return (await Projects.aggregate(queryPipeline))
}

module.exports = {stepsFiltersQuery, getAllReports, getReport, getAllSteps,reportsFiltersQuery, getReportsDateRange, getReportProjectsAndSteps}
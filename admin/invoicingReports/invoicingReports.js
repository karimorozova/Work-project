const { Projects, InvoicingReports } = require("../models")
const { INVOICING_STATUSES } = require("./enum")
const moment = require("moment")
const ObjectId = require('mongodb').ObjectID


const getAllReports = async () => {
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
			}]
	)
	return (await InvoicingReports.populate(invoicingReprots, ['vendor']))
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

const reportDeleteStep = async (reportId, stepId) => {
	try {

		const invoicingReprots = await InvoicingReports.updateOne({_id: reportId },
				{$pull: {'steps': stepId} })

		await Projects.updateOne(
		{ 'steps._id': stepId  },
	{ 'steps.$[i].isInReports': false },
	{ arrayFilters: [ { 'i._id': stepId } ] })

	} catch (e) {
		
	}
}

const reportAddSteps = async (reportId, stepsId) => {
	await InvoicingReports.updateOne({_id: reportId },
			{$push: {'steps': {$each: stepsId}} })

	await Projects.updateMany(
			{ 'steps._id': { $in: stepsId } },
			{ 'steps.$[i].isInReports': true },
			{ arrayFilters: [ { 'i._id': { $in: stepsId } } ] })
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

const addStepsToRequest = async (projects, createdBy) => {
	let groupedProjectsByVendor = {}

	const lastIndex = await InvoicingReports.findOne().sort({ 'reportId': -1 })
	let lastIntIndex = lastIndex != null ? parseInt(lastIndex.reportId.split('_').pop()) : 0
	let allSteps = []
	for (const project of projects) {
		const projectVendorId = project.currentVendor._id
		allSteps.push(project.steps._id)
		if (groupedProjectsByVendor.hasOwnProperty(projectVendorId)) {
			const currentProject = groupedProjectsByVendor[projectVendorId]
			currentProject.steps.push(project.steps._id)
			currentProject.firstPaymentDate = moment.min(moment(currentProject.firstPaymentDate), moment(project.billingDate)).toISOString()
			currentProject.lastPaymentDate = moment.max(moment(currentProject.firstPaymentDate), moment(project.billingDate)).toISOString()
		} else {
			groupedProjectsByVendor[projectVendorId] = {
				reportId: 'RPT_' + (++lastIntIndex + '').padStart(6, "0"),
				vendor: projectVendorId,
				status: INVOICING_STATUSES.CREATED,
				steps: [ project.steps._id ],
				firstPaymentDate: project.billingDate,
				lastPaymentDate: project.billingDate,
				file: {},
				createdBy: createdBy,
				updatedBy: createdBy,
				createdAt: moment().toISOString(),
				updatedAt: moment().toISOString()
			}
		}
	}


	for await (const report of Object.values(groupedProjectsByVendor)) {
		await InvoicingReports.create(report)
		await Projects.updateMany(
				{ 'steps._id': { $in: allSteps } },
				{ 'steps.$[i].isInReports': true },
				{ arrayFilters: [ { 'i._id': { $in: allSteps } } ] })
	}

}


module.exports = { getAllReports, getReport, reportAddSteps, reportDeleteStep, getAllSteps, addStepsToRequest }

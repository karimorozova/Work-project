const { ObjectID: ObjectId } = require("mongodb")
const { InvoicingReports, InvoicingReportsArchive } = require("../models")


const getAllPaidReports = async (countToSkip, countToGet, query) => {
	const invoicingReprots = await InvoicingReportsArchive.aggregate([
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

const getPaidReport = async (id) => {
	const invoicingReports = await InvoicingReportsArchive.aggregate([
		{ $match: {"_id": ObjectId(id)}},
		{
			$lookup: {
				from: "projects",
				let: { 'steps': '$steps', 'steps2': '$billingDate' },
				pipeline: [
					{ "$unwind": "$steps" },
					{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
					{ "$addFields": {"steps.billingDate": '$billingDate'}},
					{ '$replaceRoot': { newRoot: '$steps' } },
				],
				as: "steps"
			}
		}
		]
	)
	return (await InvoicingReportsArchive.populate(invoicingReports, { path: 'vendor', select: [ 'firstName', 'surname' ] } ))
}

const getReportPaidByVendorId = async (id) => {
	return await InvoicingReportsArchive.aggregate([
				{ $match: { "vendor": ObjectId(id)},},
				{
					$lookup: {
						from: "projects",
						let: { 'steps': '$steps', 'steps2': '$billingDate' },
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": {"steps.billingDate": '$billingDate'}},
							{ '$replaceRoot': { newRoot: '$steps' } },
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
						"steps.memoqDocIds",
					]
				}
			]
	)
}

module.exports = {
	getAllPaidReports,
	getPaidReport,
	getReportPaidByVendorId,

}
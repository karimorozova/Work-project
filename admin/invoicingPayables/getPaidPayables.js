const { ObjectID: ObjectId } = require("mongodb")
const { InvoicingPayables, InvoicingPayablesArchive } = require("../models")

const getPaidShortReportList = async () => {
	const reports = await InvoicingPayablesArchive.aggregate([
		{
			$project: {
				_id: 1,
				reportId: 1,
				vendor: 1,
				status: 1,
				total: 1
			}
		},
		{
			$sort: { _id: -1 }
		}
	])
	return InvoicingPayablesArchive.populate(reports, [
		{ path: 'vendor', select: [ 'firstName', 'surname' ] }
	])
}

const getAllPaidPayables = async (countToSkip, countToGet, query) => {
	const invoicingReports = await InvoicingPayablesArchive.aggregate([
				{ $match: { ...query } },
				// {
				// 	$lookup: {
				// 		from: "projects",
				// 		let: { 'steps': '$steps' },
				// 		pipeline: [
				// 			// { $match: { isTest: false, "steps.nativeFinance.Price": { $gt: 0 } } },
				// 			{ "$unwind": "$steps" },
				// 			{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
				// 			{ "$addFields": { "steps.nativeFinance.Price.projectNativeId": '$_id' } },
				// 			{ '$replaceRoot': { newRoot: '$steps.nativeFinance.Price' } }
				// 		],
				// 		as: "stepFinance"
				// 	}
				// },
				{
					$lookup: {
						from: "vendors",
						let: {
							'paymentMethod': '$paymentDetails.paymentMethod'
						},
						pipeline: [
							{ "$unwind": "$billingInfo.paymentMethods" },
							{ "$match": { "$expr": { "$eq": [ "$billingInfo.paymentMethods._id", "$$paymentMethod" ] } } },
							{ '$replaceRoot': { newRoot: '$billingInfo.paymentMethods' } }
						],
						as: "paymentDetails.paymentMethod"
					}
				},
				{
					$addFields: {
						"paymentDetails.paymentMethod": { $arrayElemAt: [ '$paymentDetails.paymentMethod', 0 ] }
					}
				},
				{ $sort: { reportId: -1 } },
				{ $skip: countToSkip },
				{ $limit: countToGet }
			]
	)
	return (await InvoicingPayables.populate(invoicingReports, { path: 'vendor', select: [ 'firstName', 'surname', 'billingInfo', 'photo', 'email' ] }))
}

const getPaidReport = async (id) => {
	const invoicingReports = await InvoicingPayablesArchive.aggregate([
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
					$lookup: {
						from: "vendors",
						let: {
							'paymentMethod': '$paymentDetails.paymentMethod'
						},
						pipeline: [
							{ "$unwind": "$billingInfo.paymentMethods" },
							{ "$match": { "$expr": { "$eq": [ "$billingInfo.paymentMethods._id", "$$paymentMethod" ] } } },
							{ '$replaceRoot': { newRoot: '$billingInfo.paymentMethods' } }
						],
						as: "paymentDetails.paymentMethod"
					}
				},
				{
					$addFields: {
						"paymentDetails.paymentMethod": { $arrayElemAt: [ '$paymentDetails.paymentMethod', 0 ] }
					}
				}
			]
	)
	return (await InvoicingPayablesArchive.populate(invoicingReports, { path: 'vendor', select: [ 'firstName', 'surname', 'billingInfo', 'photo', 'email' ] }))
}

const getReportPaidByVendorId = async (id, reportQuery = {}) => {
	if ('steps' in reportQuery) reportQuery.steps = ObjectId(reportQuery.steps)

	return InvoicingPayablesArchive.aggregate([
				{
					$match: {
						"vendor": ObjectId(id),
						...reportQuery
					}
				},
				{
					$lookup: {
						from: "projects",
						let: {
							'steps': '$steps'
						},
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.projectName": '$projectName' } },
							{ "$addFields": { "steps.deadline": '$deadline' } },
							{ '$replaceRoot': { newRoot: '$steps' } }
						],
						as: "steps"
					}
				},
				{
					$lookup: {
						from: "vendors",
						let: {
							'paymentMethod': '$paymentDetails.paymentMethod'
						},
						pipeline: [
							{ "$unwind": "$billingInfo.paymentMethods" },
							{ "$match": { "$expr": { "$eq": [ "$billingInfo.paymentMethods._id", "$$paymentMethod" ] } } },
							{ '$replaceRoot': { newRoot: '$billingInfo.paymentMethods' } }
						],
						as: "paymentDetails.paymentMethod"
					}
				},
				{
					$addFields: {
						"paymentDetails.paymentMethod": { $arrayElemAt: [ '$paymentDetails.paymentMethod', 0 ] }
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

module.exports = {
	getPaidShortReportList,
	getAllPaidPayables,
	getPaidReport,
	getReportPaidByVendorId
}
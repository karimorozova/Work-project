const { invoicingReceivablesArchive } = require("../models")
const { ObjectID: ObjectId } = require("mongodb")

// const getAllPaidReceivables = async (countToSkip, countToGet, query) => {
// 	const invoicingReceivablesArchive = await invoicingReceivablesArchive.aggregate([
// 				{
// 					$lookup: {
// 						from: "projects",
// 						let: { 'steps': '$steps' },
// 						pipeline: [
// 							{ "$unwind": "$steps" },
// 							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
// 							{ "$addFields": { "steps.nativeFinance.Price.projectNativeId": '$_id' } },
// 							{ '$replaceRoot': { newRoot: '$steps.nativeFinance.Price' } }
// 						],
// 						as: "stepFinance"
// 					}
// 				},
// 				{ $match: {...query} },
// 				{ $sort : { reportId : -1 }},
// 				{ $skip: countToSkip },
// 				{ $limit: countToGet}
// 			]
// 	)
// 	return (await invoicingReceivablesArchive.populate(invoicingReceivablesArchive, { path: 'vendor', select: [ 'firstName', 'surname' ] }))
// }
//

const getAllPaidReceivables = async (countToSkip, countToGet, query) => {
	const queryResult = await invoicingReceivablesArchive.aggregate([
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

	return await invoicingReceivablesArchive.populate(queryResult, [
				{ path: 'client', select: [ 'name', 'billingInfo' ] }
			]
	)
}

const getPaidReceivables = async (id) => {
	const invoicingReceivables = await invoicingReceivablesArchive.aggregate([
				{ $match: {"_id": ObjectId(id)}},
				{
					$lookup: {
						from: "projects",
						let: { 'steps': '$stepsAndProjects.step' },
						pipeline: [
							{ "$unwind": "$steps" },
							{ "$match": { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
							{ "$addFields": { "steps.projectNativeId": '$_id' } },
							{ "$addFields": { "steps.projectName": '$projectName' } },
							{ "$addFields": {"steps.billingDate": '$billingDate'}},
							{ '$replaceRoot': { newRoot: '$steps' } },
						],
						as: "steps"
					}
				}
			]
	)
	return (await invoicingReceivablesArchive.populate(invoicingReceivables, { path: 'client'} ))
}

module.exports = {getAllPaidReceivables, getPaidReceivables}
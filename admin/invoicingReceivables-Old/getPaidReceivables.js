const { invoicingReceivablesArchive, InvoicingReceivables } = require("../models")
const { ObjectID: ObjectId } = require("mongodb")
const { getReceivableTotal } = require("./getReceivables")

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
	const reports = await getAllPaidReceivablesFromDb(countToSkip, countToGet, query)

	for (const report of reports) {
		const { result, sumPaymentAdditions} = getReceivableTotal(report)
		report.total = result + sumPaymentAdditions
	}
	return reports
}


const getPaidReceivables = async (id) => {
	const report = await getPaidReceivablesFromDb(id)
	const { result, sumPaymentAdditions,  uniquePaymentAdditions} = getReceivableTotal(report[0])

	report[0].total = result + sumPaymentAdditions
	report[0].paymentAdditions = uniquePaymentAdditions
	report[0].sumPaymentAdditions = sumPaymentAdditions

	return report
}
const getAllPaidReceivablesFromDbWithProject = async (countToSkip, countToGet, query, projectFields,  unsetFields = []) => {
	const queryResult = await invoicingReceivablesArchive.aggregate([
		{ $match: { ...query } },
		{
			$lookup: {
				from: "projects",
				let: { 'steps': '$stepsAndProjects.step' },
				pipeline: [
					{ $unwind: "$steps" },
					{ $match: { "$expr": { "$in": [ "$steps._id", "$$steps" ] } } },
					{ $addFields: { "steps.type": 'Classic' } },
					...generateExtraFieldForSteps('steps'),
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
					{ $addFields: { "additionsSteps.type": 'Extra' } },
					...generateExtraFieldForSteps('additionsSteps'),
					{ $replaceRoot: { newRoot: '$additionsSteps' } }
				],
				as: "stepsExtra"
			}
		},
		{ $addFields: { "stepsWithProject": { $concatArrays: [ '$stepsClassic', '$stepsExtra' ] } } },
		{ $addFields: { "total": { $sum: '$stepsWithProject.finance.Price.receivables' } } },
		{ $unset: [ 'stepsClassic', 'stepsExtra', ...unsetFields] },
		...(!!projectFields ? [{$project:  projectFields}] : []),
		{ $sort: { reportId: -1 } },
		{ $skip: countToSkip },
		{ $limit: countToGet }
	])

	return await invoicingReceivablesArchive.populate(queryResult, [
				{ path: 'client', select: [ 'name', 'billingInfo', 'currency' ] }
			]
	)

	function generateExtraFieldForSteps(key) {
		return [
			{ "$addFields": { [`${ key }` + ".projectNativeId"]: '$_id' } },
			{ "$addFields": { [`${ key }` + ".projectName"]: '$projectName' } },
			{ "$addFields": { [`${ key }` + ".projectCurrency"]: '$projectCurrency' } },
			{ "$addFields": { [`${ key }` + ".start"]: '$startDate' } },
			{ "$addFields": { [`${ key }` + ".deadline"]: '$deadline' } }
		]
	}
}



const getAllPaidReceivablesFromDb = async (countToSkip, countToGet, query) => {
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
					{ "$addFields": { "steps.projectId": '$projectId' } },
					{ "$addFields": { "steps.projectCurrency": '$projectCurrency' } },
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

	return await invoicingReceivablesArchive.populate(queryResult, [
				{ path: 'client', select: [ 'name', 'billingInfo' ] }
			]
	)
}

const getPaidReceivablesFromDb = async (id) => {
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
							{ "$addFields": { "steps.projectId": '$projectId' } },
							{ "$addFields": { "steps.projectName": '$projectName' } },
							{ "$addFields": {"steps.billingDate": '$billingDate'}},
							{ "$addFields": { "steps.projectCurrency": '$projectCurrency' } },
							{ "$addFields": { "steps.paymentAdditions": '$paymentAdditions' } },
							{ "$addFields": { "steps.minimumCharge": '$minimumCharge' } },
							{ '$replaceRoot': { newRoot: '$steps' } },
						],
						as: "stepsWithProject"
					}
				}
			]
	)
	return (await invoicingReceivablesArchive.populate(invoicingReceivables, { path: 'client'} ))
}

module.exports = {getAllPaidReceivables, getPaidReceivables , getAllPaidReceivablesFromDbWithProject}
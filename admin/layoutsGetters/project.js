const { Projects } = require("../models")

const defaultOptions = {
	hasSkip: true,
	hasLimit: true,
	hasSort: true
}

const defaultProject = {
	projectId: 1,
	projectName: 1,
	status: 1,
	customer: 1,
	industry: 1,
	projectManager: 1,
	accountManager: 1,
	requestId: 1,
	isTest: 1,
	isUrgent: 1,
	additionsSteps: 1,
	finance: 1,
	projectCurrency: 1,

	"steps.vendor": 1,
	"steps.status": 1,
	"steps.step": 1,

	"tasks.status": 1,
	"tasks.fullSourceLanguage": 1,
	"tasks.fullTargetLanguage": 1,
	"tasks.service": 1
}

module.exports = getLayoutProjects = async ({ query = {}, sort = { _id: -1 }, options = {}, project = {}, countToSkip = 0, countToGet = 50 }) => {

	options = {
		...defaultOptions,
		...options
	}

	const data = await Projects.aggregate([
		{
			$match: query
		},
		{
			$project: {
				...(Object.keys(project).length ? project : defaultProject)
			}
		},
		...(
				!!options.hasSort ? [ { $sort: sort } ] : []
		),

		...(
				!!options.hasSkip ? [ { $skip: countToSkip } ] : []
		),
		...(
				!!options.hasLimit ? [ { $limit: countToGet } ] : []
		)
	])

	return Projects.populate(data, [
		'industry',
		{ path: 'customer', select: [ 'name' ] },
		{ path: 'projectManager', select: [ 'firstName', 'lastName', 'photo' ] },
		{ path: 'accountManager', select: [ 'firstName', 'lastName', 'photo' ] },
		{ path: 'steps.vendor', select: [ 'firstName', 'surname', 'photo' ] },
		{ path: 'steps.step', select: [ 'title' ] },
		{ path: 'tasks.fullSourceLanguage', select: [ 'lang', 'symbol' ] },
		{ path: 'tasks.fullTargetLanguage', select: [ 'lang', 'symbol' ] },
		{ path: 'tasks.service', select: [ 'title' ] },
		{ path: 'requestId', select: [ 'projectId' ] }
	])
}


// const getAllPayables = async (countToSkip, countToGet, query, sort = { reportId: -1 }) => {
// 	const invoicingReports = await InvoicingPayables.aggregate([
// 				{ $match: { ...query } },
// 				{
// 					$lookup: {
// 						from: "vendors",
// 						let: {
// 							'paymentMethod': '$paymentDetails.paymentMethod'
// 						},
// 						pipeline: [
// 							{ "$unwind": "$billingInfo.paymentMethods" },
// 							{ "$match": { "$expr": { "$eq": [ "$billingInfo.paymentMethods._id", "$$paymentMethod" ] } } },
// 							{ '$replaceRoot': { newRoot: '$billingInfo.paymentMethods' } }
// 						],
// 						as: "paymentDetails.paymentMethod"
// 					}
// 				},
// 				{
// 					$addFields: {
// 						"paymentDetails.paymentMethod": { $arrayElemAt: [ '$paymentDetails.paymentMethod', 0 ] }
// 					}
// 				},
// 				{ $sort: sort },
// 				{ $skip: countToSkip },
// 				{ $limit: countToGet }
// 			]
// 	)
// 	return (await InvoicingPayables.populate(invoicingReports, { path: 'vendor', select: [ 'firstName', 'surname', 'email' ] }))
// }
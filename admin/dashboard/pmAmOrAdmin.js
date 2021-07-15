const {Projects} = require('../models')

async function getProjectsForDashboard() {
	// const filters = {
	// 	deadline:
	// 			{
	// 				$gte: new Date(moment().set({ hour: 0, minute: 0, second: 0 }).toString()),
	// 				$lte: new Date(moment().set({ hour: 23, minute: 59, second: 59 }).toString())
	// 			},
	// }
	const STATUSES = ["Close", "Cancelled", "Cancelled Halfway"]
	const filters = {status: {$ne: {$in: STATUSES}}}
	return await getProjects(filters)
}

async function getProjects(filters) {
	const projects = await Projects.aggregate([
		{
			$lookup: {
				from: "clients",
				localField: "customer",
				foreignField: "_id",
				as: "customer"
			}
		},
		{
			$unset: [
				"customer.billingInfo",
				"customer.otherInfo",
				"customer.officialCompanyName",
				"customer.aliases",
				"customer.currency",
				"customer.minPrice",
				"customer.ignoreMinPrice",
				"customer.website",
				"customer.status",
				"customer.documents",
				"customer.leadSource",
				"customer.leadGeneration",
				"customer.salesStage",
				"customer.salesComission",
				"customer.isTest",
				"customer.sourceLanguages",
				"customer.industries",
				"customer.discounts",
				"customer.matrix",
				"customer.accountManager",
				"customer.salesManager",
				"customer.projectManager",
				"customer.nativeLanguage",
				"customer.timeZone",
				"customer.contacts",
				"customer.defaultPricelist",
				"customer.email",
				"customer.services",
				"customer.notes",
				"customer.rates",
				"customer.targetLanguages",
				"customer.country",

				"tasksDR2",
				"genBrief",
				"roi",
				"minimumCharge",
				"crossRate",
				"isUrgent",
				"clientContacts",
				"paymentProfile",
				"clientProjectNumber",
				"totalCost",
				"isMetricsExist",
				"isPriceUpdated",
				"isInLQAReports",
				"brief",
				"notes",
				"reason",
				"refFiles",
				"isClientOfferClicked",
				"isAutoDelivery",
				"isStartAccepted",
				"isInvoice",
				"template",
				"billingDate",
				"dateFormatted",
				"discounts",
				"tasksDR1",
				"tasksDeliverables",
			]
		},
		{
			$match: {
				...filters
			}
		},
		{ $unwind: "$customer" }
	])
	try {
		return Projects.populate(projects, [
			'industry',
			'service',
			{ path: 'projectManager', select: [ 'firstName', 'lastName', 'photo', 'email' ] },
			{ path: 'accountManager', select: [ 'firstName', 'lastName', 'photo', 'email' ] },
			{ path: 'steps.vendor', select: [ 'firstName', 'surname', 'email' ] }

		])
	} catch (err) {
		console.log(err)
		console.log("Error on getting filtered projects")
	}
}

module.exports = { getProjectsForDashboard }
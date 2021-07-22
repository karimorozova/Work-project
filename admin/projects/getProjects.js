const { Projects, Clients, Languages, Services } = require('../models/')
const { getFilterdProjectsQuery } = require('./filter')

async function getProjects(obj) {
	return await Projects.find(obj)
			.populate('industry')
			.populate('customer')
			.populate('service')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email' ])
}

async function getProject(obj) {
	const project = await Projects.findOne(obj)
			.populate('industry')
			.populate('service')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email' ])
	project.customer = await Clients.findOne({ _id: project.customer })
			.populate('sourceLanguages')
			.populate('targetLanguages')
	return project
}

async function updateProject(query, update) {
	return await Projects.findOneAndUpdate(query, update, { new: true })
			.populate('industry')
			.populate('customer')
			.populate('service')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email' ])
}

async function getProjectAfterUpdate(query, update) {
	return await Projects.findOneAndUpdate(query, update, { new: true })
			.populate('industry')
			.populate('customer')
			.populate('service')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email' ])
}

async function getFilteredProjects(filters) {
	const allLanguages = await Languages.find()
	const allServices = await Services.find()
	const query = getFilterdProjectsQuery(filters, allLanguages, allServices)

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
				"customer._id",
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
				"tasksDeliverables"
			]
		},
		{
			$match: {
				...query
			}
		},
		{ $unwind: "$customer" }
	]).sort({ startDate: -1 }).limit(25)
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

module.exports = { getProject, getProjects, updateProject, getFilteredProjects, getProjectAfterUpdate }

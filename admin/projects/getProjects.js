const { Projects, Clients, Languages, Services, ClientRequest } = require('../models/')
const { getFilterdProjectsQuery } = require('./filter')


async function getProjectsForVendorPortal(obj) {
	return await Projects.find(obj)
			.populate('industry')
			.populate('customer')
			.populate('service')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email', 'guid', 'photo' ])
			.populate('steps.step')
			.populate('steps.service')
			.populate('steps.receivablesUnit')
			.populate('steps.payablesUnit')
			.populate('steps.fullSourceLanguage')
			.populate('steps.fullTargetLanguage')
			.populate('tasks.service')
			.populate('tasks.fullSourceLanguage')
			.populate('tasks.fullTargetLanguage')
}

async function getProjects(obj) {
	return await Projects.find(obj)
			.populate('industry')
			.populate('customer')
			.populate('service')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email', 'guid', 'photo' ])
			.populate('steps.step')
			.populate('steps.service')
			.populate('steps.receivablesUnit')
			.populate('steps.payablesUnit')
			.populate('steps.fullSourceLanguage')
			.populate('steps.fullTargetLanguage')
			.populate('tasks.service')
			.populate('tasks.fullSourceLanguage')
			.populate('tasks.fullTargetLanguage')
			.populate('requestId', [ 'projectId' ])

}

async function getProjectsForPortal(obj) {
	return (await Projects.find(
			obj,
			{
				projectId: 1,
				projectName: 1,
				status: 1,
				clientContacts: 1,
				tasks: 1,
				steps: 1,
				startDate: 1,
				deadline: 1,
				finance: 1,
				createdBy: 1,
				tasksDeliverables: 1,
				tasksDR2: 1,
				projectCurrency: 1
			}
	)
			.populate('industry')
			.populate('service')
			.populate('steps.vendor', [ 'firstName', 'surname', 'email', 'guid', 'photo' ])
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ]))
}

async function getProjectsForPortalList(obj) {
	return (await Projects.find(obj, {
						projectId: 1,
						projectName: 1,
						status: 1,
						clientContacts: 1,
						"tasks.progress": 1,
						"steps.progress": 1,
						startDate: 1,
						deadline: 1,
						finance: 1,
						createdBy: 1
						// tasksDeliverables: 1,
						// tasksDR2: 1,
						// projectCurrency: 1
					}
			)
			// .populate('industry')
			// .populate('service')
			// .populate('steps.vendor', [ 'firstName', 'surname', 'email' ])
			// .populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			// .populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
	)
}

async function getProject(obj) {
	const project = await Projects.findOne(obj)
			.populate('industry')
			.populate('service')
			.populate('customer')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email', 'guid', 'photo' ])
			.populate('steps.step')
			.populate('steps.service')
			.populate('steps.receivablesUnit')
			.populate('steps.payablesUnit')
			.populate('steps.fullSourceLanguage')
			.populate('steps.fullTargetLanguage')
			.populate('tasks.service')
			.populate('tasks.fullSourceLanguage')
			.populate('tasks.fullTargetLanguage')
			.populate('requestId', [ 'projectId' ])

	project._doc.clientBillingInfo = !!project.clientBillingInfo
			? project.customer.billingInfo.find(({ _id }) => `${ project.clientBillingInfo }` === `${ _id }`)
			: null

	return project
}

async function updateProject(query, update) {
	const project = await Projects.findOneAndUpdate(query, update, { new: true })
			.populate('industry')
			.populate('customer')
			.populate('service')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email', 'guid', 'photo' ])
			.populate('steps.step')
			.populate('steps.service')
			.populate('steps.receivablesUnit')
			.populate('steps.payablesUnit')
			.populate('steps.fullSourceLanguage')
			.populate('steps.fullTargetLanguage')
			.populate('tasks.service')
			.populate('tasks.fullSourceLanguage')
			.populate('tasks.fullTargetLanguage')
			.populate('requestId', [ 'projectId' ])

	project._doc.clientBillingInfo = !!project.clientBillingInfo
			? project.customer.billingInfo.find(({ _id }) => `${ project.clientBillingInfo }` === `${ _id }`)
			: null

	return project
}

async function getProjectAfterUpdate(query, update) {
	const project = await Projects.findOneAndUpdate(query, update, { new: true })
			.populate('industry')
			.populate('customer')
			.populate('service')
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('steps.vendor', [ 'firstName', 'surname', 'email', 'guid', 'photo' ])
			.populate('steps.step')
			.populate('steps.service')
			.populate('steps.receivablesUnit')
			.populate('steps.payablesUnit')
			.populate('steps.fullSourceLanguage')
			.populate('steps.fullTargetLanguage')
			.populate('tasks.service')
			.populate('tasks.fullSourceLanguage')
			.populate('tasks.fullTargetLanguage')
			.populate('requestId', [ 'projectId' ])

	project._doc.clientBillingInfo = !!project.clientBillingInfo
			? project.customer.billingInfo.find(({ _id }) => `${ project.clientBillingInfo }` === `${ _id }`)
			: null

	return project
}

async function getFilteredProjects(filters) {
	const allLanguages = await Languages.find()
	const allServices = await Services.find()
	const allRequests = await ClientRequest.find()
	const query = getFilterdProjectsQuery(filters, allLanguages, allServices, allRequests)

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
				"minimumCharge",
				"crossRate",
				"clientContacts",
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
			{ path: 'steps.vendor', select: [ 'firstName', 'surname', 'email', 'guid', 'photo' ] },
			{ path: 'requestId', select: [ 'projectId' ] }
		])
	} catch (err) {
		console.log(err)
		console.log("Error on getting filtered projects")
	}
}

module.exports = { getProject, getProjects, getProjectsForPortal, updateProject, getFilteredProjects, getProjectAfterUpdate, getProjectsForVendorPortal, getProjectsForPortalList }

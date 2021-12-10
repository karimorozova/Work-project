const { Projects, Clients, Languages, Services, ClientRequest } = require('../models/')
const { getFilterdProjectsQuery, getFilteredPortalProjectsQuery } = require('./filter')
const { filterNotQuoteStepsInStartedProjectForClientPortal, filterQuoteStepsInStartedProjectForClientPortal } = require('./helpers')


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

async function getProjectsForPortalAll({ filters }) {
	const allLanguages = await Languages.find()
	const allServices = await Services.find()
	const query = getFilteredPortalProjectsQuery(filters, allLanguages, allServices)

	const projects = await Projects.find(
			{
				'isTest': 'false',
				'customer': filters.customer,
				...query
			}, {
				projectId: 1,
				projectName: 1,
				status: 1,
				startDate: 1,
				deadline: 1,
				createdBy: 1,
				accountManager: 1,
				additionsSteps: 1,
				projectCurrency: 1,
				minimumCharge: 1,
				"steps.taskId": 1,
				"steps.finance.Price.receivables": 1,
				"finance.Price.receivables": 1,
				"tasks.taskId": 1,
				"tasks.status": 1
			}
	)
			.sort({ startDate: -1 })
			.limit(25)
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])

	for (let i = 0; i < projects.length; i++) {
		projects[i].steps = filterNotQuoteStepsInStartedProjectForClientPortal(projects[i])
		projects[i].steps = projects[i].steps.filter(({ status }) => status !== 'Cancelled')
	}

	return projects
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
						"finance.Price.receivables": 1,
						createdBy: 1,
						accountManager: 1,
						minimumCharge: 1,
						additionsSteps: 1,
						projectCurrency: 1,
						"tasks.taskId": 1,
						"tasks.status": 1,
						"steps.taskId": 1,
						"steps.finance.Price.receivables": 1,
					}
			)
					.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
	)
}

async function getProjectForClientPortal(obj) {
	const project = await Projects.findOne(obj,
			{
				projectId: 1,
				projectName: 1,
				status: 1,
				"finance.Price.receivables": 1,
				industry: 1,
				startDate: 1,
				deadline: 1,
				accountManager: 1,
				additionsSteps: 1,
				projectCurrency: 1,
				minimumCharge: 1,
				discounts: 1,
				tasksDeliverables: 1,
				tasksDR2: 1,
				clientContacts: 1,
				"steps.finance.Price.receivables": 1,
				"steps.finance.Wordcount.receivables": 1,
				"steps.finance.Quantity.receivables": 1,
				"steps.step": 1,
				"steps.taskId": 1,
				"steps.progress": 1,
				"steps.receivablesUnit": 1,
				"steps.sourceLanguage": 1,
				"steps.targetLanguage": 1,
				"steps.fullSourceLanguage": 1,
				"steps.fullTargetLanguage": 1,
				"steps.clientRate": 1,
				"steps.status": 1,
				"steps.totalWords": 1,
				"tasks.sourceLanguage": 1,
				"tasks.targetLanguage": 1,
				"tasks.taskId": 1,
				"tasks.status": 1

			}
	)
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('industry')
			.populate('steps.step')
			.populate('steps.service')
			.populate('steps.fullSourceLanguage')
			.populate('steps.fullTargetLanguage')
			.populate('steps.receivablesUnit')

	project._doc.steps = project._doc.steps.length
			? project._doc.steps.map(item => {
						return {
							...item._doc,
							price: item._doc.finance.Price.receivables,
							quantity: +item._doc.finance.Wordcount.receivables
									? +item._doc.finance.Wordcount.receivables
									: +item._doc.finance.Quantity.receivables || 0
						}
					}
			).filter(({ status }) => status !== 'Cancelled')
			: []

	project._doc.incomingSteps = filterQuoteStepsInStartedProjectForClientPortal(project, false)
	project._doc.steps = filterNotQuoteStepsInStartedProjectForClientPortal(project)

	return project
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

module.exports = {
	getProject,
	getProjects,
	getProjectsForPortalAll,
	updateProject,
	getFilteredProjects,
	getProjectAfterUpdate,
	getProjectsForVendorPortal,
	getProjectsForPortalList,
	getProjectForClientPortal
}

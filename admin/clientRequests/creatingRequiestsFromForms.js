const { ClientRequest, Projects, Services, User, Clients } = require('../models')
const moment = require('moment')
const { storeRequestFiles } = require('./files')
const { allManagersMessageRequestIsCreated } = require('../emailMessages/internalCommunication')
const { managerNotifyMail } = require('../utils/mailTemplate')


const complianceService = async (formData, client) => {
	const { billingInfo: { paymentType: paymentProfile }, _id } = client
	const { deadline, projectName, brief, startOption } = formData

	const sourceLanguage = JSON.parse(formData.sourceLanguage)
	const targetLanguages = JSON.parse(formData.targetLanguages)
	const industry = JSON.parse(formData.industry)
	const complianceTemplate = JSON.parse(formData.complianceTemplate)
	const clientContacts = JSON.parse(formData.clientContacts)
	const createdBy = JSON.parse(formData.createdBy)
	return await ClientRequest.create({
		projectId: "Req " + moment(new Date()).format("YYYY MM DD") + " " + await getNextNumberForProjectName(),
		projectName,
		clientContacts,
		paymentProfile,
		startDate: new Date(),
		deadline,
		billingDate: deadline,
		industry,
		customer: _id,
		projectManager: null,
		accountManager: null,
		status: "Client Request",
		notes: brief,
		createdBy,

		requestForm: {
			sourceLanguage,
			targetLanguages: [ targetLanguages ],
			startOption,
			service: await Services.findOne({ title: 'Compliance' }),
			complianceOptions: complianceTemplate
		}
	})

	//internal functions
	async function getNextNumberForProjectName() {
		let todayStart = new Date()
		let todayEnd = new Date(todayStart)
		todayStart.setUTCHours(0, 0, 0, 0)
		todayEnd.setUTCHours(23, 59, 59, 0)
		const todayProjects = await ClientRequest.find({ startDate: { $gte: todayStart, $lt: todayEnd } })
		return todayProjects.length < 10 ? "[0" + (todayProjects.length + 1) + "]" : "[" + (todayProjects.length + 1) + "]"
	}
}

const createComplianceFiles = async (request, files) => {
	const { _id, requestForm } = request
	const sourceFiles = files.sourceFiles ? await storeRequestFiles(files.sourceFiles, _id) : []
	const refFiles = files.refFiles ? await storeRequestFiles(files.refFiles, _id) : []

	await ClientRequest.updateOne({ _id }, { requestForm: { ...requestForm, sourceFiles, refFiles } })
}

const notifyAMsRequestCreated = async (request) => {
	const client = await Clients.findOne({ _id: request.customer })
	const users = await User.find({}, { firstName: 1, lastName: 1, group: 1, email: 1 }).populate('group')
	const managers = users.filter(i => i.group.name === 'Account Managers')
	for await (let user of managers) {
		const message = allManagersMessageRequestIsCreated(user, request, client)
		await managerNotifyMail({ email: user.email }, message, `Client Request - ${ request.requestForm.service.title }, created (I0011.0)`)
	}
}


module.exports = {
	complianceService,
	notifyAMsRequestCreated,
	createComplianceFiles
}

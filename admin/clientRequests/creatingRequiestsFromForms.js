const { ClientRequest, Projects, Services } = require('../models')
const moment = require('moment')
const { storeRequestFiles } = require('./files')


const complianceService = async (formData, client) => {
	const { billingInfo: { paymentType: paymentProfile }, _id, accountManager } = client
	const { deadline, projectName, brief, startOption } = formData

	const sourceLanguage = JSON.parse(formData.sourceLanguage)
	const targetLanguages = JSON.parse(formData.targetLanguages)
	const industry = JSON.parse(formData.industry)
	const complianceTemplate = JSON.parse(formData.complianceTemplate)
	const clientContacts = JSON.parse(formData.clientContacts)
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
		accountManager,
		status: "Client Request",
		brief,

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

	await ClientRequest.updateOne({_id}, {requestForm: { ...requestForm, sourceFiles, refFiles }})
}


module.exports = {
	complianceService,
	createComplianceFiles
}
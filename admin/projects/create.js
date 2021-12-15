const { Projects, Clients, CurrencyRatio, ClientRequest } = require('../models')
const { getProject } = require('./getProjects')
const { createTasksAndStepsForCustomUnits } = require('./taskForCommon')
const { storeFiles } = require('./files')
const { getModifiedFiles, createProjectFolder } = require('./helpers')
const { calculateCrossRate } = require('../helpers/commonFunctions')
const {
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles,
	getTaskCopiedFilesFromRequestToProject,
	getClientRequestAfterUpdate,
	getClientRequestById
} = require('../clientRequests')
const fs = require('fs')
const { createMemoqProjectWithTemplate, getProjectTranslationDocs } = require('../services/memoqs/projects')
const { addProjectFile } = require('../services/memoqs/files')
const { assignProjectManagers } = require('./updates')
// const { updateProjectMetricsAndCreateSteps } = require('./metrics')
// const { updateProjectCosts } = require('../сalculations/wordcount')

const moment = require('moment')
const { createTasksForWordcount } = require("./taskForWordcount")


async function createProject(project, user) {
	const { group: { name: role }, _id: userId } = user
	let todayStart = new Date()
	todayStart.setUTCHours(0, 0, 0, 0)
	let todayEnd = new Date(todayStart)
	todayEnd.setUTCHours(23, 59, 59, 0)

	try {
		const { USD, GBP } = await CurrencyRatio.findOne()
		const { contacts, projectManager, accountManager, discounts, minPrice, currency } = await Clients.findOne({ '_id': project.customer }).populate('discounts')
		const todayProjects = await Projects.find({ startDate: { $gte: todayStart, $lte: todayEnd } })

		const currNumber = getNextProjectNumber(todayProjects)
		const projectNumber = currNumber < 9 ? "[0" + (currNumber + 1) + "]" : "[" + (currNumber + 1) + "]"

		project.status = project.status || "Draft"
		project.projectId = "Png " + moment(new Date()).format("YYYY MM DD") + " " + projectNumber
		project.projectManager = (role === 'Project Managers') ? userId : projectManager._id
		project.accountManager = (role === 'Account Managers') ? userId : accountManager._id
		// project.paymentProfile = project.clientBillingInfo.paymentType
		project.clientContacts = [ contacts.find(({ leadContact }) => leadContact) ]
		project.discounts = discounts
		project.minimumCharge = { value: minPrice, toIgnore: false }
		project.crossRate = calculateCrossRate(USD, GBP)
		project.projectCurrency = currency
		project.projectName = project.isUrgent ? '[Urgent] ' + project.projectName : project.projectName

		const createdProject = await Projects.create({
			...project,
			startDate: new Date(),
			billingDate: new Date()
		})

		await createProjectFolder(createdProject.id)
		return await getProject({ _id: createdProject.id })

	} catch (err) {
		console.log(err)
		console.log("Error in createProject")
	}
}

const createProjectFromRequest = async (requestId) => {
	let todayStart = new Date()
	todayStart.setUTCHours(0, 0, 0, 0)
	let todayEnd = new Date(todayStart)
	todayEnd.setUTCHours(23, 59, 59, 0)

	const request = await getClientRequestById(requestId)
	const {
		projectManager,
		accountManager,
		paymentProfile,
		clientContacts,
		projectName,
		clientBillingInfo,
		isUrgent,
		brief,
		notes,
		deadline,
		industry,
		customer,
		createdBy
	} = request
	const { _id, minPrice, currency } = customer
	const { discounts, accountManager: { _id: AMId }, projectManager: { _id: PMId } } = await Clients.findOne({ '_id': _id }).populate('discounts')

	const { USD, GBP } = await CurrencyRatio.findOne()
	const todayProjects = await Projects.find({ startDate: { $gte: todayStart, $lt: todayEnd } })

	const currNumber = getNextProjectNumber(todayProjects)
	const projectNumber = currNumber < 9 ? "[0" + (currNumber + 1) + "]" : "[" + (currNumber + 1) + "]"

	let project = {
		requestId: request._id,
		projectName,
		industry,
		customer,
		deadline,
		notes,
		brief,
		isUrgent,
		status: "Draft",
		projectId: "Png " + moment(new Date()).format("YYYY MM DD") + " " + projectNumber,
		projectManager: projectManager || PMId,
		accountManager: accountManager || AMId,
		clientBillingInfo,
		paymentProfile,
		clientContacts,
		discounts,
		minimumCharge: { value: minPrice, toIgnore: false },
		crossRate: calculateCrossRate(USD, GBP),
		projectCurrency: currency,
		createdBy,
		startDate: new Date(),
		billingDate: new Date()
	}

	const createdProject = await Projects.create({
		...project
	})

	await createProjectFolder(createdProject.id)
	await ClientRequest.updateOne({ _id: requestId }, { status: 'Closed' })
	return await getProject({ _id: createdProject.id })
}

const updateRequestTasks = async ({ tasksInfo, sourceFiles: sourceUploadFiles, refFiles: refUploadFiles }) => {
	const { requestId: _id, taskIdForUpdate } = tasksInfo
	const { tasksAndSteps, requestForm } = await getClientRequestById(_id)
	const { service, source } = requestForm

	for (let key of [ 'stepsAndUnits', 'targets' ]) {
		tasksInfo[key] = JSON.parse(tasksInfo[key])
	}

	if (tasksInfo.template) {
		tasksInfo['template'] = JSON.parse(tasksInfo['template'])
	}

	const currIdx = tasksAndSteps.findIndex(item => item.taskId === taskIdForUpdate)
	let { refFiles, sourceFiles } = tasksAndSteps[currIdx]

	const { targets, stepsAndUnits } = tasksInfo

	await setFiles(sourceUploadFiles, sourceFiles)
	await setFiles(refUploadFiles, refFiles)
	copyFiles(tasksInfo.sourceFilesVault, sourceFiles)
	copyFiles(tasksInfo.refFilesVault, refFiles)

	delete tasksInfo.refFilesVault
	delete tasksInfo.sourceFilesVault
	delete tasksInfo.requestId

	const tasksAndStepsForSave = {
		taskId: taskIdForUpdate,
		refFiles,
		sourceFiles,
		taskData: {
			targets,
			template: tasksInfo.template || null,
			stepsAndUnits,
			service,
			source
		}
	}

	tasksAndSteps.splice(currIdx, 1, tasksAndStepsForSave)

	return await getClientRequestAfterUpdate({ _id }, { tasksAndSteps })

	function copyFiles(key, arr) {
		if (key) arr.push(...getTaskCopiedFiles(_id, JSON.parse(key)))
	}

	async function setFiles(key, arr) {
		if (key) arr.push(...await storeRequestFilesForTasksAndSteps(key, _id))
	}
}

const createRequestTasks = async ({ tasksInfo, sourceFiles: sourceUploadFiles, refFiles: refUploadFiles }) => {
	const { requestId: _id } = tasksInfo
	const { projectId, tasksAndSteps, requestForm } = await getClientRequestById(_id)
	const { service, source } = requestForm

	for (let key of [ 'stepsAndUnits', 'targets' ]) {
		tasksInfo[key] = JSON.parse(tasksInfo[key])
	}

	if (tasksInfo.template) {
		tasksInfo['template'] = JSON.parse(tasksInfo['template'])
	}

	const { targets, stepsAndUnits } = tasksInfo

	let [ refFiles, sourceFiles ] = [ [], [] ]
	copyFiles(tasksInfo.sourceFilesVault, sourceFiles)
	copyFiles(tasksInfo.refFilesVault, refFiles)
	await setFiles(sourceUploadFiles, sourceFiles)
	await setFiles(refUploadFiles, refFiles)

	delete tasksInfo.refFilesVault
	delete tasksInfo.sourceFilesVault
	delete tasksInfo.requestId

	let existingTasksIds = tasksAndSteps.map(item => item.taskId).map(item => /\d*$/ig.exec(item)[0]).map(item => {
		const [ first, ...rest ] = item
		return +rest[0]
	})

	const id = !existingTasksIds.length ? 1 : req(1)
	const taskId = projectId + `${ id < 10 ? ` T0${ id }` : ` T${ id }` }`
	const tasksAndStepsForSave = {
		taskId,
		refFiles,
		sourceFiles,
		taskData: {
			targets,
			template: tasksInfo.template || null,
			stepsAndUnits,
			service,
			source
		}
	}

	return await getClientRequestAfterUpdate({ _id }, {
		$push: { "tasksAndSteps": tasksAndStepsForSave }
	})

	function req(num) {
		if (existingTasksIds.includes(num)) return req(num + 1)
		else return num
	}

	function copyFiles(key, arr) {
		if (key) arr.push(...getTaskCopiedFiles(_id, JSON.parse(key)))
	}

	async function setFiles(key, arr) {
		if (key) arr.push(...await storeRequestFilesForTasksAndSteps(key, _id))
	}
}

async function createTasks({ sourceFiles, refFiles, tasksInfo }) {
	try {
		if (tasksInfo.source) tasksInfo.source = JSON.parse(tasksInfo.source)
		else tasksInfo.source = null

		tasksInfo.targets = JSON.parse(tasksInfo.targets)
		tasksInfo.service = JSON.parse(tasksInfo.service)
		tasksInfo.stepsAdditions = JSON.parse(tasksInfo.stepsAdditions)
		tasksInfo.stepsAndUnits = JSON.parse(tasksInfo.stepsAndUnits)
		tasksInfo.industry = JSON.parse(tasksInfo.industry)

		tasksInfo.refFiles = await storeFiles(refFiles, tasksInfo.projectId)
		tasksInfo.sourceFiles = await storeFiles(sourceFiles, tasksInfo.projectId)

		return await createTasksAndStepsForCustomUnits(tasksInfo)
	} catch (err) {
		console.log(err)
		console.log("Error in createTasks")
	}
}

const autoCreatingTaskInProject = async (project, requestId) => {
	try {
		const { tasksAndSteps, requestForm } = await getClientRequestById(requestId)
		const { service, sourceLanguage } = requestForm
		const { _id, projectId } = project

		for await (let { refFiles, sourceFiles, taskData } of tasksAndSteps) {
			const { stepsAndUnits, targets } = taskData

			const tasksInfo = {
				sourceFiles: [ ...await getTaskCopiedFilesFromRequestToProject(project._id, requestId, sourceFiles) ],
				refFiles: [ ...await getTaskCopiedFilesFromRequestToProject(project._id, requestId, refFiles) ],
				stepsAndUnits,
				stepsAdditions: [],
				service,
				targets,
				source: sourceLanguage,
				projectId: _id,
				internalProjectId: projectId
			}

			await createTasksAndStepsForCustomUnits(tasksInfo)
		}

		return await getProject({ _id: project._id })
	} catch (err) {
		console.log(err)
		console.log("Error in autoCreatingTaskInProject")
	}
}

function getNextProjectNumber(todayProjects) {
	let currNumber = 0
	if (todayProjects.length) {
		const pa = new RegExp(/(\[(?<num>\d.*)\])/)
		const lastProject = todayProjects[todayProjects.length - 1]
		const res = pa.exec(lastProject.projectId)
		if (res) currNumber = parseFloat(res.groups.num)
	}
	return currNumber
}

const manageMemoqProjectName = (projectId, projectName) => {
	projectName = projectId + ' ' + projectName.replace(/( *[^\w\s\.]+ *)+/g, ' ').trim()
	if (!projectName.trim().length) projectName = "Png"
	if (Number.isInteger(+projectName.charAt(0))) projectName = 'Png ' + projectName
	return projectName
}

const autoCreatingTranslationTaskInProject = async (project, requestId, creatorUserForMemoqId) => {
	const { projectName, projectId, _id } = project
	const { tasksAndSteps, industry, customer, requestForm, projectManager } = await getClientRequestById(requestId)
	const { sourceLanguage, service } = requestForm


	for await (let { refFiles, sourceFiles, taskData: { targets, template, stepsAndUnits } } of tasksAndSteps) {
		const tasksInfo = {
			projectId: _id,
			internalProjectId: projectId,
			memoqFiles: [],
			stepsAdditions: [],
			targets,
			source: sourceLanguage,
			service,
			stepsAndUnits,
			translateFiles: [ ...await getTaskCopiedFilesFromRequestToProject(project._id, requestId, sourceFiles) ],
			referenceFiles: [ ...await getTaskCopiedFilesFromRequestToProject(project._id, requestId, refFiles) ],
			memoqProjectId: await createMemoqProjectWithTemplate({
				customerName: customer.name,
				creatorUserId: creatorUserForMemoqId,
				industry: industry.name.replace('&', 'and'),
				projectName: manageMemoqProjectName(projectId, projectName),
				source: sourceLanguage,
				targets,
				template
			})
		}
		await assignProjectManagers({ manager: projectManager, memoqProjectId: tasksInfo.memoqProjectId })

		for await (let filePath of tasksInfo.translateFiles) {
			const addFileResult = await addProjectFile(tasksInfo.memoqProjectId, filePath)
			tasksInfo.memoqFiles.push({ name: filePath.split("/").pop(), fileGuid: addFileResult.data })
		}

		const listProjectTranslationDocuments = await getProjectTranslationDocs(tasksInfo.memoqProjectId)
		await createTasksForWordcount({ ...tasksInfo, docs: listProjectTranslationDocuments })

		// const tasks = await createTasksForWordcount(tasksInfo, listProjectTranslationDocuments)
		// let updatedProject = await updateProjectMetricsAndCreateSteps(_id, tasks)
		// updatedProject = await updateProjectCosts(updatedProject)
	}

}

module.exports = {
	autoCreatingTranslationTaskInProject,
	updateRequestTasks,
	createProject,
	createTasks,
	createRequestTasks,
	createProjectFromRequest,
	autoCreatingTaskInProject
}

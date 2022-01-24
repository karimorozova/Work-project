const moment = require('moment')
const { XTMLanguageReplacer } = require('../enums')
const { Projects, Clients, CurrencyRatio, ClientRequest, Languages, Units, Step, Services, User } = require('../models')
const { getProject, updateProject } = require('./getProjects')
const { createTasksAndStepsForCustomUnits } = require('./taskForCommon')
const { storeFiles } = require('./files')
const { createProjectFolder } = require('./helpers')
const { calculateCrossRate } = require('../helpers/commonFunctions')
const readXlsxFile = require('read-excel-file/node')
const {
	storeRequestFilesForTasksAndSteps,
	getTaskCopiedFiles,
	getTaskCopiedFilesFromRequestToProject,
	getClientRequestAfterUpdate,
	getClientRequestById
} = require('../clientRequests')
const {
	createMemoqProjectWithTemplate,
	getProjectTranslationDocs,
	getMemoqAllProjects
} = require('../services/memoqs/projects')

const { addProjectFile } = require('../services/memoqs/files')
const { assignProjectManagers } = require('./updates')
const { createTasksForWordcount } = require("./taskForWordcount")
const Response = require("../helpers/Response")
const { createClient } = require("../clients")

const createProjectIndividual = async ({ project, client, user }) => {
	const { group: { name: role }, _id: userId } = user
	const customer = await createClient({ client, user })
	const { USD, GBP } = await CurrencyRatio.findOne()

	let todayStart = new Date()
	todayStart.setUTCHours(0, 0, 0, 0)
	let todayEnd = new Date(todayStart)
	todayEnd.setUTCHours(23, 59, 59, 0)

	const todayProjects = await Projects.find({ startDate: { $gt: todayStart, $lt: todayEnd } })
	const currNumber = getNextProjectNumber(todayProjects)
	const projectNumber = currNumber < 9 ? "[0" + (currNumber + 1) + "]" : "[" + (currNumber + 1) + "]"

	const { _id, contacts, projectManager, accountManager, discounts, minPrice, currency, billingInfo } = customer

	project.customer = _id
	project.status = project.isSkipProgress ? 'Closed' : project.status || "Draft"
	project.projectId = moment(new Date()).format("YYYY MM DD") + " " + projectNumber
	project.projectManager = (role === 'Project Managers') ? userId : projectManager._id || userId
	project.accountManager = (role === 'Account Managers') ? userId : accountManager._id || userId
	project.clientContacts = [ contacts.find(({ leadContact }) => leadContact) ]
	project.discounts = discounts
	project.minimumCharge = { value: minPrice, toIgnore: false }
	project.crossRate = calculateCrossRate(USD, GBP)
	project.projectCurrency = currency
	project.projectName = project.isUrgent ? '[Urgent] ' + project.projectName : project.projectName
	project.clientBillingInfo = billingInfo.length === 1 ? billingInfo[0] : null
	project.inPause = project.clientBillingInfo && project.clientBillingInfo.paymentType === 'PPP'

	const createdProject = await Projects.create({
		...project,
		startDate: new Date(),
		billingDate: new Date()
	})

	await createProjectFolder(createdProject.id)
	return new Response(Response.Success, await getProject({ _id: createdProject.id }))
}

const createProjectFromXTMFile = async ({ files, user, industry, project }) => {
	const { group: { name: role }, _id: userId } = user
	const allClients = await Clients.find().populate('discounts')
	const { USD, GBP } = await CurrencyRatio.findOne()

	let todayStart = new Date()
	todayStart.setUTCHours(0, 0, 0, 0)
	let todayEnd = new Date(todayStart)
	todayEnd.setUTCHours(23, 59, 59, 0)

	for await (const file of files) {
		try {
			await readXlsxFile(file.path)
		} catch (err) {
			return new Response(Response.Error, `Error on parsing ${ file.filename } file.`)
		}
	}

	for await (file of files) {
		const fileData = await readXlsxFile(file.path)
		let deadline, projectName, client
		client = fileData[2][2]
		fileData.forEach((element, index, array) => {
			if (element.includes('Project due date')) deadline = element[1]
			if (element.includes('Project name')) projectName = element[1]
		})
		deadline = deadline.split("-")
		deadline = new Date(`${ deadline[1] }-${ deadline[0] }-${ deadline[2] }`)

		const customer = allClients.find(item => item.name === client)
		if (!customer) return new Response(Response.Error, `No such client on system, ${ client } like in file.`)

		const { contacts, projectManager, accountManager, discounts, minPrice, currency, billingInfo } = customer
		const todayProjects = await Projects.find({ startDate: { $gt: todayStart, $lt: todayEnd } })

		const currNumber = getNextProjectNumber(todayProjects)
		const projectNumber = currNumber < 9 ? "[0" + (currNumber + 1) + "]" : "[" + (currNumber + 1) + "]"

		project.status = project.isSkipProgress ? 'Closed' : project.status || "Draft"
		project.projectId = moment(new Date()).format("YYYY MM DD") + " " + projectNumber
		project.projectManager = (role === 'Project Managers') ? userId : projectManager._id || userId
		project.accountManager = (role === 'Account Managers') ? userId : accountManager._id || userId
		project.clientContacts = [ contacts.find(({ leadContact }) => leadContact) ]
		project.discounts = discounts
		project.deadline = deadline
		project.industry = industry
		project.customer = customer._id
		project.minimumCharge = { value: minPrice, toIgnore: false }
		project.crossRate = calculateCrossRate(USD, GBP)
		project.projectCurrency = currency
		project.projectName = project.isUrgent ? '[Urgent] ' + projectName : projectName
		project.clientBillingInfo = billingInfo.length === 1 ? billingInfo[0] : null

		const createdProject = await Projects.create({
			...project,
			startDate: new Date(),
			billingDate: new Date()
		})
		await createProjectFolder(createdProject.id)
		const { _id: projectId, projectId: internalProjectId, startDate } = await getProject({ _id: createdProject.id })

		try {
			await autoCreatingTranslationTaskInProjectByXTMFile({
				projectId,
				internalProjectId,
				startDate,
				deadline,
				file
			})
		} catch (e) {
			await Projects.deleteOne({ _id: projectId })
			return new Response(Response.Error, 'Error creating T&S, your data has an incorrect file structure, try another option.')
		}
	}
	return new Response(Response.Success, null)
}

const createProjectFromMemoq = async ({ project, memoqLink, selectedMemoqWorkflow, user }) => {
	const { group: { name: role }, _id: userId } = user

	let todayStart = new Date()
	todayStart.setUTCHours(0, 0, 0, 0)
	let todayEnd = new Date(todayStart)
	todayEnd.setUTCHours(23, 59, 59, 0)

	const allClients = await Clients.find().populate('discounts')
	const memoqProjects = await getMemoqAllProjects()
	const currentProject = memoqProjects.find(item => item.Name === memoqLink.trim())

	if (!memoqProjects.length || !currentProject) return new Response(Response.Error, 'No such project found on Memoq.')
	const { Client, Name, Deadline } = currentProject
	const customer = allClients.find(item => item.name === Client)
	if (!customer) return new Response(Response.Error, 'No such client in system like on Memoq.')

	const { USD, GBP } = await CurrencyRatio.findOne()
	const { contacts, projectManager, accountManager, discounts, minPrice, currency, billingInfo } = customer
	const todayProjects = await Projects.find({ startDate: { $gt: todayStart, $lt: todayEnd } })

	const currNumber = getNextProjectNumber(todayProjects)
	const projectNumber = currNumber < 9 ? "[0" + (currNumber + 1) + "]" : "[" + (currNumber + 1) + "]"

	project.status = project.isSkipProgress ? 'Closed' : project.status || "Draft"
	project.projectId = moment(new Date()).format("YYYY MM DD") + " " + projectNumber
	project.projectManager = (role === 'Project Managers') ? userId : projectManager._id || userId
	project.accountManager = (role === 'Account Managers') ? userId : accountManager._id || userId
	project.clientContacts = [ contacts.find(({ leadContact }) => leadContact) ]
	project.discounts = discounts
	project.minimumCharge = { value: minPrice, toIgnore: false }
	project.crossRate = calculateCrossRate(USD, GBP)
	project.projectCurrency = currency
	project.deadline = Deadline
	project.customer = customer._id
	project.projectName = project.isUrgent ? '[Urgent] ' + Name : Name
	project.clientBillingInfo = billingInfo.length === 1 ? billingInfo[0] : null

	const createdProject = await Projects.create({
		...project,
		startDate: new Date(),
		billingDate: new Date()
	})

	await createProjectFolder(createdProject.id)
	const { _id: projectId, projectId: internalProjectId, startDate, deadline } = await getProject({ _id: createdProject.id })

	try {
		await autoCreatingTranslationTaskInProjectByMemoqLink({
			memoqLink,
			projectId,
			memoqWorkFlow: selectedMemoqWorkflow,
			creatorUserId: null,
			internalProjectId,
			startDate,
			deadline
		})
	} catch (e) {
		await Projects.deleteOne({ _id: projectId })
		return new Response(Response.Error, 'Error creating T&S, your data has an incorrect structure, try another option')
	}

	return new Response(Response.Success, await getProject({ _id: createdProject.id }))
}

async function createProject(project, user) {
	const { group: { name: role }, _id: userId } = user

	let todayStart = new Date()
	todayStart.setUTCHours(0, 0, 0, 0)
	let todayEnd = new Date(todayStart)
	todayEnd.setUTCHours(23, 59, 59, 0)

	try {
		const { USD, GBP } = await CurrencyRatio.findOne()
		const { contacts, projectManager, accountManager, discounts, minPrice, currency, billingInfo } = await Clients.findOne({ '_id': project.customer }).populate('discounts')
		const todayProjects = await Projects.find({ startDate: { $gt: todayStart, $lt: todayEnd } })

		const currNumber = getNextProjectNumber(todayProjects)
		const projectNumber = currNumber < 9 ? "[0" + (currNumber + 1) + "]" : "[" + (currNumber + 1) + "]"

		project.status = project.isSkipProgress ? 'Closed' : project.status || "Draft"
		project.projectId = moment(new Date()).format("YYYY MM DD") + " " + projectNumber
		project.projectManager = (role === 'Project Managers') ? userId : projectManager._id || userId
		project.accountManager = (role === 'Account Managers') ? userId : accountManager._id || userId
		project.clientContacts = [ contacts.find(({ leadContact }) => leadContact) ]
		project.discounts = discounts
		project.minimumCharge = { value: minPrice, toIgnore: false }
		project.crossRate = calculateCrossRate(USD, GBP)
		project.projectCurrency = currency
		project.projectName = project.isUrgent ? '[Urgent] ' + project.projectName : project.projectName
		project.clientBillingInfo = billingInfo.length === 1 ? billingInfo[0] : null

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
	const allUsers = await User.find().populate('group')
	const { _id: userId } = allUsers.find(item => item.group.name === 'Administrators')

	const { USD, GBP } = await CurrencyRatio.findOne()
	const todayProjects = await Projects.find({ startDate: { $gt: todayStart, $lt: todayEnd } })

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
		projectId: moment(new Date()).format("YYYY MM DD") + " " + projectNumber,
		projectManager: projectManager || PMId || userId,
		accountManager: accountManager || AMId || userId,
		clientBillingInfo,
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
		const [ , ...rest ] = item
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
	if (!projectName.trim().length) projectName = "P"
	if (Number.isInteger(+projectName.charAt(0))) projectName = 'P ' + projectName
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

const autoCreatingTranslationTaskInProjectByMemoqLink = async ({ memoqLink, projectId, memoqWorkFlow, creatorUserId, internalProjectId, startDate, deadline }) => {
	const allLanguages = await Languages.find()
	const allSteps = await Step.find()
	const allServices = await Services.find()
	const allUnits = await Units.find()

	const memoqProjects = await getMemoqAllProjects()
	const currentProject = memoqProjects.find(item => item.Name === memoqLink.trim())

	if (!memoqProjects.length || !currentProject) return getError('No such project found on Memoq.')
	const { ServerProjectGuid, SourceLanguageCode: sourceLanguage, TargetLanguageCodes } = currentProject
	const documents = await getProjectTranslationDocs(ServerProjectGuid)

	let targetLanguages = Array.isArray(documents)
			? Object.values(TargetLanguageCodes)[1]
			: [ TargetLanguageCodes['a:string'] ]

	if (!Array.isArray(targetLanguages)) targetLanguages = [ targetLanguages ]

	const isDocuments = Array.isArray(documents)
			? !!documents.length
			: !!Object.keys(documents).length

	if (!isDocuments) return getError('No such files or documents found on Memoq.')

	const tasksInfo = {
		docs: documents,
		source: allLanguages.find(item => item.memoq === sourceLanguage),
		targets: targetLanguages.map(item => allLanguages.find(elem => elem.memoq === item)),
		service: allServices.find(item => item.title === 'Translation'),
		stepsAdditions: [],
		projectId,
		internalProjectId,
		refFiles: [],
		translateFiles: [],
		memoqFiles: [],
		stepsAndUnits: generateStepsAndUnits(),
		memoqProjectId: ServerProjectGuid
	}

	try {
		const updatedProject = await createTasksForWordcount(tasksInfo)
		return {
			status: 'success',
			data: updatedProject
		}
	} catch (err) {
		return getError('Error on creation T&S.')
	}

	function generateStepsAndUnits() {
		let receivables, payables, basic
		receivables = payables = {
			unit: allUnits.find(item => item.type === 'CAT Wordcount'),
			quantity: 0
		}
		basic = {
			start: startDate,
			deadline,
			receivables,
			payables
		}
		switch (memoqWorkFlow) {
			case 'Translation & Revising':
				return [ {
					step: allSteps.find(item => item.title === 'Translation'),
					...basic
				}, {
					step: allSteps.find(item => item.title === 'Revising'),
					...basic
				} ]
			case 'Translation Only':
				return [ {
					step: allSteps.find(item => item.title === 'Translation'),
					...basic
				} ]
		}
	}

	function getError(message) {
		return {
			status: 'error',
			message: message
		}
	}
}

const autoCreatingTranslationTaskInProjectByXTMFile = async ({ projectId, internalProjectId, startDate, deadline, file }) => {
	const allLanguages = await Languages.find()
	const allSteps = await Step.find()
	const allServices = await Services.find()
	const allUnits = await Units.find()
	let fileData
	try {
		fileData = await readXlsxFile(file.path)
	} catch (err) {
		return getError('Error on parsing file.')
	}

	let source, targets, PO
	const metrics = []

	fileData.forEach((element, index, array) => {
		if (element.includes('PO number')) PO = element[1]
		if (element.includes('Source language')) source = element[3]
		if (element.includes('Target languages')) targets = element[3].split(',').map(i => i.trim())
		if (element.includes('Quantity - Words') && element.includes('Rate %')) {
			const metricsArr = array.slice(index, index + 16)
			metrics.push({ language: metricsArr[0][0].split(',')[0], langMetrics: metricsArr })
		}
	})

	for await (let target of targets) {
		const tasksInfo = {
			service: allServices.find(item => item.title === 'Translation'),
			source: findConcreteLanguage(source),
			targets: [ findConcreteLanguage(target) ],
			stepsAndUnits: generateStepsAndUnits(target),
			sourceFiles: [],
			refFiles: [],
			stepsAdditions: [],
			projectId,
			internalProjectId
		}
		try {
			await createTasksAndStepsForCustomUnits(tasksInfo)
		} catch (err) {
			return getError('Error on creation T&S.')
		}
	}

	return {
		status: 'success',
		data: await updateProject({ _id: projectId }, { PO })
	}

	function generateStepsAndUnits(targetLanguage) {
		let { langMetrics } = metrics.find(item => item.language === targetLanguage)
		langMetrics = langMetrics.slice(2, 14)
		const quantity = langMetrics.map(item => (+item[2] * +item[3]) / 100).reduce((acc, curr) => acc + curr, 0)

		let receivables, payables, basic
		receivables = payables = {
			unit: allUnits.find(item => item.type === 'Source Word'),
			quantity
		}
		basic = {
			start: startDate,
			deadline,
			receivables,
			payables
		}
		switch (true) {
			case true:
				return [ {
					step: allSteps.find(item => item.title === 'Translation'),
					...basic
				} ]
		}
	}

	function findConcreteLanguage(xtmLanguage) {
		let replacer = XTMLanguageReplacer.find(item => item.xtm === xtmLanguage)
		if (!replacer) replacer = allLanguages.find(item => item.lang === xtmLanguage)
		if (!replacer) replacer = { lang: 'English (United Kingdom)' }
		return allLanguages.find(item => item.lang === replacer.lang)
	}

	function getError(message) {
		return {
			status: 'error',
			message: message
		}
	}
}

module.exports = {
	createProjectFromXTMFile,
	autoCreatingTranslationTaskInProject,
	updateRequestTasks,
	createProject,
	createTasks,
	createRequestTasks,
	createProjectFromRequest,
	autoCreatingTaskInProject,
	autoCreatingTranslationTaskInProjectByMemoqLink,
	autoCreatingTranslationTaskInProjectByXTMFile,
	createProjectFromMemoq,
	createProjectIndividual
}

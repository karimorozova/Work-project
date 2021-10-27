const {
	sendEmail,
	managerNotifyMail,
	clientQuoteToEmails
} = require('../utils/mailTemplate')

const {
	managerTaskCompleteNotificationMessage,
	deliverablesDownloadedMessage,
	stepStartedMessage,
	stepCompletedMessage,
	stepDecisionMessage,
	readyForDr2Message
} = require("../emailMessages/internalCommunication")

const {
	messageForClientSendQuote,
	getDeliveryMessage,
	getNotifyDeliveryMessage,
	messageForClientSendCostQuote,
	projectDeliveryMessage
} = require('../emailMessages/clientCommunication')

const {
	stepCancelledMessage,
	stepMiddleCancelledMessage,
	stepReopenedMessage,
	stepReadyToStartMessage,
	vendorCanStartStartedSecondStep
} = require('../emailMessages/vendorCommunication')

const { getProject } = require("./getProjects")
const { getService } = require("../services/getServices")
const { User, Units, Step, Languages, Services, Projects } = require("../models")

const {
	getDeliverablesLink,
	createArchiveForDeliverableItem,
	getProjectDeliverables,
	getPdf
} = require("./files")

const { flatten } = require('lodash')
const fs = require('fs')

async function stepCancelNotifyVendor(steps) {
	try {
		for (let step of steps) {
			if (step.vendor && step.status !== "Completed") {
				const message = ifStepStarted(step.status) ? stepMiddleCancelledMessage(step) : stepCancelledMessage(step)
				step["to"] = step.vendor.email
				const id = ifStepStarted(step.status) ? "V004.0" : "V003.0"
				const subject = ifStepStarted(step.status) ? "Step cancelled in the middle" : "Step cancelled"
				step.subject = `${ subject }: ${ step.stepId } (${ step.serviceStep.title }) (ID ${ id })`
				await sendEmail(step, message)
			}
		}
	} catch (err) {
		console.log(err)
		console.log("Error in stepCancelNotifyVendor")
	}

	function ifStepStarted(status) {
		const startStepStatuses = [ 'Started', 'In progress' ]
		return startStepStatuses.includes(status)
	}
}

const allUnitsAndSteps = async () => {
	const allUnits = await Units.find()
	const allSettingsSteps = await Step.find()
	return {
		allUnits, allSettingsSteps
	}
}

async function getCostMessage(projectId) {
	const { allUnits, allSettingsSteps } = await allUnitsAndSteps()
	let project = await getProject({ "_id": projectId })
	try {
		return await messageForClientSendCostQuote(project, allUnits, allSettingsSteps)
	} catch (err) {
		console.log(err)
		console.log('Error in getCostMessage')
	}
}

async function getQuoteMessage(projectId, tasksIds) {
	const { allUnits, allSettingsSteps } = await allUnitsAndSteps()
	let project = await getProject({ "_id": projectId })
	try {
		return await messageForClientSendQuote(project, tasksIds, allUnits, allSettingsSteps)
	} catch (err) {
		console.log(err)
		console.log('Error in getQuoteMessage')
	}
}

const sendCostQuoteMessage = async (project, message, arrayOfEmails) => {
	const { allUnits, allSettingsSteps } = await allUnitsAndSteps()
	let subject = 'Cost Quote'
	let messageId = 'C001.3'

	const allArrayOfEmail = [ ...arrayOfEmails, project.accountManager.email, project.projectManager.email, 'am@pangea.global' ]
	for (let contactEmail of allArrayOfEmail) {
		const pdf = await getPdf(allUnits, allSettingsSteps, project)
		const attachments = [ { content: fs.createReadStream(pdf), filename: 'quote.pdf' } ]
		await clientQuoteToEmails(project.accountManager, {
			email: contactEmail,
			attachments,
			subject: `${ subject } ${ project.projectId } - ${ project.projectName } (ID ${ messageId })`
		}, dynamicClientName(message, contactEmail, project))
		fs.unlink(pdf, (err) => {
			if (err) console.log(err)
		})
	}
}

const sendQuoteMessage = async (project, message, arrayOfEmails, tasksIds = []) => {
	const { allUnits, allSettingsSteps } = await allUnitsAndSteps()
	let subject = project.isUrgent ? 'URGENT! Decide on a Quote:' : 'Decide on a Quote:'
	let messageId = 'C001.0'
	if (project.isPriceUpdated) {
		messageId = 'C001.1'
		subject += ' (UPDATED)'
	}

	const allArrayOfEmail = [ ...arrayOfEmails, project.accountManager.email, project.projectManager.email, 'am@pangea.global' ]

	for (let contactEmail of allArrayOfEmail) {
		const pdf = tasksIds.length ? await getPdf(allUnits, allSettingsSteps, project, tasksIds) : await getPdf(allUnits, allSettingsSteps, project)
		const attachments = [ { content: fs.createReadStream(pdf), filename: 'quote.pdf' } ]
		await clientQuoteToEmails(project.accountManager, {
			email: contactEmail,
			attachments,
			subject: `${ subject } ${ project.projectId } - ${ project.projectName } (ID ${ messageId })`
		}, dynamicClientName(message, contactEmail, project))
		fs.unlink(pdf, (err) => {
			if (err) console.log(err)
		})
	}
}

function dynamicClientName(message, contactEmail, project) {
	const currentContactIndex = project.clientContacts.findIndex(item => item.email === contactEmail)
	if (currentContactIndex !== -1) {
		const { firstName, surname } = project.clientContacts[currentContactIndex]
		const clientName = `<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ firstName } ${ surname || "" }</span></p>`
		return message.replace(`<div id="client-name-row">&nbsp;</div>`, clientName)
	} else {
		return message
	}
}

// async function getQuoteInfo(projectId, tasksIds) {
// 	try {
// 		const project = await getProject({ '_id': projectId })
// 		const service = await getService({ '_id': project.tasks[0].service })
// 		let quote = { ...project._doc, id: project.id }
// 		quote.selectedTasks = tasksIds.length ? project.tasks.filter(task => tasksIds.includes(task.taskId)) : []
// 		quote.service = service.title
// 		return quote
// 	} catch (err) {
// 		console.log(err)
// 		console.log("Error in getQuoteInfo")
// 	}
// }

async function stepCompletedNotifyPM(project, step) {
	const { projectManager, accManager } = await getAMPMbyProject(project)
	const subject = `Step completed: ${ step.stepId } - ${ step.name } - ${ project.projectName } (I003.0)`
	const messagePM = stepCompletedMessage({ ...project._doc, step }, projectManager)

	// TODO (refactoring later, temporary hide notification for AM)
	// const messageAM = stepCompletedMessage({ ...project._doc, step }, accManager)
	try {
		await sendEmail({ to: project.projectManager.email, subject }, messagePM)

		// TODO (refactoring later, temporary hide notification for AM)
		// await sendEmail({ to: project.accountManager.email, subject }, messageAM)
	} catch (err) {
		console.log(err)
		console.log("Error in stepCompletedNotifyPM")
	}
}

async function taskCompleteNotifyPM(project, task) {
	const { projectManager, accManager } = await getAMPMbyProject(project)
	const messagePM = await getPMnotificationMessage(project, task, projectManager)

	// TODO (refactoring later, temporary hide notification for AM)
	// const messageAM = await getPMnotificationMessage(project, task, accManager)
	try {
		await managerNotifyMail({ email: project.projectManager.email }, messagePM, `Task is ready for DR1: ${ task.taskId } - ${ project.projectName } (I008.0)`)

		// TODO (refactoring later, temporary hide notification for AM)
		//await managerNotifyMail({ email: project.accountManager.email }, messageAM, `Task is ready for DR1: ${ task.taskId } - ${ project.projectName } (ID I008.0)`)
	} catch (err) {
		console.log(err)
		console.log("Error in taskCompleteNotifyPM")
	}
}

async function getPMnotificationMessage(project, task, user) {
	try {
		const service = await getService({ "_id": task.service })
		return managerTaskCompleteNotificationMessage({ ...project._doc, service: service.title, task }, user)
	} catch (err) {
		console.log(err)
		console.log("Error in getPMnotificationMessage")
	}
}

async function notifyClientDeliverablesReady({ project, contacts, type, entityId }) {
	contacts.push({ email: 'am@pangea.global', firstName: 'Account Managers' })
	const allLanguages = await Languages.find()
	let { tasksDR2, projectName, tasks: projectTasks } = project
	const accManager = await User.findOne({ "_id": project.accountManager.id })


	try {
		if (type === 'single') {
			const deliverableObj = tasksDR2.singleLang.find(({ _id }) => `${ _id }` === `${ entityId }`)
			const { deliveryInternalId, sourceLanguage, targetLanguage } = deliverableObj
			const { lang: source } = allLanguages.find(({ _id }) => `${ _id }` === `${ sourceLanguage }`)
			const { lang: target } = allLanguages.find(({ _id }) => `${ _id }` === `${ targetLanguage }`)
			const langPair = source === target ? target : `${ source } >> ${ target }`

			const languagesAndServices = {
				languages: [ langPair ]
			}

			for (let contact of contacts) {
				const message = getNotifyDeliveryMessage({
					deliveryName: deliverableObj.deliveryName || projectName,
					languagesAndServices,
					contact,
					accManager,
					projectId: project.projectId,
					id: project._id
				})
				const subject = `DELIVERY Notification: ${ deliveryInternalId } - ${ deliverableObj.deliveryName || projectName } (C006.2)`
				await sendEmail({ to: contact.email, subject }, message)
			}
		}
		if (type === 'multi') {
			const deliverableObj = tasksDR2.multiLang.find(({ _id }) => `${ _id }` === `${ entityId }`)
			const { deliveryInternalId, tasks } = deliverableObj
			projectTasks = projectTasks.filter(item => tasks.includes(item.taskId))

			const languagesAndServices = projectTasks.reduce((acc, curr) => {
				const { lang: source } = allLanguages.find(({ symbol }) => `${ symbol }` === `${ curr.sourceLanguage }`)
				const { lang: target } = allLanguages.find(({ symbol }) => `${ symbol }` === `${ curr.targetLanguage }`)
				const langPair = source === target ? target : `${ source } >> ${ target }`
				if (!acc.languages.includes(langPair)) acc.languages.push(langPair)
				// if (!acc.services.includes(curr.service.title)) acc.services.push(curr.service.title)
				return acc
			}, { languages: [] })

			for (let contact of contacts) {
				const message = getNotifyDeliveryMessage({
					deliveryName: deliverableObj.deliveryName || projectName,
					languagesAndServices,
					contact,
					accManager,
					projectId: project.projectId,
					id: project._id
				})
				const subject = `DELIVERY Notification: ${ deliveryInternalId } - ${ deliverableObj.deliveryName || projectName } (C006.2)`
				await sendEmail({ to: contact.email, subject }, message)
			}
		}
	} catch (err) {
		console.log(err)
		console.log("Error in notifyClientDeliverablesReady")
	}
}

async function reSendClientManyDeliveries({ projectId, multi, single, contacts, comment, user }) {
	let project = await getProject({ "_id": projectId })
	const { projectId: srtProjectId, tasksDeliverables, accountManager, tasksDR2, tasks, projectName } = project

	const allLanguages = await Languages.find()
	const accManager = await User.findOne({ "_id": accountManager.id })

	let attachmentsPaths = []

	if (multi.length) {
		for await (let item of multi) {
			let slug = ''
			const deliverableObj = tasksDR2.multiLang.find(({ _id }) => `${ _id }` === `${ item._id }`)
			const { tasks: personalTasks } = deliverableObj
			const projectTasks = tasks.filter(item => personalTasks.includes(item.taskId))

			slug = projectTasks.reduce((acc, curr) => {
				const { lang: source } = allLanguages.find(({ symbol }) => `${ symbol }` === `${ curr.sourceLanguage }`)
				const { lang: target } = allLanguages.find(({ symbol }) => `${ symbol }` === `${ curr.targetLanguage }`)
				const languages = source === target ? target : `${ source } to ${ target }`
				acc = acc + `"${ languages } - ${ curr.service.title }", `
				return acc
			}, '')

			const { path, _id: deliverablesId } = tasksDeliverables.find(({ deliverablesId }) => `${ deliverablesId }` === `${ item._id }`)
			const filename = `${ slug }deliverables.zip`
			attachmentsPaths.push({ filename, path })

			await Projects.updateOne({ "_id": projectId, "tasksDeliverables._id": deliverablesId }, { $set: { "tasksDeliverables.$.deliveredAt": new Date() } })
		}
	}

	if (single.length) {
		for await (let item of single) {
			let slug = ''
			const { sourceLanguage, targetLanguage, files } = tasksDR2.singleLang.find(({ _id }) => `${ _id }` === `${ item._id }`)
			const personalTasks = [ ...new Set(files.map(item => item.taskId)) ]
			const projectTasks = tasks.filter(item => personalTasks.includes(item.taskId))
			const { lang: source } = allLanguages.find(({ _id }) => `${ _id }` === `${ sourceLanguage }`)
			const { lang: target } = allLanguages.find(({ _id }) => `${ _id }` === `${ targetLanguage }`)
			const languages = source === target ? target : `${ source } to ${ target }`
			slug = projectTasks.reduce((acc, curr) => {
				acc = acc + `"${ languages } - ${ curr.service.title }", `
				return acc
			}, '')

			const { path, _id: deliverablesId } = tasksDeliverables.find(({ deliverablesId }) => `${ deliverablesId }` === `${ item._id }`)
			const filename = `${ slug }deliverables.zip`
			attachmentsPaths.push({ filename, path })

			await Projects.updateOne({ "_id": projectId, "tasksDeliverables._id": deliverablesId }, { $set: { "tasksDeliverables.$.deliveredAt": new Date() } })
		}
	}

	contacts.push({ email: 'am@pangea.global', firstName: 'Account Managers' })
	const subject = `DELIVERY: ${ srtProjectId } - ${ projectName } (C006.0)`
	for await (let contact of contacts) {
		const finalAttachments = attachmentsPaths.map(item => ({ filename: item.filename, path: `./dist${ item.path }` }))

		const message = projectDeliveryMessage({ comment, contact, accManager, projectId: srtProjectId, projectName: projectName, id: projectId })
		await sendEmail({ to: contact.email, attachments: finalAttachments, subject }, message)
	}
}

async function sendClientManyDeliveries({ projectId, entitiesForDeliver, user, contacts, comment }) {
	contacts.push({ email: 'am@pangea.global', firstName: 'Account Managers' })
	let updatedProject = await getProject({ "_id": projectId })
	const allLanguages = await Languages.find()

	for (const { entityId, type } of entitiesForDeliver) {
		updatedProject = await createArchiveForDeliverableItem({
			type,
			entityId,
			projectId,
			user,
			tasksDR2: updatedProject.tasksDR2,
			tasksDeliverables: updatedProject.tasksDeliverables
		})
	}

	let attachmentsPaths = []
	for (const { entityId, type } of entitiesForDeliver) {
		let slug = ''

		if (type === 'single') {
			const { sourceLanguage, targetLanguage, files } = updatedProject.tasksDR2.singleLang.find(({ _id }) => `${ _id }` === `${ entityId }`)
			const tasks = [ ...new Set(files.map(item => item.taskId)) ]
			const projectTasks = updatedProject.tasks.filter(item => tasks.includes(item.taskId))
			const { lang: source } = allLanguages.find(({ _id }) => `${ _id }` === `${ sourceLanguage }`)
			const { lang: target } = allLanguages.find(({ _id }) => `${ _id }` === `${ targetLanguage }`)
			const languages = source === target ? target : `${ source } to ${ target }`
			slug = projectTasks.reduce((acc, curr) => {
				acc = acc + `"${ languages } - ${ curr.service.title }", `
				return acc
			}, '')
		}

		if (type === 'multi') {
			const deliverableObj = updatedProject.tasksDR2.multiLang.find(({ _id }) => `${ _id }` === `${ entityId }`)
			const { tasks } = deliverableObj
			const projectTasks = updatedProject.tasks.filter(item => tasks.includes(item.taskId))

			slug = projectTasks.reduce((acc, curr) => {
				const { lang: source } = allLanguages.find(({ symbol }) => `${ symbol }` === `${ curr.sourceLanguage }`)
				const { lang: target } = allLanguages.find(({ symbol }) => `${ symbol }` === `${ curr.targetLanguage }`)
				const languages = source === target ? target : `${ source } to ${ target }`
				acc = acc + `"${ languages } - ${ curr.service.title }", `
				return acc
			}, '')
		}

		const { path } = updatedProject.tasksDeliverables.find(({ deliverablesId }) => `${ deliverablesId }` === `${ entityId }`)
		const filename = `${ slug }deliverables.zip`
		attachmentsPaths.push({ filename, path })
	}

	const accManager = await User.findOne({ "_id": updatedProject.accountManager.id })
	const subject = `DELIVERY: ${ updatedProject.projectId } - ${ updatedProject.projectName } (C006.0)`
	for await (let contact of contacts) {
		const finalAttachments = attachmentsPaths.map(item => ({ filename: item.filename, path: `./dist${ item.path }` }))

		const message = projectDeliveryMessage({ comment, contact, accManager, projectId: updatedProject.projectId, projectName: updatedProject.projectName, id: updatedProject._id })
		await sendEmail({ to: contact.email, attachments: finalAttachments, subject }, message)
	}

	return updatedProject
}

async function sendClientDeliveries({ projectId, type, entityId, user, contacts, comment }) {
	contacts.push({ email: 'am@pangea.global', firstName: 'Account Managers' })
	const allLanguages = await Languages.find()

	try {
		let { tasksDR2, tasksDeliverables, projectName, tasks: projectTasks } = await getProject({ "_id": projectId })
		const updatedProject = await createArchiveForDeliverableItem({ type, entityId, projectId, user, tasksDR2, tasksDeliverables })

		const accManager = await User.findOne({ "_id": updatedProject.accountManager.id })

		const { path } = updatedProject.tasksDeliverables.find(({ deliverablesId }) => `${ deliverablesId }` === `${ entityId }`)
		const content = fs.createReadStream(`./dist${ path }`)
		const attachments = [ { filename: "deliverables.zip", content } ]

		if (type === 'single') {
			const deliverableObj = tasksDR2.singleLang.find(({ _id }) => `${ _id }` === `${ entityId }`)
			const { deliveryInternalId, sourceLanguage, targetLanguage, files } = deliverableObj

			// const tasks = [ ...new Set(files.map(item => item.taskId)) ]
			// projectTasks = projectTasks.filter(item => tasks.includes(item.taskId))
			// const languagesAndServices = projectTasks.reduce((acc, curr) => {
			// 	if (!acc.services.includes(curr.service.title)) acc.services.push(curr.service.title)
			// 	return acc
			// }, { services: [] })

			const { lang: source } = allLanguages.find(({ _id }) => `${ _id }` === `${ sourceLanguage }`)
			const { lang: target } = allLanguages.find(({ _id }) => `${ _id }` === `${ targetLanguage }`)
			const langPair = source === target ? target : `${ source } >> ${ target }`

			const languagesAndServices = {
				languages: [ langPair ]
			}

			const subject = `DELIVERY: ${ deliveryInternalId } - ${ deliverableObj.deliveryName || projectName } (C006.3)`

			for await (let contact of contacts) {
				const finalAttachments = attachments.map(item => ({ filename: `${ item.filename }`, path: `./dist${ path }` }))
				const message = getDeliveryMessage({
					deliveryName: deliverableObj.deliveryName || projectName,
					comment,
					languagesAndServices,
					contact,
					accManager,
					projectId: updatedProject.projectId,
					projectName: updatedProject.projectName,
					id: updatedProject._id
				})
				await sendEmail({ to: contact.email, attachments: finalAttachments, subject }, message)
			}
		}

		if (type === 'multi') {
			const deliverableObj = tasksDR2.multiLang.find(({ _id }) => `${ _id }` === `${ entityId }`)
			const { deliveryInternalId, tasks } = deliverableObj
			projectTasks = projectTasks.filter(item => tasks.includes(item.taskId))

			const languagesAndServices = projectTasks.reduce((acc, curr) => {
				const { lang: source } = allLanguages.find(({ symbol }) => `${ symbol }` === `${ curr.sourceLanguage }`)
				const { lang: target } = allLanguages.find(({ symbol }) => `${ symbol }` === `${ curr.targetLanguage }`)
				const langPair = source === target ? target : `${ source } >> ${ target }`
				if (!acc.languages.includes(langPair)) acc.languages.push(langPair)
				// if (!acc.services.includes(curr.service.title)) acc.services.push(curr.service.title)
				return acc
			}, { languages: [] })

			const subject = `DELIVERY: ${ deliveryInternalId } - ${ deliverableObj.deliveryName || projectName } (C006.3)`

			for await (let contact of contacts) {
				const finalAttachments = attachments.map(item => ({ filename: `${ item.filename }`, path: `./dist${ path }` }))
				const message = getDeliveryMessage({
					deliveryName: deliverableObj.deliveryName || projectName,
					comment,
					languagesAndServices,
					contact,
					accManager,
					projectId: updatedProject.projectId,
					projectName: updatedProject.projectName,
					id: updatedProject._id
				})
				await sendEmail({ to: contact.email, attachments: finalAttachments, subject }, message)
			}
		}

		return updatedProject
	} catch (err) {
		console.log(err)
		console.log("Error in sendClientDeliveries")
	}
}

// TODO check (I0010.0)
// async function notifyDeliverablesDownloaded(taskId, project, user) {
// 	try {
// 		const { projectManager, accManager } = await getAMPMbyProject(project)
// 		const messagePM = deliverablesDownloadedMessage({ manager: projectManager, taskId, projectName: project.projectName, project_id: project.projectId, _id: project._id }, user)
// 		const messageAM = deliverablesDownloadedMessage({ manager: accManager, taskId, projectName: project.projectName, project_id: project.projectId, _id: project._id }, user)
// 		await managerNotifyMail({ email: project.projectManager.email, ...projectManager }, messagePM, `Task delivered: ${ taskId } - ${ project.projectName } (I0010.0)`)
// 		await managerNotifyMail({ email: project.accountManager.email, ...accManager }, messageAM, `Task delivered: ${ taskId } - ${ project.projectName } (I0010.0)`)
// 	} catch (err) {
// 		console.log(err)
// 		console.log("Error in notifyDeliverablesDownloaded")
// 	}
// }


async function notifyManagerStepStarted(project, step) {
	const { projectManager } = await getAMPMbyProject(project)
	const subject = `Step started: ${ step.stepId } - ${ project.projectName } (I002.0)`
	const messagePM = stepStartedMessage({ ...project._doc, step }, projectManager)
	try {
		await sendEmail({ to: project.projectManager.email, subject }, messagePM)
	} catch (err) {
		console.log(err)
		console.log("Error in notifyManagerStepStarted")
	}
}

async function notifyStepDecisionMade({ project, step, decision }) {
	const { projectManager } = await getAMPMbyProject(project)
	const messageId = decision === 'accept' ? 'I006.0' : 'I007.0'
	const subject = `Vendor: ${ step.vendor.firstName } ${ step.vendor.surname || '' } ${ decision === 'accept' ? 'approved' : 'rejected' } the job: ${ step.stepId } - ${ project.projectName } (ID ${ messageId })`
	const messagePM = stepDecisionMessage({ project, step, decision }, projectManager)
	try {
		await sendEmail({ to: project.projectManager.email, subject }, messagePM)
	} catch (err) {
		console.log(err)
		console.log("Error in notifyStepDecisionMade")
	}
}

async function getAMPMbyProject(project) {
	const { projectManager, accountManager } = project
	return {
		projectManager: await User.findOne({ "_id": projectManager.id }),
		accManager: await User.findOne({ "_id": accountManager._id })
	}
}

async function notifyStepReopened(steps, projectId) {
	try {
		for (let step of steps) {
			const message = stepReopenedMessage(step)
			step["to"] = step.vendor.email
			step.subject = `Step has been reopened: ${ step.stepId } (${ step.serviceStep.title }) (ID V007.0)`
			await sendEmail(step, message)
		}
	} catch (err) {
		console.log(err)
		console.log("Error in notfyStepsReopen")
	}
}

async function notifyVendorStepStart(steps, allSteps, project) {
	const stepIds = steps.length ? steps.map(item => item._id) : steps
	try {
		const notifyingSteps = allSteps.filter(item => {
			if (stepIds.length) {
				// return (item.status === 'Ready to Start' || item.status === 'Approved' || item.status === 'Waiting to Start')   && stepIds.indexOf(item.id) !== -1
				return (item.status === 'Ready to Start' )   && stepIds.indexOf(item.id) !== -1
			}
			return item.status === 'Ready to Start'
		})
		if (notifyingSteps.length) {
			for (let step of notifyingSteps) {
				const message = stepReadyToStartMessage({ step, project })
				step["to"] = step.vendor.email
				step.subject = `Step ${ step.stepId }: ${ project.projectName } is ready to start (ID V001.2)`
				await sendEmail(step, message)
			}
		}
	} catch (err) {
		console.log(err)
		console.log("Error in notifyVendorStepStart")
		throw new Error(err.message)
	}
}

const nextVendorCanStartWorkNotification = async ({ task, steps, jobId }) => {
	const { service, taskId } = task
	const { steps: serviceSteps } = service
	const { serviceStep: { step: stepId } } = steps.find(({ _id }) => `${ _id }` === `${ jobId }`)

	const { stage } = serviceSteps.find(({ step }) => `${ typeof step === 'string' ? step : step._id }` === `${ stepId }`)

	if (serviceSteps.length === 2 && stage === 'stage1') {
		const [ firstStep, secondStep ] = steps
				.filter(({ taskId: id }) => id === taskId)
				.filter(({ status }) => status !== 'Cancelled' && status !== 'Cancelled Halfway')

		if (!!secondStep.vendor) {
			const message = vendorCanStartStartedSecondStep({ vendor: secondStep.vendor, step: secondStep })
			const subject = `STEP-${ secondStep.name } is ready to start (V001.21)`
			await sendEmail({ to: secondStep.vendor.email, subject }, message)
		}
	}

}


module.exports = {
	nextVendorCanStartWorkNotification,
	stepCancelNotifyVendor,
	taskCompleteNotifyPM,
	notifyClientDeliverablesReady,
	sendClientDeliveries,
	// notifyDeliverablesDownloaded,
	notifyManagerStepStarted,
	stepCompletedNotifyPM,
	notifyStepDecisionMade,
	getQuoteMessage,
	notifyStepReopened,
	notifyVendorStepStart,
	sendQuoteMessage,
	getCostMessage,
	sendCostQuoteMessage,
	sendClientManyDeliveries,
	reSendClientManyDeliveries
}

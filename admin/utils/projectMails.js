const { User, Projects, Services, Units } = require('../models')
const { managerNotifyMail, sendEmail, clientQuoteEmail, clientQuoteToEmails, sendEmailFromUser } = require('./mailTemplate')
const { managerAssignmentNotifyingMessage, managersAndClientAcceptedMessage, managersAndClientRejectedMessage } = require('../emailMessages/internalCommunication')
const { requestMessageForVendor, vendorReassignmentMessage, vendorMiddleReassignmentMessage, vendorMiddleAssignmentMessage } = require("../emailMessages/vendorCommunication")
const { generatePOFile } = require('../projects/files')
const fs = require('fs')

async function notifyManagerProjectRejected(project) {
	try {
		const accountManager = await User.findOne({ "_id": project.accountManager.id }).lean()
		const projectManager = await User.findOne({ "_id": project.projectManager._id }).lean()
		const contacts = project.clientContacts

		for await (let contact of contacts) {
			const message = managersAndClientRejectedMessage({ ...project._doc, ...contact })
			await managerNotifyMail(projectManager, message, `Quote ${ project.projectId } - ${ project.projectName } has been rejected (C003.1)`)
		}

		const messagePM = managersAndClientRejectedMessage({ ...project._doc, ...projectManager })
		await managerNotifyMail(projectManager, messagePM, `Quote ${ project.projectId } - ${ project.projectName } has been rejected (C003.1)`)

		const messageAM = managersAndClientRejectedMessage({ ...project._doc, ...accountManager })
		await managerNotifyMail(accountManager, messageAM, `Quote ${ project.projectId } - ${ project.projectName } has been rejected (C003.1)`)

	} catch (err) {
		console.log(err)
		console.log("Error in notifyManagerProjectRejected")
	}
}

async function notifyManagerProjectStarts(project) {
	try {
		const notAssignedStep = project.steps.find(item => !item.vendor)
		const projectManager = await User.findOne({ "_id": project.projectManager._id }).lean()
		const accountManager = await User.findOne({ "_id": project.accountManager._id }).lean()
		const contacts = project.clientContacts

		const messageToAM = managersAndClientAcceptedMessage({ ...project._doc, ...accountManager })
		await managerNotifyMail(accountManager, messageToAM, `Quote ${ project.projectId } - ${ project.projectName } has been accepted (C002.1)`)

		for await (let contact of contacts) {
			const message = managersAndClientAcceptedMessage({ ...project._doc, ...contact })
			await managerNotifyMail(contact, message, `Quote ${ project.projectId } - ${ project.projectName } has been accepted (C002.1)`)
		}

		if (notAssignedStep) {
			const pmMessage = managerAssignmentNotifyingMessage({ ...project._doc, ...projectManager })
			await managerNotifyMail(projectManager, pmMessage, `Quote Accepted: ${ project.projectId } - ${ project.projectName }, missing Vendors (I001.0)`)
		} else {
			const messageToPM = managersAndClientAcceptedMessage({ ...project._doc, ...projectManager })
			await managerNotifyMail(projectManager, messageToPM, `Quote ${ project.projectId } - ${ project.projectName } has been accepted (C002.1)`)
		}

	} catch (err) {
		console.log(err)
		console.log("Error in notifyManagerProjectStarts")
	}
}

async function sendQuoteToVendorsAfterProjectAccepted(projectSteps, project) {
	let steps = []
	try {
		for (let step of projectSteps) {
			if (!!step.vendor && step.status === 'Created') {
				step.status = "Request Sent"
				await sendRequestToVendor(project, step)
				const index = step.vendorsClickedOffer.indexOf(step.vendor._id)
				if (index !== -1) step.vendorsClickedOffer.splice(index, 1)
			}
			steps.push(step)
		}
		return steps
	} catch (err) {
		console.log(err)
		console.log("Error in sendQuoteToVendorsAfterProjectAccepted")
	}
}

async function stepReassignedNotification(step, reason) {
	try {
		const { vendor, status, stepId } = step
		if (status === 'Created') return

		const message = vendorReassignmentMessage(step, reason)
		await sendEmail({ to: vendor.email, subject: `Step ${ stepId } has been reassigned (ID V001.1)` }, message)
	} catch (err) {
		console.log(err)
		console.log("Error in stepReassignedNotification")
	}
}

async function stepMiddleReassignedNotification(step, reason, isPay) {
	try {
		const allUnits = await Units.find()
		const message = vendorMiddleReassignmentMessage(allUnits, step, reason, isPay)
		const subject = `Step ${ step.stepId } has been reassigned to another vendor (ID V002.0)`
		await sendEmail({ to: step.vendor.email, subject }, message)
	} catch (err) {
		console.log(err)
		console.log("Error in stepMiddleReassignedNotification")
	}
}

async function stepMiddleAssignNotification(step, isStart) {
	try {
		const message = vendorMiddleAssignmentMessage({ step, isStart })
		const subject = `Step ${ step.stepId } has been reassigned to you (ID V002.1)`
		await sendEmail({ to: step.vendor.email, subject }, message)
	} catch (err) {
		console.log(err)
		console.log("Error in stepMiddleAssignNotification")
	}
}

async function stepVendorsRequestSending(project, checkedSteps) {
	try {
		let steps = [ ...project.steps ]
		const assignedStepsCheck = checkedSteps.map(item => item.stepId.toString())
		for await (let step of steps) {
			if (assignedStepsCheck.indexOf(step.stepId.toString()) !== -1 && step.status === 'Created') {
				await sendRequestToVendor(project, step)
				step.status = "Request Sent"
			}
		}
		return steps
	} catch (err) {
		console.log(err)
		console.log("Error in stepVendorsRequestSending")
	}
}

async function stepEmailToVendor(project, step) {
	try {
		let steps = [ ...project.steps ]
		await sendRequestToVendor(project, step)
		return steps.map(item => {
			if (step.taskId === item.taskId && step.name === item.name) {
				item.status = "Request Sent"
				return item
			}
			return item
		})
	} catch (err) {
		console.log(err)
		console.log("Error in stepEmailToVendor")
	}
}

async function sendRequestToVendor(project, step) {
	try {
		let requestInfo = { ...step._doc }
		requestInfo.projectId = project.id
		requestInfo.projectName = project.projectName
		requestInfo.industry = project.industry.name
		requestInfo.brief = project.brief
		const message = requestMessageForVendor(requestInfo, project._id)

		const pdf = await generatePOFile(requestInfo, project)
		const attachments = [ { content: fs.createReadStream(pdf), filename: 'PO.pdf' } ]

		await sendEmailFromUser(project.projectManager, {
			to: step.vendor.email,
			attachments,
			subject: `Availability approval for a Step ${ step.stepId } (${ step.serviceStep.title }) (ID V001.0)`
		}, message)
		fs.unlink(pdf, (err) => {
			if (err) console.log(err)
		})
	} catch (err) {
		console.log(err)
		console.log('Error in sendRequestToVendor')
	}
}

function getAccManagerAndContact(project) {
	const accManager = project.accountManager
	const contact = project.customer.contacts.find(item => item.leadContact)
	return { accManager, contact }
}

async function notifyClientProjectCancelled(project, template) {
	try {
		const message = template
		const messageId = project.status === "Cancelled" ? "C005.0" : "C008.0"
		const subject = project.status === "Cancelled" ? "Project cancelled" : "Project has been cancelled in the middle of the work"

		for (let contactEmail of project.clientContacts.map(item => item.email)) {
			await clientQuoteToEmails(project.accountManager, {
				email: contactEmail,
				subject: `${ subject } ${ project.projectId } - ${ project.projectName } (ID ${ messageId })`
			}, dynamicClientName(message, contactEmail, project))
		}
	} catch (err) {
		console.log(err)
		console.log('Error in notifyClientProjectCancelled')
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

async function notifyClientTasksCancelled(project, template) {
	try {
		// const { contact } = getAccManagerAndContact(project);
		const message = template
		const subject = `Task(s) has been cancelled in the middle of the work (ID C008.1)`

		for (let contactEmail of project.clientContacts.map(item => item.email)) {
			await sendEmail({ to: contactEmail, subject }, dynamicClientName(message, contactEmail, project))
		}
	} catch (err) {
		console.log(err)
		console.log('Error in notifyClientTasksCancelled')
	}
}

module.exports = {
	notifyManagerProjectStarts,
	notifyManagerProjectRejected,
	stepVendorsRequestSending,
	stepEmailToVendor,
	stepReassignedNotification,
	notifyClientProjectCancelled,
	notifyClientTasksCancelled,
	stepMiddleReassignedNotification,
	stepMiddleAssignNotification,
	sendQuoteToVendorsAfterProjectAccepted
}
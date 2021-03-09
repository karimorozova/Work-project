const { User, Projects, Services, Units } = require('../models');
const { managerNotifyMail, sendEmail, clientQuoteEmail, clientQuoteToEmails, sendEmailFromUser } = require('./mailTemplate');
const { managerAssignmentNotifyingMessage, managerProjectAcceptedMessage, managerProjectRejectedMessage } = require('../emailMessages/internalCommunication');
const { emailMessageForContact } = require("../emailMessages/clientCommunication");
const { requestMessageForVendor, vendorReassignmentMessage, vendorMiddleReassignmentMessage, vendorMiddleAssignmentMessage } = require("../emailMessages/vendorCommunication");

async function notifyManagerProjectRejected(project) {
	try {
		const accManager = await User.findOne({ "_id": project.accountManager.id });
		const message = managerProjectRejectedMessage({ ...project._doc, accManager: accManager.firstName });
		await managerNotifyMail(accManager, message, `Quote Rejected ${ project.projectId } - ${ project.projectName } (ID C003.0)`);
	} catch (err) {
		console.log(err);
		console.log("Error in notifyManagerProjectRejected");
	}
}

async function notifyManagerProjectStarts(project) {
	try {
		const projectManager = await User.findOne({ "_id": project.projectManager._id });
		const accountManager = await User.findOne({ "_id": project.accountManager._id });
		const steps = await notifyVendorsProjectAccepted(project.steps, project);
		await Projects.updateOne({ "_id": project._id }, { steps });
		const notAssignedStep = steps.find(item => !item.vendor);
		if(notAssignedStep) {
			await managerEmailsSend({ project, projectManager, accountManager });
		} else {
			await notifyMangerProjectAppoved({ project, projectManager, accountManager })
		}
	} catch (err) {
		console.log(err);
		console.log("Error in notifyManagerProjectStarts");
	}
}

async function notifyMangerProjectAppoved({ project, projectManager, accountManager }) {
	try {
		const messageAM = managerProjectAcceptedMessage({ ...project._doc, accManager: accountManager.firstName });
		const messagePM = managerProjectAcceptedMessage({ ...project._doc, accManager: projectManager.firstName });
		await managerNotifyMail(accountManager, messageAM, `Quote Accepted ${ project.projectId } - ${ project.projectName } (ID C002.0)`);
		await managerNotifyMail(projectManager, messagePM, `Quote Accepted ${ project.projectId } - ${ project.projectName } (ID C002.0)`);
	} catch (err) {
		console.log(err);
		console.log("Error in notifyMangerProjectAppoved");
	}
}

async function notifyVendorsProjectAccepted(projectSteps, project) {
	let steps = [];
	try {
		for (let step of projectSteps) {
			if(!!step.vendor && step.status === 'Created') {
				step.status = "Request Sent"
				await sendRequestToVendor(project, step);
				const index = step.vendorsClickedOffer.indexOf(step.vendor._id);
				if(index !== -1) step.vendorsClickedOffer.splice(index, 1);
			}
			steps.push(step);
		}
		return steps;
	} catch (err) {
		console.log(err);
		console.log("Error in notifyVendorsProjectAccepted");
	}
}

async function managerEmailsSend({ project, projectManager, accountManager }) {
	try {
		const pmMessageObj = { ...project._doc, user: { ...projectManager._doc, id: projectManager.id } };
		const smMessageObj = { ...project._doc, user: { ...accountManager._doc, id: accountManager.id } };
		const pmMessage = managerAssignmentNotifyingMessage(pmMessageObj);
		const smMessage = managerAssignmentNotifyingMessage(smMessageObj);
		await managerNotifyMail(projectManager, pmMessage, `Quote Accepted: ${ project.projectId } - ${ project.projectName } (ID I001.0)`);
		await managerNotifyMail(accountManager, smMessage, `Quote Accepted: ${ project.projectId } - ${ project.projectName } (ID I001.0)`);
	} catch (err) {
		console.log(err);
		console.log("Error in managerEmailsSend");
	}
}

async function stepReassignedNotification(step, reason) {
	try {
		const message = vendorReassignmentMessage(step, reason);
		await sendEmail({ to: step.vendor.email, subject: `Step ${ step.stepId } has been reassigned (ID V001.1)` }, message);
	} catch (err) {
		console.log(err);
		console.log("Error in stepReassignedNotification")
	}
}

async function stepMiddleReassignedNotification(step, reason, isPay) {
	try {
		const allUnits = await Units.find();
		const message = vendorMiddleReassignmentMessage(allUnits, step, reason, isPay);
		const subject = `Step ${ step.stepId } has been reassigned to another vendor (ID V002.0)`;
		await sendEmail({ to: step.vendor.email, subject }, message);
	} catch (err) {
		console.log(err);
		console.log("Error in stepMiddleReassignedNotification");
	}
}

async function stepMiddleAssignNotification(step, isStart) {
	try {
		const message = vendorMiddleAssignmentMessage({ step, isStart });
		const subject = `Step ${ step.stepId } has been reassigned to you (ID V002.1)`;
		await sendEmail({ to: step.vendor.email, subject }, message);
	} catch (err) {
		console.log(err);
		console.log("Error in stepMiddleAssignNotification");
	}
}

async function stepVendorsRequestSending(project, checkedSteps) {
	try {
		let steps = [...project.steps];
		const assignedStepsCheck = checkedSteps.map(item => item.stepId.toString());
		for (let step of steps) {
			if(assignedStepsCheck.indexOf(step.stepId.toString()) !== -1 && step.status === 'Created' ) {
				await sendRequestToVendor(project, step);
				step.status = "Request Sent"
			}
		}
		return steps;
	} catch (err) {
		console.log(err);
		console.log("Error in stepVendorsRequestSending")
	}
}

async function stepEmailToVendor(project, step) {
	try {
		let steps = [...project.steps];
		await sendRequestToVendor(project, step);
		return steps.map(item => {
			if(step.taskId === item.taskId && step.name === item.name) {
				item.status = "Request Sent";
				return item;
			}
			return item;
		});
	} catch (err) {
		console.log(err);
		console.log("Error in stepEmailToVendor")
	}
}

async function sendRequestToVendor(project, step) {
	try {
		let requestInfo = { ...step._doc };
		requestInfo.projectId = project.id;
		requestInfo.projectName = project.projectName;
		requestInfo.industry = project.industry.name;
		requestInfo.brief = project.brief;
		const message = requestMessageForVendor(requestInfo);
		await sendEmailFromUser(project.projectManager,{ to: step.vendor.email, subject: `Availability approval for a Step ${ step.stepId } (${ step.serviceStep.title }) (ID V001.0)` }, message);
	} catch (err) {
		console.log(err);
		console.log('Error in sendRequestToVendor');
	}
}

async function sendEmailToContact(project, contact) {
	try {
		let projectInfo = { ...project._doc };
		projectInfo.firstName = contact.firstName;
		projectInfo.surname = contact.surname;
		const service = await Services.findOne({ "_id": project.tasks[0].service });
		projectInfo.service = service.title;
		const message = emailMessageForContact(projectInfo);
		await clientQuoteEmail({ contact, subject: `Project information (ID C006, ${ project.projectId } - ${ project.projectName })` }, message);
	} catch (err) {
		console.log(err);
		console.log('Error in sendEmailToContact');
	}
}

function getAccManagerAndContact(project) {
	const accManager = project.accountManager;
	const contact = project.customer.contacts.find(item => item.leadContact);
	return { accManager, contact };
}

async function notifyClientProjectCancelled(project, template) {
	try {
		const message = template;
		const messageId = project.status === "Cancelled" ? "C005.0" : "C008.0";
		const subject = project.status === "Cancelled" ? "Project cancelled" : "Project has been cancelled in the middle of the work";

		for (let contactEmail of project.clientContacts.map(item => item.email)) {
			await clientQuoteToEmails(project.accountManager,{
				email: contactEmail,
				subject: `${ subject } ${ project.projectId } - ${ project.projectName } (ID ${ messageId })`
			}, dynamicClientName(message, contactEmail, project));
		}
	} catch (err) {
		console.log(err);
		console.log('Error in notifyClientProjectCancelled');
	}
}

function dynamicClientName(message, contactEmail, project) {
	const currentContactIndex = project.clientContacts.findIndex(item => item.email === contactEmail);
	if(currentContactIndex !== -1) {
		const { firstName, surname } = project.clientContacts[currentContactIndex];
		const clientName = `<p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ firstName } ${ surname || "" }</span></p>`;
		return message.replace(`<div id="client-name-row">&nbsp;</div>`, clientName)
	} else {
		return message;
	}
}

async function notifyClientTasksCancelled(project, template) {
	try {
		// const { contact } = getAccManagerAndContact(project);
		const message = template;
		const subject = `Task(s) has been cancelled in the middle of the work (ID C008.1)`;

		for (let contactEmail of project.clientContacts.map(item => item.email)) {
			await sendEmail({ to: contactEmail, subject }, dynamicClientName(message, contactEmail, project))
		}
	} catch (err) {
		console.log(err);
		console.log('Error in notifyClientTasksCancelled');
	}
}

module.exports = {
	notifyManagerProjectStarts,
	notifyManagerProjectRejected,
	stepVendorsRequestSending,
	stepEmailToVendor,
	sendEmailToContact,
	stepReassignedNotification,
	notifyClientProjectCancelled,
	notifyClientTasksCancelled,
	stepMiddleReassignedNotification,
	stepMiddleAssignNotification
};
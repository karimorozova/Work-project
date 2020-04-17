const { sendEmail, managerNotifyMail, clientQuoteEmail } = require("../utils/mailTemplate");
const { managerTaskCompleteNotificationMessage, deliverablesDownloadedMessage, stepStartedMessage, 
    stepCompletedMessage, stepDecisionMessage, readyForDr2Message } = require("../emailMessages/internalCommunication");
const { messageForClient, emailMessageForContact, taskReadyMessage, taskDeliveryMessage } = require("../emailMessages/clientCommunication");
const { stepCancelledMessage, stepMiddleCancelledMessage, stepReopenedMessage } = require("../emailMessages/vendorCommunication");
const { getProject } = require("./getProjects");
const { getService } = require("../services/getServices");
const { User } = require("../models");
const { getDeliverablesLink, getProjectDeliverables } = require("./files");
const fs = require('fs');

async function stepCancelNotifyVendor(steps, projectId) {
    try {
        const notifyStepStatuses = ["Cancelled", "Cancelled Halfway", "Completed"]
        for(let step of steps) {
            if(step.vendor && notifyStepStatuses.indexOf(step.status) === -1) {
                const message = step.status !== "Started" && step.status !== "Completed" ? 
                    stepCancelledMessage(step)
                    : stepMiddleCancelledMessage(step);
                step["to"] = step.vendor.email;
                const id = step.status === "Cancelled" ? "V003.1" : "V004.0";
                const subject = step.status === "Cancelled" ? "Step cancelled" : "Step cancelled in the middle";
                step.subject = `${subject}: ${step.stepId} (${step.serviceStep.title}) (ID ${id})`;
                await sendEmail(step, message);
            }
        }
    } catch(err) {
        console.log(err);
        console.log("Error in stepCancelNotifyVendor");
    }
}

async function getMessage(projectId, messageTarget) {
    try {
        let quote = await getQuoteInfo(projectId);
        const message = messageTarget === "quote" ? messageForClient(quote) : emailMessageForContact(quote);
        return message;
    } catch(err) {
        console.log(err);
        console.log("Error in getMessage");
    }
}

async function getQuoteInfo(projectId) {
    try {
        const project = await getProject({"_id": projectId});
        const service = await getService({"_id": project.tasks[0].service});
        let quote = {...project._doc, id: project.id};
        quote.service = service.title;
        const { contacts } = project.customer;
        quote.contact = contacts.find(item => item.leadContact);
        quote.firstName = quote.contact.firstName;
        quote.surname = quote.contact.surname;
        return quote;
    } catch(err) {
        console.log(err);
        console.log("Error in getQuoteInfo");
    }
}

async function stepCompletedNotifyPM(project, step) {
    const subject = `Step completed: ${step.stepId} ${project.projectName} (ID I003.0)`;
    const message = stepCompletedMessage({...project._doc, step});
    try {
        await sendEmail({to: project.projectManager.email, subject}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in stepCompletedNotifyPM");
    }
}

async function taskCompleteNotifyPM(project, task) {
    try {
        const manager = await User.findOne({"_id": project.projectManager.id}, {email: 1});
        const message = await getPMnotificationMessage(project, task);
        await managerNotifyMail(manager, message, `Task is ready for DR1: ${task.taskId} - ${project.projectName} (ID I008.0)`);
    } catch(err) {
        console.log(err);
        console.log("Error in taskCompleteNotifyPM");
    }
}

async function getPMnotificationMessage(project, task) {
    try {
        const service = await getService({"_id": task.service});
        return message = managerTaskCompleteNotificationMessage({
            ...project._doc,
            service: service.title,
            task
        })
    } catch(err) {
        console.log(err);
        console.log("Error in getPMnotificationMessage");
    }
}

async function notifyClientTaskReady({taskId, project, contacts}) {
    const notifyContacts = project.customer.contacts.filter(item => contacts.indexOf(item.email) !== -1);
    const task = project.tasks.find(item => item.taskId === taskId);
    try {
        for(let contact of notifyContacts) {
            const message = taskReadyMessage({task, contact, project});
            await sendEmail({to: contact.email, subject: `Task is ready: ${taskId} - ${task.service.title} (ID C006.2)`}, message);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notifyClientTaskReady");
    }
}

async function sendClientDeliveries({taskId, project, contacts}) {
    const notifyContacts = project.customer.contacts.filter(item => contacts.indexOf(item.email) !== -1);
    try {
        const accManager = await User.findOne({"_id": project.accountManager.id});
        const task = project.tasks.find(item => item.taskId === taskId);
        const subject = `Delivery: ${taskId} - ${task.service.title} (ID C006.1)`;
        const deliverables = task.deliverables || await getDeliverablesLink({taskId, taskFiles: task.targetFiles, projectId: project.id});
        const content = fs.createReadStream(`./dist${deliverables}`);
        const attachments = [{filename: "deliverables.zip", content}];
        for(let contact of notifyContacts) {
            const message = taskDeliveryMessage({task, contact, accManager, ...project._doc});
            await sendEmail({to: contact.email, attachments, subject}, message);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in sendClientDeliveries");
    }
}

async function notifyDeliverablesDownloaded(taskId, project) {
    try {
        const projectManager = await User.findOne({"_id": project.projectManager.id});
        const accManager = await User.findOne({"_id": project.customer.accountManager._id});
        const pmMessage = deliverablesDownloadedMessage({
            manager: projectManager, taskId, project_id: project.projectId})
        const accManagerMessage = deliverablesDownloadedMessage({
            manager: accManager, taskId, project_id: project.projectId})
        await managerNotifyMail(projectManager, pmMessage, `Task delivered: ${taskId} - ${project.projectName} (ID I010.0)`);
        await managerNotifyMail(accManager, accManagerMessage, `Task delivered: ${taskId} - ${project.projectName} (ID I010.0)`);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyDeliverablesDownloaded");
    }
}

async function notifyProjectDelivery(project) {
    const { customer } = project;
    const contact = customer.contacts.find(item => item.leadContact);
    const message = projectDeliveryMessage({...project._doc, contact, accManager: customer.accountManager});
    const subject = `Delivery: ${project.projectId} - ${project.projectName} (ID C006.0)`;
    try {
        const deliverables = project.deliverables || await getProjectDeliverables(project);
        const attachments = [{filename: "deliverables.zip", path: deliverables}];
        await sendEmail({to: contact.email, attachments, subject}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyProjectDelivery");
    }
}

async function notifyManagerStepStarted(project, step) {
    const subject = `Step started: ${step.stepId} - ${project.projectName} (ID I002.0)`;
    const message = stepStartedMessage({...project._doc, step});
    try {
        await sendEmail({to: project.projectManager.email, subject}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyManagerStepStarted");
    }
}

async function notifyStepDecisionMade({project, step, decision}) {
    const message = stepDecisionMessage({...project.doc, step, decision});
    const messageId = decision === 'accept' ? 'I006.0' : 'I007.0';
    const subject = `Vendor ${decision === 'accept' ? 'approved' : 'rejected'} the job: ${step.stepId} - ${project.projectName} (ID ${messageId})`;
    try {
        await sendEmail({to: project.projectManager.email, subject}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyManagerStepStarted");
    }
}

async function notifyReadyForDr2({dr2Manager, project, taskId}) {
    const message = readyForDr2Message({...project._doc, dr2Manager, taskId});
    try {
        await managerNotifyMail(dr2Manager, message, `Task is ready for DR2: ${taskId} - ${project.projectName} (I008.1)`);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyReadyForDr2");
    }
}

async function notifyStepReopened(steps, projectId) {
    try {
        for(let step of steps) {
            const message = stepReopenedMessage(step);
            step["to"] = step.vendor.email;
            step.subject = `Step has been reopened: ${step.stepId} (${step.serviceStep.title}) (ID V007.0)`;
            await sendEmail(step, message);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notfyStepsReopen");
    }
}

module.exports = { 
    stepCancelNotifyVendor, 
    getMessage, 
    taskCompleteNotifyPM, 
    notifyClientTaskReady, 
    sendClientDeliveries, 
    notifyDeliverablesDownloaded,
    notifyProjectDelivery,
    notifyManagerStepStarted,
    stepCompletedNotifyPM,
    notifyStepDecisionMade,
    notifyReadyForDr2,
    notifyStepReopened
}
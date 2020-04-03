const { sendEmail, managerNotifyMail, clientQuoteEmail } = require("../utils/mailTemplate");
const { managerTaskCompleteNotificationMessage, deliverablesDownloadedMessage, stepStartedMessage, stepDecisionMessage, readyForDr2Message } = require("../emailMessages/internalCommunication");
const { messageForClient, emailMessageForContact, taskReadyMessage, taskDeliveryMessage, tasksQuoteMessage } = require("../emailMessages/clientCommunication");
const { stepCancelledMessage, stepMiddleCancelledMessage } = require("../emailMessages/vendorCommunication");
const { getProject } = require("./getProjects");
const { getService } = require("../services/getServices");
const { User } = require("../models");

async function stepCancelNotifyVendor(steps, projectId) {
    try {
        const notifyStepStatuses = ["Cancelled", "Cancelled Halfway", "Completed"]
        for(let step of steps) {
            if(step.vendor && notifyStepStatuses.indexOf(step.status) === -1) {
                const message = step.status === "Cancelled" ? 
                    stepCancelledMessage(step)
                    : stepMiddleCancelledMessage(step);
                step["to"] = step.vendor.email;
                const id = step.status === "Cancelled" ? "V003.1" : "V004.0";
                step.subject = `Step cancelling notification! (ID ${id}, ${projectId})`;
                await sendEmail(step, message);
            }
        }
    } catch(err) {
        console.log(err);
        console.log("Error in stepCancelNotifyVendor");
    }
}

async function getMessage(projectId, messageTarget) {
    let quote = await getQuoteInfo(projectId);
    const message = messageTarget === "quote" ? messageForClient(quote) : emailMessageForContact(quote);
    return message;
}

async function getQuoteInfo(projectId) {
    const project = await getProject({"_id": projectId});
    const service = await getService({"_id": project.tasks[0].service});
    let quote = {...project._doc, id: project.id};
    quote.service = service.title;
    const { contacts } = project.customer;
    quote.contact = contacts.find(item => item.leadContact);
    quote.firstName = quote.contact.firstName;
    quote.surname = quote.contact.surname;
    return quote;
}

async function stepCompletedNotifyPM(project, step) {
    const subject = `Step completed (ID I003.0, ${project.projectId})`;
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
        await managerNotifyMail(manager, message, `Task is ready for DR1 (ID I008.0, ${project.projectId})`);
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
    try {
        for(let contact of notifyContacts) {
            const message = taskReadyMessage({taskId, contact, project_id: project.projectId});
            await sendEmail({to: contact.email, subject: `TASK IS READY (ID C014, ${project.projectId})`}, message);
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
        for(let contact of notifyContacts) {
            const message = taskDeliveryMessage({task, contact, accManager, ...project._doc});
            await sendEmail({to: contact.email, subject: `TASK DELIVERY (ID C006.1, ${project.projectId})`}, message);
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
        await managerNotifyMail(projectManager, pmMessage, `Task delivery notification (ID I006, ${project.projectId})`);
        await managerNotifyMail(accManager, accManagerMessage, `Task delivery notification (ID I006, ${project.projectId})`);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyDeliverablesDownloaded");
    }
}

async function sendTasksQuote(tasks) {
    try {
        const project = await getProject({"tasks.taskId": tasks[0].taskId});
        const contact = project.customer.contacts.find(item => item.leadContact);
        for(let task of tasks) {
            const quoteInfo = {...project._doc, task, contact};
            const message = tasksQuoteMessage(quoteInfo);
            await clientQuoteEmail({contact, subject: `Quote(s) (ID C005.2, ${project.projectId})`}, message);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notifyDeliverablesDownloaded");
    }

}

async function notifyProjectDelivery(project) {
    const { customer } = project;
    const contact = customer.contacts.find(item => item.leadContact);
    const message = projectDeliveryMessage({...project._doc, contact, accManager: customer.accountManager});
    const subject = `Project Delivery (ID C006.0, ${project.projectId})`;
    try {
        await sendEmail({to: contact.email, subject}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyProjectDelivery");
    }
}

async function notifyManagerStepStarted(project, step) {
    const subject = `Step started (ID I002.0, ${project.projectId})`;
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
    const messageId = decision === 'accept' ? 'I006.0' : 'I006.1';
    const subject = `Vendor ${decision === 'accept' ? 'approved' : 'rejected'} the job (ID ${messageId}, ${project.projectId})`;
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
        await managerNotifyMail(dr2Manager, message, `Task is ready for DR2 (I008.1, ${project.projectId})`);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyReadyForDr2");
    }
}

module.exports = { 
    stepCancelNotifyVendor, 
    getMessage, 
    taskCompleteNotifyPM, 
    notifyClientTaskReady, 
    sendClientDeliveries, 
    notifyDeliverablesDownloaded, 
    sendTasksQuote,
    notifyProjectDelivery,
    notifyManagerStepStarted,
    stepCompletedNotifyPM,
    notifyStepDecisionMade,
    notifyReadyForDr2
}
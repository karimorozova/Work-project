const { sendEmail, managerNotifyMail } = require("../utils/mailTemplate");
const { vendorNotificationMessage, emailMessageForContact, messageForClient, managerTaskCompleteNotificationMessage, taskReadyMessage, deliverablesDownloadedMessage } = require("../utils/emailMessages");
const { getProject } = require("./getProjects");
const { getOneService } = require("../services/getServices");
const { User } = require("../models");

async function stepCancelNotifyVendor(steps) {
    try {
        const notifyStepStatuses = ["Cancelled", "Cancelled Halfway", "Completed"]
        for(let step of steps) {
            if(step.vendor && notifyStepStatuses.indexOf(step.status) === -1) {
                const message = vendorNotificationMessage(step);
                step["to"] = step.vendor.email;
                step.subject = "Step cancelling notification! (ID V007)";
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
    const service = await getOneService({"_id": project.tasks[0].service});
    let quote = {...project._doc, id: project.id};
    quote.service = service.title;
    const { contacts } = project.customer;
    quote.contact = contacts.find(item => item.leadContact);
    quote.firstName = quote.contact.firstName;
    quote.surname = quote.contact.surname;
    return quote;
}

async function taskCompleteNotifyPM(project, task) {
    try {
        const manager = await User.findOne({"_id": project.projectManager.id}, {email: 1});
        const message = await getPMnotificationMessage(project, task);
        await managerNotifyMail(manager, message, "Task finish notification (ID I002)");
    } catch(err) {
        console.log(err);
        console.log("Error in taskCompleteNotifyPM");
    }
}

async function getPMnotificationMessage(project, task) {
    try {
        const service = await getOneService({"_id": task.service});
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

async function notifyClientTaskReady({taskIds, project}) {
    try {
        const contact = project.customer.contacts.find(item => item.leadContact);
        for(let taskId of taskIds) {
            const message = taskReadyMessage({taskId, contact, project_id: project.projectId});
            await sendEmail({to: contact.email, subject: "TASK READY (ID C014)"}, message);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notifyClientTaskReady");
    }
}

async function sendClientDeliveries({taskIds, project}) {
    try {
        const contact = project.customer.contacts.find(item => item.leadContact);
        for(let taskId of taskIds) {
            const message = taskReadyMessage({taskId, contact, project_id: project.projectId});
            await sendEmail({to: contact.email, subject: "DELIVERY (ID C013)"}, message);
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
        await managerNotifyMail(projectManager, pmMessage, "Task delivery notification (ID I006)");
        await managerNotifyMail(accManager, accManagerMessage, "Task delivery notification (ID I006)");
    } catch(err) {
        console.log(err);
        console.log("Error in notifyDeliverablesDownloaded");
    }
}

module.exports = { stepCancelNotifyVendor, getMessage, taskCompleteNotifyPM, notifyClientTaskReady, sendClientDeliveries, notifyDeliverablesDownloaded };
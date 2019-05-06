const { sendEmail, managerNotifyMail } = require("../utils/mailTemplate");
const { vendorNotificationMessage, emailMessageForContact, messageForClient, managerTaskCompleteNotificationMessage, taskReadyMessage } = require("../utils/emailMessages");
const { getProject } = require("./getProjects");
const { getOneService } = require("../services/getServices");
const { User } = require("../models");

async function notifyVendors(steps) {
    try {
        for(let step of steps) {
            if(step.vendor && (step.status === 'Cancelled' || step.status === 'Cancelled Halfway')) {
                const message = vendorNotificationMessage(step);
                step["to"] = step.vendor.email;
                step.subject = "Step cancelling notification!";
                await sendEmail(step, message);
            }
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notifyVendors");
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
        await managerNotifyMail(manager, message, "Task finish notification");
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

async function notifyClientTaskReady({tasks, project}) {
    try {
        const contact = project.customer.contacts.find(item => item.leadContact);
        for(let taskId of tasks) {
            const message = taskReadyMessage({taskId, contact, project_id: project.projectId});
            await sendEmail({to: contact.email, subject: "Task ready notification"}, message);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notifyClientTaskReady");
    }
}

module.exports = { notifyVendors, getMessage, taskCompleteNotifyPM, notifyClientTaskReady };
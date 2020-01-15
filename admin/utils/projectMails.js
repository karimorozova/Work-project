const { User, Projects, Services } = require('../models');
const { managerNotifyMail, sendEmail, clientQuoteEmail } = require('./mailTemplate');
const { managerAssignmentNotifyingMessage, managerProjectAcceptedMessage } = require('../emailMessages/internalCommunication');
const { emailMessageForContact } = require("../emailMessages/clientCommunication");
const { requestMessageForVendor, vendorReassignmentMessage } = require("../emailMessages/vendorCommunication");
const { getClient } = require('../clients');

async function notifyManagerProjectStarts(project) {
    try {
        const customer = await getClient({"_id": project.customer.id});
        if(project.isStartAccepted) {
            const projectManager = await User.findOne({"_id": customer.projectManager._id});
            const salesManager = await User.findOne({"_id": customer.salesManager._id});
            const steps = await notifyVendorsProjectAccepted(project.steps);
            await Projects.updateOne({"_id": project.id}, { steps });
            const notAssignedStep = steps.find(item => !item.vendor);
            if(notAssignedStep) {
                await managerEmailsSend({project, projectManager, salesManager});
            }
        } else {
            await notifyMangerProjectAppoved(project, customer.accountManager._id);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notifyManagerProjectStarts");
    }
}

async function notifyMangerProjectAppoved(project, accManagerId) {
    try {
        const accManager = await User.findOne({"_id": accManagerId});
        const message = managerProjectAcceptedMessage({...project._doc, accManager: accManager.firstName});
        await managerNotifyMail(accManager, message, `Quote Accepted (ID C002.0, ${project.projectId})`);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyMangerProjectAppoved");
    }
}

async function notifyVendorsProjectAccepted(projectSteps) {
    let steps = [];
    try {
        for(let step of projectSteps) {
            if(step.vendor) {
                const index = step.vendorsClickedOffer.indexOf(step.vendor._id);
                await sendRequestToVendor(project, step);
                if(index !== -1) step.vendorsClickedOffer.splice(index, 1);
            }
            steps.push(step);
        }
        return steps;
    } catch(err) {
        console.log(err);
        console.log("Error in notifyVendorsProjectAccepted");
    }
}

async function managerEmailsSend({project, projectManager, salesManager}) {
    const pmMessageObj = {...project._doc, user: {...projectManager._doc, id: projectManager.id}};
    const smMessageObj = {...project._doc, user: {...salesManager._doc, id: salesManager.id}};
    const pmMessage = managerAssignmentNotifyingMessage(pmMessageObj);
    const smMessage = managerAssignmentNotifyingMessage(smMessageObj);
    try {
        await managerNotifyMail(projectManager, pmMessage, `Quote Accepted but translators were not assigned (ID I001, ${project.projectId})`);
        await managerNotifyMail(salesManager, smMessage, `Quote Accepted but translators were not assigned (ID I001, ${project.projectId})`);
    } catch(err) {
        console.log(err);
        console.log("Error in managerEmailsSend");
    }
}

async function stepReassignedNotification(project, step, reason) {
    const message = vendorReassignmentMessage(step, reason);
    try {
        await sendEmail({to: step.vendor.email, subject: `Step has been reassigned (ID V001.1, ${project.projectId})`}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in stepReassignedNotification")
    }
}

async function stepVendorsRequestSending(project, checkedSteps) {
    let steps = [...project.steps];
    const assignedStepsCheck = checkedSteps.map(item => item.stepId);
    try {
        for(let step of steps) {
            if(step.vendor && assignedStepsCheck.indexOf(step.stepId) !== -1) {
                await sendRequestToVendor(project, step);
                step.status = "Request Sent"
            }
        }
        return steps;
    } catch(err) {
        console.log(err);
        console.log("Error in stepVendorsRequestSending")
    }
}

async function stepEmailToVendor(project, step) {
    let steps = [...project.steps];
    await sendRequestToVendor(project, step);
    const updatedSteps = steps.map(item => {
        if(step.taskId === item.taskId && step.name === item.name) {
            item.status = "Request Sent";
            return item;
        }
        return item;
    });
    return updatedSteps;
}

async function sendRequestToVendor(project, step) {
    let requestInfo = {...step._doc};
    requestInfo.projectId = project.id;
    requestInfo.projectName = project.projectName;
    requestInfo.industry = project.industry.name;
    requestInfo.brief = project.brief;
    const message = requestMessageForVendor(requestInfo);
    try {
        await sendEmail({to: step.vendor.email, subject: `Request Confirmation (ID V001, ${project.projectId})`}, message);
    } catch(err) {
        console.log(err);
        console.log('Error in sendRequestToVendor');
    }
}

async function sendEmailToContact(project, contact) {
    let projectInfo = {...project._doc};
    projectInfo.firstName = contact.firstName;
    projectInfo.surname = contact.surname;
    try {
        const service = await Services.findOne({"_id": project.tasks[0].service});
        projectInfo.service = service.title;
        const message = emailMessageForContact(projectInfo);
        await clientQuoteEmail({contact, subject: `Project information (ID C006, ${project.projectId})`}, message);
    } catch(err) {
        console.log(err);
        console.log('Error in sendEmailToContact');
    }
}

module.exports = { notifyManagerProjectStarts, stepVendorsRequestSending, stepEmailToVendor, sendEmailToContact, stepReassignedNotification };
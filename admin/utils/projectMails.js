const { User, Projects, Services } = require('../models');
const { managerNotifyMail, sendEmail, clientQuoteEmail } = require('./mailTemplate');
const { managerAssignmentNotifyingMessage, managerProjectAcceptedMessage, managerProjectRejectedMessage } = require('../emailMessages/internalCommunication');
const { emailMessageForContact, projectCancelledMessage, tasksCancelledMessage, tasksMiddleCancelledMessage, projectMiddleCancelledMessage } = require("../emailMessages/clientCommunication");
const { requestMessageForVendor, vendorReassignmentMessage } = require("../emailMessages/vendorCommunication");
const { getClient } = require('../clients');

async function notifyManagerProjectRejected(project) {
    try {
        const accManager = await User.findOne({"_id": project.accountManager.id});
        const message = managerProjectRejectedMessage({...project._doc, accManager: accManager.firstName});
        await managerNotifyMail(accManager, message, `Quote Rejected ${project.projectId} - ${project.projectName} (ID C003.0)`);
    } catch(err) {
        console.log(err);
        console.log("Error in notifyManagerProjectRejected");
    }
}

async function notifyManagerProjectStarts(project) {
    try {
        const customer = await getClient({"_id": project.customer.id});
        if(project.isStartAccepted) {
            const projectManager = await User.findOne({"_id": project.projectManager.id});
            const salesManager = await User.findOne({"_id": customer.salesManager._id});
            const steps = await notifyVendorsProjectAccepted(project.steps);
            await Projects.updateOne({"_id": project.id}, { steps });
            const notAssignedStep = steps.find(item => !item.vendor);
            if(notAssignedStep) {
                await managerEmailsSend({project, projectManager, salesManager});
            }
        } else {
            await notifyMangerProjectAppoved(project);
        }
    } catch(err) {
        console.log(err);
        console.log("Error in notifyManagerProjectStarts");
    }
}

async function notifyMangerProjectAppoved(project) {
    try {
        const accManager = await User.findOne({"_id": project.accountManager.id});
        const message = managerProjectAcceptedMessage({...project._doc, accManager: accManager.firstName});
        await managerNotifyMail(accManager, message, `Quote Accepted ${project.projectId} - ${project.projectName} (ID C002.0)`);
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
    try {
        const pmMessageObj = {...project._doc, user: {...projectManager._doc, id: projectManager.id}};
        const smMessageObj = {...project._doc, user: {...salesManager._doc, id: salesManager.id}};
        const pmMessage = managerAssignmentNotifyingMessage(pmMessageObj);
        const smMessage = managerAssignmentNotifyingMessage(smMessageObj);
        await managerNotifyMail(projectManager, pmMessage, `Quote Accepted: ${project.projectId} - ${project.projectName} (ID I001.0)`);
        await managerNotifyMail(salesManager, smMessage, `Quote Accepted: ${project.projectId} - ${project.projectName} (ID I001.0)`);
    } catch(err) {
        console.log(err);
        console.log("Error in managerEmailsSend");
    }
}

async function stepReassignedNotification(project, step, reason) {
    try {
        const message = vendorReassignmentMessage(step, reason);
        await sendEmail({to: step.vendor.email, subject: `Step ${step.stepId} has been reassigned (ID V001.1)`}, message);
    } catch(err) {
        console.log(err);
        console.log("Error in stepReassignedNotification")
    }
}

async function stepVendorsRequestSending(project, checkedSteps) {
    try {
        let steps = [...project.steps];
        const assignedStepsCheck = checkedSteps.map(item => item.stepId);
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
    try {
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
    } catch(err){
        console.log(err);
        console.log("Error in stepEmailToVendor")
    }
}

async function sendRequestToVendor(project, step) {
    try {
        let requestInfo = {...step._doc};
        requestInfo.projectId = project.id;
        requestInfo.projectName = project.projectName;
        requestInfo.industry = project.industry.name;
        requestInfo.brief = project.brief;
        const message = requestMessageForVendor(requestInfo);
        await sendEmail({to: step.vendor.email, subject: `Availability approval for a Step ${step.stepId} (${step.serviceStep.title}) (ID V001.0)`}, message);
    } catch(err) {
        console.log(err);
        console.log('Error in sendRequestToVendor');
    }
}

async function sendEmailToContact(project, contact) {
    try {
        let projectInfo = {...project._doc};
        projectInfo.firstName = contact.firstName;
        projectInfo.surname = contact.surname;
        const service = await Services.findOne({"_id": project.tasks[0].service});
        projectInfo.service = service.title;
        const message = emailMessageForContact(projectInfo);
        await clientQuoteEmail({contact, subject: `Project information (ID C006, ${project.projectId} - ${project.projectName})`}, message);
    } catch(err) {
        console.log(err);
        console.log('Error in sendEmailToContact');
    }
}

function getAccManagerAndContact(project) {
    const accManager = project.accountManager;
    const contact = project.customer.contacts.find(item => item.leadContact);
    return { accManager, contact };
}

async function notifyClientProjectCancelled(project) {
    try {
        const { accManager, contact } = getAccManagerAndContact(project);
        const message = project.status === "Cancelled" ? 
            projectCancelledMessage({...project._doc, accManager, contact, reason: "Some reason"})
            : projectMiddleCancelledMessage({...project._doc, accManager, contact, reason: "Some reason"});
        const messageId = project.status === "Cancelled" ? "C005.0" : "C008.0";
        const subject = project.status === "Cancelled" ? "Project cancelled" : "Project has been cancelled in the middle of the work";
        await clientQuoteEmail({contact, subject: `${subject}: ${project.projectId} - ${project.projectName} (ID ${messageId})`}, message);
    } catch(err) {
        console.log(err);
        console.log('Error in notifyClientProjectCancelled');
    }
}

async function notifyClientTasksCancelled(project, tasks) {
    try {
        const { accManager, contact } = getAccManagerAndContact(project);
        const tasksIds = tasks.map(item => item.taskId);
        const cancelledTasks = project.tasks.filter(item => tasksIds.indexOf(item.taskId) !== -1);
        for(let task of cancelledTasks) {
            if(task.status === 'Cancelled Halfway') {
                const message = tasksMiddleCancelledMessage({...project._doc, task, accManager, contact, reason: "Some reason"});
                const subject = `Task has been cancelled in the middle of the work: ${task.taskId} - ${task.service.title} (ID C008.1)`;
                await clientQuoteEmail({contact, subject}, message);
            }
        }
    } catch(err) {
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
    notifyClientTasksCancelled
};
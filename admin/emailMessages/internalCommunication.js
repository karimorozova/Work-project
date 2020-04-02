const moment = require('moment');

function getMessageWithRandomPassword(password) {
    return `<div contenteditable="true" class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);overflow-y: auto">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear pangea system user,</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    We generated new password for you to sign in to the system.
                </p>
                <p> Please, use this password: ${password}.</p>
            </div>
        </div>`;
}

function managerAssignmentNotifyingMessage(obj) {
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.user.firstName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Please pay attention to the fact that there is a quote that has been accepted and a porject is ready to start, but translators were not assigned. 
                </p>
                <h3 class="detailsTitle">Step Details</h3>
                <table class="details">
                    <tr>
                        <td>Project ID:</td>
                        <td>${obj.projectId}</td>
                    </tr>
                    <tr>
                        <td>Project name:</td>
                        <td>${obj.projectName}</td>
                    </tr>
                    <tr>
                        <td>Start date: </td>
                        <td>${obj.startDate}</td>
                    </tr>
                    <tr>
                        <td>Deadline: </td>
                        <td>${obj.deadline}</td>
                    </tr>
                </table>
            </div>
            </div>`;
}

function managerTaskCompleteNotificationMessage(obj) {
    const lastName = obj.projectManager.lastName || "";
    const pair = obj.task.sourceLanguage ? `${obj.task.sourceLanguage} >> ${obj.task.targetLanguage}` : `${obj.task.targetLanguage} / ${obj.task.packageSize}`;
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.projectManager.firstName} ${lastName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Task ${obj.task.taskId} from project ${obj.projectId} - ${obj.projectName} has been completed and ready for DR1.
                </p>
                <p class="description" style="font-size: 18px;">
                    Project deadline is: ${obj.deadline}
                </p>
                <p class="description" style="font-size: 18px;">
                    Please, make the review or assign another PM to do it.
                </p>
            </div>
        </div>`;
}

function deliverablesDownloadedMessage(obj) {
    const lastName = obj.manager.lastName || "";
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
                <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.manager.firstName} ${lastName},</h3>
                <div class="all-info" style="padding: 0 15px 0 30px;">
                    <p class="description" style="font-size: 18px;">
                        Task deliverables were downloaded by client. 
                    </p>
                    <h3 class="detailsTitle">Details</h3>
                    <table class="details">
                        <tr>
                            <td>Task ID:</td>
                            <td>${obj.taskId}</td>
                        </tr>
                        <tr>
                            <td>Project ID:</td>
                            <td>${obj.project_id}</td>
                        </tr>
                    </table>
                </div>
            </div>`;
}

function managerRequestNotifyingMessage(obj) {
    const industry = obj.industry ? obj.industry.name : "";
    const { sourceLanguage, packageSize } = obj;
    const languages = obj.targetLanguages.reduce((acc, cur) => {
        acc+= sourceLanguage ? `${sourceLanguage.lang} >> ${cur.lang}; ` : `${cur.lang}/${packageSize.size}; `
        return acc; 
    }, "")
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.user.firstName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Client ${obj.customer.name} has sent a request. 
                </p>
                <h3 class="detailsTitle">Please, find the details below:</h3>
                <table class="details">
                    <tr>
                        <td>Request name:</td>
                        <td>${obj.projectName}</td>
                    </tr>
                    <tr>
                        <td>Request ID:</td>
                        <td>${obj.requestId}</td>
                    </tr>
                    <tr>
                        <td>Service:</td>
                        <td>${obj.service.title}</td>
                    </tr>
                    <tr>
                        <td>Languages:</td>
                        <td>${languages}</td>
                    </tr>
                    <tr>
                        <td>Industry:</td>
                        <td>${industry}</td>
                    </tr>
                    <tr>
                        <td>Estimated delivery date: </td>
                        <td>${obj.deadline}</td>
                    </tr>
                </table>
            </div>
            </div>`;
}

function managerRequestAssignedMessage(obj) {
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.user.firstName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Please pay attention to the fact that there is a request from client ${obj.customer.name} that has been assigned to you. 
                </p>
                <h3 class="detailsTitle">Request Details</h3>
                <table class="details">
                    <tr>
                        <td>Request ID:</td>
                        <td>${obj.requestId}</td>
                    </tr>
                    <tr>
                        <td>Request name:</td>
                        <td>${obj.projectName}</td>
                    </tr>
                    <tr>
                        <td>Suggested Deadline: </td>
                        <td>${obj.deadline}</td>
                    </tr>
                </table>
            </div>
            </div>`;
}

function managerProjectAcceptedMessage(obj) {
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.accManager},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Client ${obj.customer.name} has just accepted quote: ${obj.projectId} - ${obj.projectName}. 
                </p>
                <p class="description" style="font-size: 18px;">
                    You can proceed with the project. 
                </p>
            </div>
            </div>`;
}

function managerProjectRejectedMessage(obj) {
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.accManager},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Client ${obj.customer.name} has just rejected quote: ${obj.projectId} - ${obj.projectName}. 
                </p>
                <p class="description" style="font-size: 18px;">
                    Please archive the project. 
                </p>
            </div>
            </div>`;
}

function stepStartedMessage(obj) {
    const lastName = obj.projectManager.lastName || "";
    const vendorSurname = obj.step.vendor.surname || "";
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.projectManager.firstName} ${lastName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Vendor ${obj.step.vendor} ${vendorSurname} has just started the step: ${obj.step.stepId} from ${obj.projectId} - ${obj.projectName}. You can track progress on Project page.
                </p>
            </div>
            </div>`
}

function stepCompletedMessage(obj) {
    const lastName = obj.accountManager.lastName || "";
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.accountManager.firstName} ${lastName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Vendor ${obj.step.vendor} ${vendorSurname} has just completed the step: ${obj.step.stepId} from ${obj.projectId} - ${obj.projectName}.
                </p>
            </div>
            </div>`
}

function requestCancelledMessage(obj) {
    const lastName = obj.accountManager.lastName || "";
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.accountManager.firstName} ${lastName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Client ${obj.customer.name} has cancelled the request: ${obj.requestId} - ${obj.projectName}.
                </p>
            </div>
            </div>`
}

function  stepDecisionMessage(obj) {
    const lastName = obj.accountManager.lastName || "";
    const decision = obj.decision === "accept" ? "approved" : "rejected";
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.accountManager.firstName} ${lastName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Vendor ${obj.step.vendor} ${vendorSurname} has ${decision} the assigned step: ${obj.step.stepId} from ${obj.projectId} - ${obj.projectName} Project.
                </p>
            </div>
            </div>`
}

function readyForDr2Message(obj) {
    const lastName = obj.dr2Manager.lastName || "";
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.dr2Manager.firstName} ${lastName},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    The Delivery Review for ${taskId} from project${obj.projectId} - ${obj.projectName} has been finished.
                </p>
                <p class="description" style="font-size: 18px;">
                    Please, do the Delivery Review 2.
                </p>
                <p class="description" style="font-size: 18px;">
                    Project deadline is: ${obj.deadline}
                </p>
            </div>
            </div>`;
}

module.exports = { 
    getMessageWithRandomPassword,
    managerAssignmentNotifyingMessage,
    managerTaskCompleteNotificationMessage,
    deliverablesDownloadedMessage,
    managerRequestNotifyingMessage,
    managerRequestAssignedMessage,
    managerProjectAcceptedMessage,
    managerProjectRejectedMessage,
    stepStartedMessage,
    stepCompletedMessage,
    requestCancelledMessage,
    stepDecisionMessage,
    readyForDr2Message
};
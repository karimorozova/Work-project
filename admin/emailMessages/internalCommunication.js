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
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.projectManager.firstName} ${lastName}</h4>
                    <p>
                        Task ${obj.task.taskId} from project ${obj.projectId} - ${obj.projectName} is completed and ready for DR1.
                    </p>
                    <p>
                        Project deadline is: ${obj.deadline}
                    </p>
                    <p>
                        Please, make the review or assign another PM to do it.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
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
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.user.firstName}</h4>
                    <p>
                        Client ${obj.customer.name} has send a request.
                    </p>
                    <p>
                        Please find the details below:
                    </p>
                    <div class="details" style="width:90%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >

                        <table class="details__table" style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;" >
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Name:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj.projectName}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >ID:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj.requestId}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Service:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj.service.title}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Language:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${languages}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Industry:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${industry}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Estimated delivery date:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj.deadline}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function managerRequestAssignedMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.user.firstName}</h4>
                    <p>
                        Request ${obj.requestId} - ${obj.projectName} has been assigned to you.
                    </p>
                    <p>
                        Please find the details below:
                    </p>
                    <div class="details" style="width:90%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >

                        <table class="details__table" style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;" >
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Name:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj.projectName}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >ID:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj.requestId}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Service:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" ></td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Language:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" ></td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Industry:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" ></td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Estimated delivery date:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj.deadline}</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function managerProjectAcceptedMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.accManager}</h4>
                    <p>
                        Client ${obj.customer.name} has just accepted quote: ${obj.projectId} - ${obj.projectName}.
                    </p>
                    <p>
                        You can proceed with the project.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function managerProjectRejectedMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
            <header style="background-color:#66563E;text-align:center;" >
                <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
            </header>
            <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                <h4 class="contact-name">Dear ${obj.accManager}</h4>
                <p>
                    Client ${obj.customer.name} has just rejected quote: ${obj.projectId} - ${obj.projectName}н.
                </p>
                <p>
                    Please archive the project.
                </p>
            </div>
            <footer>
                <hr size="15" color="#66563E">
                <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
            </footer>
        </div>`;
}

function stepStartedMessage(obj) {
    const lastName = obj.projectManager.lastName || "";
    const vendorSurname = obj.step.vendor.surname || "";
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.projectManager.firstName} ${lastName}</h4>
                    <p>
                        Vendor ${obj.step.vendor} ${vendorSurname} just start the step: ${obj.step.stepId} from ${obj.projectId} - ${obj.projectName}.
                    </p>
                    <p>
                        You can track progress on Project page.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function stepCompletedMessage(obj) {
    const lastName = obj.accountManager.lastName || "";
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.accountManager.firstName} ${lastName}</h4>
                    <p>
                        Vendor ${obj.step.vendor} ${vendorSurname} just completed the step: ${obj.step.stepId} from ${obj.projectId} - ${obj.projectName}.  
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function requestCancelledMessage(obj) {
    const lastName = obj.accountManager.lastName || "";
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.accountManager.firstName} ${lastName}</h4>
                    <p>
                        Client${obj.customer.name} has cancelled the project: ${obj.requestId} - ${obj.projectName}.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function  stepDecisionMessage(obj) {
    const lastName = obj.accountManager.lastName || "";
    const decision = obj.decision === "accept" ? "approved" : "rejected";
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.accountManager.firstName} ${lastName}</h4>
                    <p>
                        Vendor ${obj.step.vendor} ${vendorSurname} has ${decision} the assigned step: ${obj.step.stepId} from ${obj.projectId} - ${obj.projectName} Project.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function readyForDr2Message(obj) {
    const lastName = obj.dr2Manager.lastName || "";
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.dr2Manager.firstName} ${lastName}</h4>
                    <p>
                        The Delivery Review for ${taskId} from project ${obj.projectId} - ${obj.projectName} has been finished. 
                    </p>
                    <p>
                        Please, do the Delivery Review 2
                    </p>
                    <p>
                        Project deadline is: ${obj.deadline}
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
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
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
                    Please, pay attention that one of the tasks has been completed.
                </p>
                <h3 class="detailsTitle">See details below:</h3>
                <table class="details">
                    <tr>
                        <td>Project number:</td>
                        <td>${obj.projectId}</td>
                    </tr>
                    <tr>
                        <td>Project name:</td>
                        <td>${obj.projectName}</td>
                    </tr>
                    <tr>
                        <td>Task ID:</td>
                        <td>${obj.task.taskId}</td>
                    </tr>
                    <tr>
                        <td>Service:</td>
                        <td>${obj.service}</td>
                    </tr>
                    <tr>
                        <td>Language pair:</td>
                        <td>${pair}</td>
                    </tr>
                    <tr>
                        <td>Start date: </td>
                        <td>${moment(obj.task.start).format('DD-MM-YYYY')}</td>
                    </tr>
                    <tr>
                        <td>Deadline: </td>
                        <td>${moment(obj.task.deadline).format('DD-MM-YYYY')}</td>
                    </tr>
                </table>
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
                        <td>Start date: </td>
                        <td>${obj.startDate}</td>
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

module.exports = {
    getMessageWithRandomPassword,
    managerAssignmentNotifyingMessage,
    managerTaskCompleteNotificationMessage,
    deliverablesDownloadedMessage,
    managerRequestNotifyingMessage,
    managerProjectAcceptedMessage,
    managerProjectRejectedMessage
};
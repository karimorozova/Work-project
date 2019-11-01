const apiUrl = require("../helpers/apiurl");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../configs');
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

function applicationMessage(obj) {
    let cvFiles = "";
    let languagePairs = "";
    let software = "";
    let industries = "";
    let coverLetterFiles = "";
    let education = "";
    let positions = "";
    if(obj.cvFiles.length) {
        cvFiles = obj.cvFiles.reduce((initial, current, index) => {
            return initial + `<a href="${apiUrl}${current}" download target='_self'>cvFile${index+1}</a>; `
        }, "")
    }
    if(obj.coverLetterFiles.length) {
        coverLetterFiles = obj.coverLetterFiles.reduce((initial, current, index) => {
            return initial + `<a href="${apiUrl}${current}" download target='_self'>coverLetterFile${index+1}</a>; `
        }, "")
    }
    if(obj.languagePairs) {
        languagePairs = obj.languagePairs.reduce((initial, current, index) => {
            return initial + current.source + ' >> ' + current.target + "; "
        }, "")
    }
    if(obj.industries) {
        industries = obj.industries.reduce((initial, current, index) => {
            return initial + current.name + "; "
        }, "")
    }
    if(obj.position) {
        positions = obj.position.reduce((initial, current, index) => {
            return initial + current + "; " 
        }, "")
    }
    if(obj.technicalComp.software) {
        software = obj.technicalComp.software.reduce((initial, current, index) => {
            return initial + current + "; "
        }, "")
    }
    if(obj.education) {
        education = obj.education.reduce((initial, current, index) => {
            return initial + `${current.study}/${current.field}/${current.institute}/${current.grade} <br>`
        }, "")
    }
    return `<div class="main" style="font-weight:400;font-size:12px;border-width:1px;border-style:solid;border-color:#66563E;max-width:700px;display:flex;flex-direction:column;padding-top:10px;padding-bottom:10px;padding-right:10px;padding-left:10px;" >
    <h2 class="head-title" style="font-size:18px;align-self:center;" >New Application Request</h1>
        <div class="personal">
            <ul>
                <li style="margin-bottom:5px;" >Name: ${obj.firstName}</li>
                <li style="margin-bottom:5px;" >Surname: ${obj.surname}</li>
                <li style="margin-bottom:5px;" >Email: ${obj.email}</li>
                <li style="margin-bottom:5px;" >Phone Number: ${obj.phone}</li>
                <li style="margin-bottom:5px;" >Mother tongue: ${obj.native}</li>
                <li style="margin-bottom:5px;" >Time-zone: ${obj.timezone}</li>
                <li style="margin-bottom:5px;" >Language Pairs: ${languagePairs}</li>
                <li style="margin-bottom:5px;" >CV: ${cvFiles}</li>
                <li style="margin-bottom:5px;" >Position: ${positions}</li>
            </ul>
        </div>
        <div class="education">
            <ul>
                <li style="margin-bottom:5px;" >Education:
                    <div>
                        ${education}
                    </div>
                </li>
            </ul>
        </div>
        <div class="transExp">
            <ul>
                <li style="margin-bottom:5px;" >Transaltion Experience: <span>${obj.translationExp}</span></li>
            </ul>
        </div>
        <div class="tech">
            <ul>
                <li style="margin-bottom:5px;" >Internet Access: ${obj.technicalComp.internet}</li>
                <li style="margin-bottom:5px;" >CAT experience: ${obj.technicalComp.cat}</li>
                <li style="margin-bottom:5px;" >Software experience: ${software}</li>
            </ul>
        </div>
        <div class="industries">
            <ul>
                <li style="margin-bottom:5px;" >Industries: ${industries}</li>
            </ul>
        </div>
        <div class="other">
            <ul>
                <li style="margin-bottom:5px;" >Availability: ${obj.availability}</li>
                <li style="margin-bottom:5px;" >Willing to take a test: ${obj.testAgree}</li>
                <li style="margin-bottom:5px;" >Rate: ${obj.rate}</li>
                <li style="margin-bottom:5px;" >Cover Letter: ${obj.coverLetter}</li>
                <li style="margin-bottom:5px;" >Cover Letter (files): ${coverLetterFiles}</li>
            </ul>
        </div>
    </div>`
}

function messageForClient(obj) {
        const date = Date.now();
        const name = `${obj.contact.firstName} ${obj.contact.surname}`;
        const tasksInfo = getTasksInfo({tasks: obj.tasks, industry: obj.industry});
        const token = jwt.sign({id: obj.id}, secretKey, { expiresIn: '2h'});
        const acceptQuote = '<a href=' + `${apiUrl}/projectsapi/acceptquote?projectId=${obj.id}&to=${date}&t=${token}` + ` target="_blank" style="color: orange;">I accept - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`
        const declineQuote = '<a href=' + `${apiUrl}/projectsapi/declinequote?projectId=${obj.id}&to=${date}t=${token}` + ` target="_blank" style="color: orange;">I reject - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`
        return `<div class="wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
        <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${name},</h3>
        <div class="all-info" style="padding: 0 15px 0 30px;">
            <p class="comment" style="font-style: italic;font-weight: bold;">
                ***This is an automated message***
            </p>
            <p class="description" style="font-size: 18px;">
                Please fined attached the quote on behalf of ${obj.customer.projectManager.firstName} ${obj.customer.projectManager.lastName}.
            </p>
            <h3 class="detailsTitle">Quote Details</h3>
            <table class="details" style="width: 600px;box-sizing: border-box;border: 1px solid rgb(129, 129, 129);border-collapse: collapse;">
                <tr>
                    <td class="table-title left-col" style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;font-weight: bold;width: 180px;">Quote number:</td>
                    <td class="table-title left-col" style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;font-weight: bold;width: 180px;">Quote name:</td>
                </tr>
                <tr>
                    <td class="left-col" style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;width: 170px;">${obj.projectId}</td>
                    <td style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;">${obj.projectName}</td>
                </tr>
            </table>
            ${tasksInfo}
            <p>
                By clicking on one of the links below, you can accept or reject our offer.
            </p>
                <p class="link" style="color: orange;">${acceptQuote}</p>
                <p>or</p>
                <p class="link" style="color: orange;">${declineQuote}</p>
            <p class="description" style="font-size: 18px;">
                Please note that by accepting the quote, the  project will start automatically.
            </p>
            <p>
                In case of any questions, please do not hesitate to contact us.
            </p>
            <h4 style="width: 40px;border-bottom: 1px solid rgb(29, 29, 29);">T&C:</h4>
            <ol style="padding-left: 0;">
                <li>The rstimated delivery date is only applicable if you accept the quote on the day of receipt. If not, the estimated date willl vary.</li>
                <li>Should you agree to a QA service, we cannot accept responsibility if you fail to send us the finished files upon completion. Please note the QA service expires in 30 days after the quote approval.</li>
            </ol>
            <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea TRanslation Services (Cyprus) LTD</h2>
            <img src="cid:logo@pan" style="width: 50%; margin-left: 145px;">
        </div>
    </div>`;
}

function getTasksInfo(info) {
    let { tasks, industry } = info;
    tasks.sort((a, b) => a.service.title > b.service.title ? 1 : -1);
    const services = tasks.reduce((acc, cur) => {
        const title = cur.service.title;
        acc[title] = acc[title] ? [...acc[title], cur] : [cur];
        return acc;
    }, {})
    let result = "";
    for(let key in services) {
        const tasksInfo = services[key].reduce((acc, cur) => {
            const deadline = acc['deadline'] || cur.deadline;
            const langPair = cur.sourceLanguage ? `${cur.sourceLanguage} >> ${cur.targetLanguage}` : `${cur.targetLanguage} / ${cur.packageSize}`;
            acc['deadline'] = cur.deadline > deadline ? cur.deadline : deadline;
            acc['langPairs'] = acc['langPairs'] ? acc['langPairs'] + `; ${langPair}` : `${langPair}`;
            acc['cost'] = acc['cost'] ? acc['cost'] + cur.finance.Price.receivables : cur.finance.Price.receivables;
            return acc;
        }, {})
        result+= getTaskCode({...tasksInfo, service: key, industry});
    }
    return result;
}

function getTaskCode(tasksInfo) {
    return `<h3 class="detailsTitle">Service: ${tasksInfo.service}</h3>
            <table class="details" style="width: 600px;box-sizing: border-box;border: 1px solid rgb(129, 129, 129);border-collapse: collapse;">
            <tr>
                <td class="left-col" style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;width: 180px;">Estimated delivery date:</td>
                <td style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;">${tasksInfo.deadline}</td>
            </tr>
            <tr>
                <td class="left-col" style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;width: 180px;">Languages:</td>
                <td style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;">${tasksInfo.langPairs}</td>
            </tr>
            <tr>
                <td class="left-col" style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;width: 180px;">Industry:</td>
                <td style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;">${tasksInfo.industry.name}</td>
            </tr>
            <tr>
                <td class="left-col" style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;width: 180px;">Cost:</td>
                <td style="border: 1px solid rgb(129, 129, 129);box-sizing: border-box;padding: 5px;">${tasksInfo.cost}</td>
            </tr>
        </table>`
}

function requestMessageForVendor(obj) {
    const date = Date.now();
    const expiryDate = new Date(date + 900000);
    const langPair = obj.sourceLanguage ? `${obj.sourceLanguage} >> ${obj.targetLanguage}; ` : `${obj.targetLanguage} / ${obj.packageSize}; `;
    const token = jwt.sign({vendorId: obj.vendor.id}, secretKey, { expiresIn: '2h'});
    const stepId = obj.stepId.replace(/ /g, '%20');
    const acceptQuote = '<a href=' + `${apiUrl}/projectsapi/step-decision?decision=accept&vendorId=${obj.vendor.id}&projectId=${obj.projectId}&stepId=${stepId}&to=${date}&t=${token}` + ` target="_blank" style="color: orange;">I accept - ${obj.name}, ${obj.finance.Price.payables} &euro;</a>`
    const declineQuote = '<a href=' + `${apiUrl}/projectsapi/step-decision?decision=decline&vendorId=${obj.vendor.id}&projectId=${obj.projectId}&stepId=${stepId}&to=${date}&t=${token}` + ` target="_blank" style="color: orange;">I reject - ${obj.name}, ${obj.finance.Price.payables} &euro;</a>`
    const start = obj.start.split('T')[0].split('-').reverse().join('-');
    const deadline = obj.deadline.split('T')[0].split('-').reverse().join('-');

    return `<div contenteditable="true" class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
        <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.vendor.firstName},</h3>
        <div class="all-info" style="padding: 0 15px 0 30px;">
            <p class="description" style="font-size: 18px;">
                Please find attached Quote(s).
            </p>
            <p>
                By clicking on one of the links below, you can accept or reject our offer.
            </p>
            <h3 class="detailsTitle">Step Details</h3>
            <table class="details">
                <tr>
                    <td>Step name:</td>
                    <td>${obj.name}</td>
                </tr>
                <tr>
                    <td>Project name:</td>
                    <td>${obj.projectName}</td>
                </tr>
                <tr>
                    <td>Start date: </td>
                    <td>${start}</td>
                </tr>
                <tr>
                    <td>Deadline: </td>
                    <td>${deadline}</td>
                </tr>
                <tr>
                    <td>Language pair:</td>
                    <td>${langPair}</td>
                </tr>
                <tr>
                    <td>Specialization:</td>
                    <td>${obj.industry}</td>
                </tr>
                <tr>
                    <td>Amount:</td>
                    <td>${obj.finance.Price.payables} &euro;</td>
                </tr>
            </table>
            <p class="description" style="font-size: 18px;">
                This request confirmation expires on: ${expiryDate}
            </p>
                <p class="link" style="color: orange;">${acceptQuote}</p>
                <p>or</p>
                <p class="link" style="color: orange;">${declineQuote}</p>
            <p class="description" style="font-size: 18px;">
                Please note that by accepting the request, you will automatically be assigned to the step.
            </p>
            <p>
                In case of any questions, please do not hesitate to contact us.
            </p>
            <h4 style="width: 35px;border-bottom: 1px solid rgb(29, 29, 29);">T&C:</h4>
            <ol style="padding-left: 0;">
                <li>The estimated delivery date is only applicable if you accept the quote on the day of receipt. If not, the estimated date willl vary.</li>
                <li>Should you agree to a QA service, we cannot accept responsibility if you fail to send us the finished files upon completion. Please note the QA service expires in 30 days after the quote approval.</li>
            </ol>
            <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea TRanslation Services (Cyprus) LTD</h2>
            <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
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

function emailMessageForContact(obj) {
    const surname = obj.surname || "";
    const langPairs = obj.tasks.reduce((acc, cur) => {
        const pair = cur.sourceLanguage ? `${cur.sourceLanguage} >> ${cur.targetLanguage}; ` : `${cur.targetLanguage} / ${cur.packageSize}; `;
        return acc + pair;
    }, "")
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.firstName} ${surname},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Here is the information about the project: 
                </p>
                <h3 class="detailsTitle">Project Details</h3>
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
                        <td>Service:</td>
                        <td>${obj.service}</td>
                    </tr>
                    <tr>
                        <td>Languages:</td>
                        <td>${langPairs}</td>
                    </tr>
                    <tr>
                        <td>Specialization:</td>
                        <td>${obj.industry.name}</td>
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
                <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea TRanslation Services (Cyprus) LTD</h2>
                <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
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

function vendorNotificationMessage(obj) {
    const pairSourceTitle = obj.sourceLanguage ? "Source language:" : "Target language:";
    const pairTargetTitle = obj.sourceLanguage ? "Target language:" : "Package size:";
    const pairLeft = obj.sourceLanguage || obj.targetLanguage;
    const pairRight = obj.sourceLanguage ? obj.targetLanguage : obj.packageSize;
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
                <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.vendor.firstName},</h3>
                <div class="all-info" style="padding: 0 15px 0 30px;">
                    <p class="description" style="font-size: 18px;">
                        Please pay attention to the fact that there is a step that has been cancelled. 
                    </p>
                    <h3 class="detailsTitle">Step Details</h3>
                    <table class="details">
                        <tr>
                            <td>Step ID</td>
                            <td>${obj.stepId}</td>
                        </tr>
                        <tr>
                            <td>Step</td>
                            <td>${obj.name}</td>
                        </tr>
                        <tr>
                            <td>${pairSourceTitle}</td>
                            <td>${pairLeft}</td>
                        </tr>
                        <tr>
                            <td>${pairTargetTitle}</td>
                            <td>${pairRight}</td>
                        </tr>
                    </table>
                </div>
            </div>`;
}

function vendorReassignmentMessage(obj, reason) {
    const pairSourceTitle = obj.sourceLanguage ? "Source language:" : "Target language:";
    const pairTargetTitle = obj.sourceLanguage ? "Target language:" : "Package size:";
    const pairLeft = obj.sourceLanguage || obj.targetLanguage;
    const pairRight = obj.sourceLanguage ? obj.targetLanguage : obj.packageSize;
    const reassignReason = `<p><h3>Reason</h3><span>${reason}</span></p>` || '';
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
                <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.vendor.firstName},</h3>
                <div class="all-info" style="padding: 0 15px 0 30px;">
                    <p class="description" style="font-size: 18px;">
                        Please pay attention to the fact that there is a step that has been reassigned to a new Vendor. 
                    </p>
                    ${reassignReason}
                    <h3 class="detailsTitle">Step Details</h3>
                    <table class="details">
                        <tr>
                            <td>Step ID</td>
                            <td>${obj.stepId}</td>
                        </tr>
                        <tr>
                            <td>Step Name</td>
                            <td>${obj.name}</td>
                        </tr>
                        <tr>
                            <td>${pairSourceTitle}</td>
                            <td>${pairLeft}</td>
                        </tr>
                        <tr>
                            <td>${pairTargetTitle}</td>
                            <td>${pairRight}</td>
                        </tr>
                    </table>
                </div>
            </div>`;
}

function taskReadyMessage(obj) {
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
                <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.contact.firstName} ${obj.contact.surname},</h3>
                <div class="all-info" style="padding: 0 15px 0 30px;">
                    <p class="description" style="font-size: 18px;">
                        Task is ready. 
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

function tasksQuoteMessage(obj) {
        const langPair = obj.task.sourceLanguage ? `${obj.task.sourceLanguage} >> ${obj.task.targetLanguage}` : `${obj.task.targetLanguage} / ${obj.task.packageSize}`;
        const receivables = obj.task.finance.Price.receivables;
        return `<div contenteditable="true" class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);overflow-y: auto">
        <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.contact.firstName} ${obj.contact.surname},</h3>
        <div class="all-info" style="padding: 0 15px 0 30px;">
            <p class="description" style="font-size: 18px;">
                Please find attached Quote(s) for existing project.
            </p>
            <h3 class="detailsTitle">Quote(s) Details</h3>
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
                    <td>Service:</td>
                    <td>${obj.service}</td>
                </tr>
                <tr>
                    <td>Language pair:</td>
                    <td>${langPair}</td>
                </tr>
                <tr>
                    <td>Specialization:</td>
                    <td>${obj.industry.name}</td>
                </tr>
                <tr>
                    <td>Amount:</td>
                    <td>${receivables} &euro;</td>
                </tr>
            </table>
            <p>
                In case of any questions, please do not hesitate to contact us.
            </p>
            <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea TRanslation Services (Cyprus) LTD</h2>
            <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
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

module.exports = { 
    getMessageWithRandomPassword,
    applicationMessage, 
    messageForClient, 
    requestMessageForVendor, 
    managerAssignmentNotifyingMessage,
    managerTaskCompleteNotificationMessage,
    emailMessageForContact,
    vendorNotificationMessage,
    taskReadyMessage,
    deliverablesDownloadedMessage,
    tasksQuoteMessage,
    vendorReassignmentMessage,
    managerRequestNotifyingMessage
};
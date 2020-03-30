const apiUrl = require("../helpers/apiurl");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../configs');

function messageForClient(obj) {
    const date = Date.now();
    const name = `${obj.contact.firstName} ${obj.contact.surname}`;
    const tasksInfo = getTasksInfo({ tasks: obj.tasks, industry: obj.industry });
    const token = jwt.sign({ id: obj.id }, secretKey, { expiresIn: '2h' });
    const detailHeader = obj.status === 'Quote sent' ? "Your quote has been updated - please see below the quote details:" : "Please see below the quote details:";
    const acceptQuote = '<a href=' + `${apiUrl}/projectsapi/acceptquote?projectId=${obj.id}&to=${date}&t=${token}` + ` target="_blank" style="color: orange;">I accept - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`
    const declineQuote = '<a href=' + `${apiUrl}/projectsapi/declinequote?projectId=${obj.id}&to=${date}t=${token}` + ` target="_blank" style="color: orange;">I reject - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`
    return `<div class="wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
        <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${name},</h3>
        <div class="all-info" style="padding: 0 15px 0 30px;">
            <p class="comment" style="font-style: italic;font-weight: bold;">
                ***This is an automated message*** 
            </p>
            <p class="comment" style="font-style: italic;font-weight: bold;">
                This message is sent to you on behalf of ${obj.accountManager.firstName} ${obj.accountManager.lastName}.
            </p>
            <p class="description" style="font-size: 18px;">
                ${detailHeader}
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
            <p>
                Clicking ”I accept" will also approve and accept our 
                    <a href="https://www.pangea.global/wp-content/uploads/2019/11/Pangea-Terms-Conditions.pdf" target="_blank">terms and conditions</a>.
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
                <li>The estimated delivery date is only applicable if you accept the quote on the day of receipt. If not, the estimated date will vary.</li>
                <li>Should you agree to a QA service, we cannot accept responsibility if you fail to send us the finished files upon completion. Please note the QA service expires in 30 days after the quote approval.</li>
            </ol>
            <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea Translation Services (Cyprus) LTD</h2>
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
    for (let key in services) {
        const tasksInfo = services[key].reduce((acc, cur) => {
            const deadline = acc['deadline'] || cur.deadline;
            const langPair = cur.sourceLanguage ? `${cur.sourceLanguage} >> ${cur.targetLanguage}` : `${cur.targetLanguage} / ${cur.packageSize}`;
            acc['deadline'] = cur.deadline > deadline ? cur.deadline : deadline;
            acc['langPairs'] = acc['langPairs'] ? acc['langPairs'] + `; ${langPair}` : `${langPair}`;
            acc['cost'] = acc['cost'] ? acc['cost'] + cur.finance.Price.receivables : cur.finance.Price.receivables;
            return acc;
        }, {})
        result += getTaskCode({ ...tasksInfo, service: key, industry });
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
                <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea Translation Services (Cyprus) LTD</h2>
                <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
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

function taskDeliveryMessage(obj) {
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
                <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.contact.firstName} ${obj.contact.surname},</h3>
                <div class="all-info" style="padding: 0 15px 0 30px;">
                    <p class="comment" style="font-style: italic;font-weight: bold;">
                        ***This is an automated message*** 
                    </p>
                    <p class="comment" style="font-style: italic;font-weight: bold;">
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}.
                    </p>
                    <p class="description" style="font-size: 18px;">
                        The task ${obj.task.taskId} (${obj.task.service.title}) from your project ${obj.projectId} - ${obj.projectName} is ready. Yo can collect it from the 
                        <a href="https://portal.pangea.global">Protal</a>.
                    </p>
                    <p class="description" style="font-size: 18px;">
                        I'm pleased to inform you that the task ${obj.task.taskId} (${obj.task.service.title}) from your project ${obj.projectId} - ${obj.projectName} has been completed and is ready for review.
                    </p>
                    <p class="description" style="font-size: 18px;">
                        The files are available for you in our <a href="https://portal.pangea.global">Protal</a> and attached to this email in a zip format.
                    </p>
                    <p>
                        In case of any questions, please do not hesitate to contact us :-)
                    </p>
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
                <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea Translation Services (Cyprus) LTD</h2>
                <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
            </div>
        </div>`;
}

function projectCancelledMessage(obj) {
    return `<div contenteditable="true" class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);overflow-y: auto">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.contact.firstName} ${obj.contact.surname},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="comment" style="font-style: italic;font-weight: bold;">
                    ***This is an automated message*** 
                </p>
                <p class="comment" style="font-style: italic;font-weight: bold;">
                    This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}.
                </p>
                <p class="description" style="font-size: 18px;">
                    We are sorry to update you , but project ${obj.projectId} - ${obj.projectName} has been cancelled.
                </p>
                <p class="description" style="font-size: 18px;">
                    Reason - ${obj.reason}.
                </p>
                <p class="description" style="font-size: 18px;">
                    Kindly contact your Account Manager for further information.
                </p>
                <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea Translation Services (Cyprus) LTD</h2>
                <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
            </div>
        </div>`;
}

function tasksCancelledMessage(obj) {
    const cancelledTasks = obj.tasksIds.reduce((acc, cur) => acc + `<li>${cur}</li>`, "");
    return `<div contenteditable="true" class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);overflow-y: auto">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.contact.firstName} ${obj.contact.surname},</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="comment" style="font-style: italic;font-weight: bold;">
                    ***This is an automated message*** 
                </p>
                <p class="comment" style="font-style: italic;font-weight: bold;">
                    This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}.
                </p>
                <p class="description" style="font-size: 18px;">
                    Next tasks from your project ${obj.projectId} - ${obj.projectName} have been cancelled:
                    ${cancelledTasks}
                </p>
                <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea Translation Services (Cyprus) LTD</h2>
                <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
            </div>
        </div>`;
}

function decideQuote(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
    <header style="background-color:#66563E;text-align:center;" >
        <img class="logo" src="../static/email-logo.png" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
    </header>
    <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
        <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
        <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
            This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
        <p>Please see below the quote details:</p>
        <div class="details" style="width:90%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >
            <h4 class="details__title">Quote Details</h4>
            <table class="details__table" style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;" >
                <tr>
                    <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Name:</td>
                    <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj}</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >ID:</td>
                    <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj}</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Service:</td>
                    <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj}</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Language(s):</td>
                    <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj}</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Industry:</td>
                    <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj}</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Estimated delivery date:</td>
                    <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj}</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Cost:</td>
                    <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${obj}</td>
                </tr>
            </table>
        </div>
        <p class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;" >
            By clicking on one of the link below, you can accept or reject our offer.<br>
            <span class="main_line15-red" style="background-color:#FBF3DB;padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;" >
                Clicking "I accept" will also approve and accept our <a href="https://www.pangea.global/wp-content/uploads/2019/11/Pangea-Terms-Conditions.pdf" class="link" style="color:#D15F46;" >terms and conditions</a>
            </span>
        </p>
        <p>You can accept the quote by clicking the link below:</p>
        <a class="link" href="${acceptQuote}" style="color:#D15F46;" >I accept - ${obj.project.projectId} - ${obj.project.projectName}</a>
        <p>or</p>
        <a class="link" href="${declineQuote}" style="color:#D15F46;" >I reject - ${obj.project.projectId} - ${obj.project.projectName}</a>
        <p><span class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;" >Please note:</span>once accepting the quote, the project will start
            automatically.<br>
            In case of any questions, please do not hesitate to contact us :-)</p>
    </div>
    <footer>
        <hr size="15" color="#66563E">
        <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
    </footer>
</div>`;

}

module.exports = {
    messageForClient,
    emailMessageForContact,
    taskReadyMessage,
    taskDeliveryMessage,
    tasksQuoteMessage,
    projectCancelledMessage,
    tasksCancelledMessage,
    decideQuote
}
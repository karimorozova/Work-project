const apiUrl = require("../helpers/apiurl");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../configs');

function messageForClient(obj) {
    const date = Date.now();
    const name = `${obj.contact.firstName} ${obj.contact.surname}`;
    const tasksInfo = getTasksInfo({ tasks: obj.tasks, industry: obj.industry });
    const subTotal = getSubTotal(obj.tasks);
    const total = getTotal({tasks: obj.tasks})
    const token = jwt.sign({ id: obj.id }, secretKey, { expiresIn: '2h' });

    let detailHeader = "Please see below the quote details:";
    if (obj.isPriceUpdated) {
        detailHeader = obj.status === "Quote sent" ?
            "Your quote has been updated - please see below the quote details:"
            : `Your project ${obj.projectId} - ${obj.projectName} had a change in it's price.`;
    }
    const reason = obj.reason ? `<p>Reason ${obj.reason}</p><p>Please see below the updated quote details</p>` : "";
    const acceptQuote = '<a href=' + `${apiUrl}/projectsapi/acceptquote?projectId=${obj.id}&to=${date}&t=${token}` + ` target="_blank" style="color: #D15F46;">I accept - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`
    const declineQuote = '<a href=' + `${apiUrl}/projectsapi/declinequote?projectId=${obj.id}&to=${date}t=${token}` + ` target="_blank" style="color: #D15F46;">I reject - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`
    
    return `<div class="wrapper"
                style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;">
                <header style="background-color:#66563E;text-align:center;">
                    <img class="logo" src="cid:logo@pan" alt="pangea"
                        style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;">
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;">
                    <h4 class="contact-name">Dear ${name}</h4>
                    <p class="main_italic main_line15 main_weight600"
                        style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">
                        ***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accountManager.firstName} ${obj.accountManager.lastName}</p>
                    <p>${detailHeader}</p>
                    <div class="details" style="width:90%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;">
                        <h4 class="details__title">Quote Details</h4>
                        <table class="details__table"
                            style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    Name:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${obj.projectName}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    ID:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${obj.projectId}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    Industry:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${obj.industry.name}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    Estimated delivery date:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${obj.deadline}</td>
                            </tr>
                        </table>
                        </br>
                        <table class="details__table"
                            style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Task</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Language</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Unit Price</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Unit</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Quantity</td>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Cost</td>
                            </tr>
                            ${tasksInfo}
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                                    Sub-total:</td><td></td><td></td><td></td><td></td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                                    ${subTotal}</td>
                            </tr>
                        </table>
                        </br>
                        <table class="details__table"
                            style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    Sub-total:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${subTotal}</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    TM Discount:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    --</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    Discount [%]:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    --</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                    PM fee [%]:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    --</td>
                            </tr>
                            <tr>
                                <td class="main_weight600"
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                                Total:</td>
                                <td
                                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                                    ${total}</td>
                            </tr>
                        </table>

                    </div>
                    <p class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;">
                        By clicking on one of the link below, you can accept or reject our offer.<br>
                        <span class="main_line15-red"
                            style="background-color:#FBF3DB;padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;">
                            Clicking "I accept" will also approve and accept our <a
                                href="https://www.pangea.global/wp-content/uploads/2019/11/Pangea-Terms-Conditions.pdf" class="link"
                                style="color:#D15F46;">terms and conditions</a>
                        </span>
                    </p>
                    <p>You can accept the quote by clicking the link below:</p>
                    I accept - ${acceptQuote}
                    <p>or</p>
                    I reject - ${declineQuote}
                    <p><span class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;">Please note:</span>once
                        accepting the quote, the project will start
                        automatically.<br>
                        In case of any questions, please do not hesitate to contact us :-)</p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global"
                        style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;">www.pangea.global</a>
                </footer>
            </div>`;
}
function getSubTotal(obj){
    const result = obj.reduce(function(sum, cur) {
        return sum.finance.Price.receivables + cur.finance.Price.receivables;
      });
    return result;
}
function getTotal(obj) {
    let total;
    const subTotal = obj.tasks.reduce(function(sum, cur) {
        return sum.finance.Price.receivables + cur.finance.Price.receivables;
      });

    total = subTotal;
    return total;
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
            acc['quantity'] = acc['quantity'] ? acc['quantity'] + cur.finance.Wordcount.receivables : cur.finance.Wordcount.receivables;
            acc['unit'] = cur.service.calculationUnit;
            return acc;
        }, {})

        result += getTaskCode({ ...tasksInfo, service: key, industry });
    }
    return result;
}

function getTaskCode(tasksInfo) {
    return `<tr>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${tasksInfo.service}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${tasksInfo.langPairs}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    --</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${tasksInfo.unit}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${tasksInfo.quantity}</td>
                <td
                    style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${tasksInfo.cost}</td>
            </tr>`;
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
    const am = `${obj.project.accountManager.firstName} ${obj.project.accountManager.lastName}`;
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
                <p class="main_italic main_line15 main_weight600"
                        style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">
                        ***This is an automated message***<br>
                        This message is sent to you on behalf of ${am}</p>
                <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.contact.firstName} ${obj.contact.surname},</h3>
                <div class="all-info" style="padding: 0 15px 0 30px;">
                    <p class="description" style="font-size: 18px;">
                        Task ${obj.task.taskId} (${obj.task.service.title}) from project ${obj.project.projectId} - ${obj.project.projectName} is ready. 
                        It will be delivered once all tasks have been completed.
                    </p>
                    <p class="description" style="font-size: 18px;">
                        In case of any questions, please do not hesitate to contact us :-)
                    </p>
                </div>
            </div>`;
}

function taskDeliveryMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                    <header style="background-color:#66563E;text-align:center;" >
                        <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                    </header>
                    <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                        <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                            This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                        <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                        <p>
                            The task ${obj.task.taskId} (${obj.task.service.title}) from your project ${obj.projectId} - ${obj.projectName} is ready.
                            You can collect it from the <a href="https://portal.pangea.global/">Portal</a>.
                        </p>
                        <p>
                            I'm pleased to inform you that task ${obj.task.taskId} (${obj.task.service.title}) from project ${obj.projectId} - ${obj.projectName}
                            has been completed and is ready for review.
                        </p>
                        <p>
                            The files are available for you in our <a href="https://pangea.s.xtrf.eu/xtrf/faces/login.seam?conversationId=26593#!project/${obj.projectId}">Portal</a> and attached to this email in a zip format.
                        </p>
                        <p>
                            In case of any questions, please do not hesitate to contact us :-)
                        </p>
                    </div>
                    <footer>
                        <hr size="15" color="#66563E">
                        <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                    </footer>
                </div>`;
}

function tasksQuoteMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        The new task added to your project ${obj.projectId} - ${obj.projectName}.
                    </p>
                    <p>
                        Task: ${obj.task.taskId} - ${obj.task.service.title}.
                    </p>
                    <p>
                        You can track the progress on the <a href="https://portal.pangea.global/">Portal</a>.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function projectCancelledMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        We are sorry to update you , but project ${obj.projectId} - ${obj.projectName} has been cancelled.
                    </p>
                    <p>
                        Reason: ${obj.reason}
                    </p>
                    <p>
                        Kindly contact your Account Manager for further information.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function projectMiddleCancelledMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        We would like to inform you that project ${obj.projectId} - ${obj.projectName} has been cancelled in the middle of the work.
                    </p>
                    <p>
                        Reason: ${obj.reason}.
                    </p>
                    <p>
                        You will need to pay a partial amount of ${obj.finance.Price.halfReceivables}
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;

}

function tasksCancelledMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        The task ${obj.taskId} from your project ${obj.projectId} - ${obj.projectName} has been cancelled.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function tasksMiddleCancelledMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                    This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        We would like to information that task ${obj.task.taskId} (${obj.task.service.title}) from project ${obj.projectId} - ${obj.projectName} has been cancelled in the middle of the work.
                    </p>
                    <p>
                        Reason: ${obj.reason}.
                    </p>
                    <p>
                        You will need to pay a partial amount of ${obj.task.finance.Price.halfReceivables}
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;

}

function projectDeliveryMessage(obj) {
    return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${obj.accManager.firstName} ${obj.accManager.lastName}</p>
                    <h4 class="contact-name">Dear ${obj.contact.firstName} ${obj.contact.surname}</h4>
                    <p>
                        I'm pleased to inform you that project: ${obj.projectId} - ${obj.projectName}, has been completed and is ready
                        for review.
                    </p>
                    <p>
                        The files are available for you in our
                        <a href="https://pangea.s.xtrf.eu/xtrf/faces/login.seam?conversationId=26578#!project/${obj.projectId}">Portal</a>
                        and attached to this email in a zip format.
                    </p>
                    <p>
                        In case of any questions, please do not hesitate to contact us
                    </p>
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
    tasksMiddleCancelledMessage,
    projectDeliveryMessage,
    projectMiddleCancelledMessage
}
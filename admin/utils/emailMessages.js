const apiUrl = require("../helpers/apiurl");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../configs');

function applicationMessage(obj) {
    let cvFiles = "";
    let languagePairs = "";
    let software = "";
    let industries = "";
    let coverLetterFiles = "";
    let education = "";
    let positions = "";
    if(obj.cvFiles) {
        cvFiles = obj.cvFiles.reduce((initial, current, index) => {
            return initial + `<a href="${apiUrl}/${current.split('./dist/')[1]}" download target='_self'>cvFile${index+1}</a>; `
        }, "")
    }
    if(obj.coverLetterFiles) {
        coverLetterFiles = obj.coverLetterFiles.reduce((initial, current, index) => {
            return initial + `<a href="${apiUrl}/${current.split('./dist/')[1]}" download target='_self'>coverLetterFile${index+1}</a>; `
        }, "")
    }
    if(obj.languagePairs) {
        languagePairs = obj.languagePairs.reduce((initial, current, index) => {
            return initial + current.source + ' >> ' + current.target + "; "
        }, "")
    }
    if(obj.industries) {
        industries = obj.industries.reduce((initial, current, index) => {
            return initial + current + "; "
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
        const expiryDate = new Date(date + 900000);
        let langPairs = obj.tasks.reduce((init, current) => {
            return init + current.sourceLanguage + " >> " + current.targetLanguage + "; "
        }, "");
        const token = jwt.sign({id: obj.id}, secretKey, { expiresIn: '2h'});
        const acceptQuote = '<a href=' + `${apiUrl}/projectsapi/acceptquote?projectId=${obj.id}&to=${date}&t=${token}` + ` target="_blank" style="color: orange;">I accept - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`
        const declineQuote = '<a href=' + `${apiUrl}/projectsapi/declinequote?projectId=${obj.id}&to=${date}t=${token}` + ` target="_blank" style="color: orange;">I reject - ${obj.projectId}, ${obj.finance.Price.receivables} &euro;</a>`
        const contact = obj.customer.contacts.find(item => item.leadContact);
        return `<div contenteditable="true" class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);overflow-y: overlay">
        <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${contact.firstName} ${contact.surname},</h3>
        <div class="all-info" style="padding: 0 15px 0 30px;">
            <p class="description" style="font-size: 18px;">
                Please find attached Quote(s).
            </p>
            <p>
                By clicking on one of the links below, you can accept or reject out offer.
            </p>
            <h3 class="detailsTitle">Quote Details</h3>
            <table class="details">
                <tr>
                    <td>Quote number:</td>
                    <td>${obj.projectId}</td>
                </tr>
                <tr>
                    <td>Quote name:</td>
                    <td>${obj.projectName}</td>
                </tr>
                <tr>
                    <td>Service:</td>
                    <td>${obj.service}</td>
                </tr>
                <tr>
                    <td>Estimated delivery date:</td>
                    <td></td>
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
                    <td>Amount:</td>
                    <td>${obj.finance.Price.receivables} &euro;</td>
                </tr>
            </table>
            <p class="description" style="font-size: 18px;">
                This quote expires on: ${expiryDate}
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

function requestMessageForVendor(obj) {
    const date = Date.now();
    const expiryDate = new Date(date + 900000);
    const langPair = obj.source + " >> " + obj.target + ";"
    const token = jwt.sign({vendorId: obj.vendor.id}, secretKey, { expiresIn: '2h'});
    const taskId = obj.taskId.replace(/ /g, '%20');
    const acceptQuote = '<a href=' + `${apiUrl}/projectsapi/step-decision?decision=accept&vendorId=${obj.vendor.id}&projectId=${obj.projectId}&taskId=${taskId}&stepName=${obj.name}&to=${date}&t=${token}` + ` target="_blank" style="color: orange;">I accept - ${obj.name}, ${obj.finance.Price.payables} &euro;</a>`
    const declineQuote = '<a href=' + `${apiUrl}/projectsapi/step-decision?decision=decline&vendorId=${obj.vendor.id}&projectId=${obj.projectId}&taskId=${taskId}&stepName=${obj.name}&to=${date}&t=${token}` + ` target="_blank" style="color: orange;">I reject - ${obj.name}, ${obj.finance.Price.payables} &euro;</a>`
    const start = obj.start.split('T')[0].split('-').reverse().join('-');
    const deadline = obj.deadline.split('T')[0].split('-').reverse().join('-');

    return `<div contenteditable="true" class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
        <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.vendor.firstName},</h3>
        <div class="all-info" style="padding: 0 15px 0 30px;">
            <p class="description" style="font-size: 18px;">
                Please find attached Quote(s).
            </p>
            <p>
                By clicking on one of the links below, you can accept or reject out offer.
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
                <tr contenteditable="false">
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
                        <td>${obj.createdAt}</td>
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
    const langPairs = obj.tasks.reduce((init, current) => {
        return init + current.sourceLanguage + " >> " + current.targetLanguage + "; "
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
                        <td>${obj.createdAt}</td>
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

function vendorNotificationMessage(obj) {
    return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
                <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${obj.vendor.firstName},</h3>
                <div class="all-info" style="padding: 0 15px 0 30px;">
                    <p class="description" style="font-size: 18px;">
                        Please pay attention to the fact that there is a step that has been cancelled. 
                    </p>
                    <h3 class="detailsTitle">Step Details</h3>
                    <table class="details">
                        <tr>
                            <td>Step</td>
                            <td>${obj.name}</td>
                        </tr>
                        <tr>
                            <td>Source language:</td>
                            <td>${obj.source}</td>
                        </tr>
                        <tr>
                            <td>Target language</td>
                            <td>${obj.target}</td>
                        </tr>
                    </table>
                </div>
            </div>`;
}

module.exports = { 
    applicationMessage, 
    messageForClient, 
    requestMessageForVendor, 
    managerAssignmentNotifyingMessage,
    emailMessageForContact,
    vendorNotificationMessage
};
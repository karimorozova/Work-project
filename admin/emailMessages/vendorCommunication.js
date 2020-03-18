const apiUrl = require("../helpers/apiurl");
const jwt = require('jsonwebtoken');
const { secretKey } = require('../configs');

function applicationMessage(obj) {
    let cvFiles = "";
    let languagePairs = "";
    let software = "";
    let industries = "";
    let coverLetterFiles = "";
    let educations = "";
    let positions = "";
    if(obj.cvFiles.length) {
        cvFiles = obj.cvFiles.reduce((acc, cur, index) => {
            return acc + `<a href="${apiUrl}${cur}" download target='_self'>cvFile${index+1}</a>; `
        }, "")
    }
    if(obj.coverLetterFiles.length) {
        coverLetterFiles = obj.coverLetterFiles.reduce((acc, cur, index) => {
            return acc + `<a href="${apiUrl}${cur}" download target='_self'>coverLetterFile${index+1}</a>; `
        }, "")
    }
    if(obj.languagePairs) {
        languagePairs = obj.languagePairs.reduce((acc, cur) => {
            return acc + cur.source + ' >> ' + cur.target + "; "
        }, "")
    }
    if(obj.industries) {
        industries = obj.industries.reduce((acc, cur) => {
            return acc + cur.name + "; "
        }, "")
    }
    if(obj.positions) {
        positions = obj.positions.reduce((acc, cur) => {
            return acc + cur + "; " 
        }, "")
    }
    if(obj.technicalComp.softwares) {
        software = obj.technicalComp.softwares.reduce((acc, cur) => {
            return acc + cur + "; "
        }, "")
    }
    if(obj.educations) {
        educations = obj.educations.reduce((acc, cur) => {
            return acc + `${cur.study}/${cur.field}/${cur.institute}/${cur.grade} <br>`
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
                        ${educations}
                    </div>
                </li>
            </ul>
        </div>
        <div class="transExp">
            <ul>
                <li style="margin-bottom:5px;" >Transaltion Experience: <span>${obj.experienceYears}</span></li>
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
                <li style="margin-bottom:5px;" >Rate: ${obj.basicRate}</li>
                <li style="margin-bottom:5px;" >Cover Letter: ${obj.coverLetter}</li>
                <li style="margin-bottom:5px;" >Cover Letter (files): ${coverLetterFiles}</li>
            </ul>
        </div>
    </div>`
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

module.exports = {
    applicationMessage,
    requestMessageForVendor,
    vendorNotificationMessage,
    vendorReassignmentMessage
}
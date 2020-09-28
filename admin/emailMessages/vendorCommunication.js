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
			return acc + `<a href="${ apiUrl }${ cur }" download target='_self'>cvFile${ index + 1 }</a>; `
		}, "")
	}
	if(obj.coverLetterFiles.length) {
		coverLetterFiles = obj.coverLetterFiles.reduce((acc, cur, index) => {
			return acc + `<a href="${ apiUrl }${ cur }" download target='_self'>coverLetterFile${ index + 1 }</a>; `
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
			return acc + `${ cur.study }/${ cur.field }/${ cur.institute }/${ cur.grade } <br>`
		}, "")
	}
	return `<div class="main" style="font-weight:400;font-size:12px;border-width:1px;border-style:solid;border-color:#66563E;max-width:700px;display:flex;flex-direction:column;padding-top:10px;padding-bottom:10px;padding-right:10px;padding-left:10px;" >
    <h2 class="head-title" style="font-size:18px;align-self:center;" >New Application Request</h1>
        <div class="personal">
            <ul>
                <li style="margin-bottom:5px;" >Name: ${ obj.firstName }</li>
                <li style="margin-bottom:5px;" >Surname: ${ obj.surname }</li>
                <li style="margin-bottom:5px;" >Email: ${ obj.email }</li>
                <li style="margin-bottom:5px;" >Phone Number: ${ obj.phone }</li>
                <li style="margin-bottom:5px;" >Mother tongue: ${ obj.native }</li>
                <li style="margin-bottom:5px;" >Time-zone: ${ obj.timezone }</li>
                <li style="margin-bottom:5px;" >Language Pairs: ${ languagePairs }</li>
                <li style="margin-bottom:5px;" >CV: ${ cvFiles }</li>
                <li style="margin-bottom:5px;" >Position: ${ positions }</li>
            </ul>
        </div>
        <div class="education">
            <ul>
                <li style="margin-bottom:5px;" >Education:
                    <div>
                        ${ educations }
                    </div>
                </li>
            </ul>
        </div>
        <div class="transExp">
            <ul>
                <li style="margin-bottom:5px;" >Transaltion Experience: <span>${ obj.experienceYears }</span></li>
            </ul>
        </div>
        <div class="tech">
            <ul>
                <li style="margin-bottom:5px;" >Internet Access: ${ obj.technicalComp.internet }</li>
                <li style="margin-bottom:5px;" >CAT experience: ${ obj.technicalComp.cat }</li>
                <li style="margin-bottom:5px;" >Software experience: ${ software }</li>
            </ul>
        </div>
        <div class="industries">
            <ul>
                <li style="margin-bottom:5px;" >Industries: ${ industries }</li>
            </ul>
        </div>
        <div class="other">
            <ul>
                <li style="margin-bottom:5px;" >Availability: ${ obj.availability }</li>
                <li style="margin-bottom:5px;" >Willing to take a test: ${ obj.testAgree }</li>
                <li style="margin-bottom:5px;" >Rate: ${ obj.basicRate }</li>
                <li style="margin-bottom:5px;" >Cover Letter: ${ obj.coverLetter }</li>
                <li style="margin-bottom:5px;" >Cover Letter (files): ${ coverLetterFiles }</li>
            </ul>
        </div>
    </div>`
}

function requestMessageForVendor(obj) {
	const date = Date.now();
	const expiryDate = new Date(date + 900000);
	const langPair = obj.sourceLanguage ? `${ obj.sourceLanguage } >> ${ obj.targetLanguage }; ` : `${ obj.targetLanguage } / ${ obj.packageSize }; `;
	const token = jwt.sign({ vendorId: obj.vendor.id }, secretKey, { expiresIn: '2h' });
	const stepId = obj.stepId.replace(/ /g, '%20');
	const acceptQuote = '<a href=' + `${ apiUrl }/projectsapi/step-decision?decision=accept&vendorId=${ obj.vendor.id }&projectId=${ obj.projectId }&stepId=${ stepId }&to=${ date }&t=${ token }` + ` target="_blank" style="color: #D15F46;">I accept - ${ obj.name }, ${ obj.finance.Price.payables } &euro;</a>`
	const declineQuote = '<a href=' + `${ apiUrl }/projectsapi/step-decision?decision=decline&vendorId=${ obj.vendor.id }&projectId=${ obj.projectId }&stepId=${ stepId }&to=${ date }&t=${ token }` + ` target="_blank" style="color: #D15F46;">I reject - ${ obj.name }, ${ obj.finance.Price.payables } &euro;</a>`
	const start = obj.start.split('T')[0].split('-').reverse().join('-');
	const deadline = obj.deadline.split('T')[0].split('-').reverse().join('-');
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.vendor.firstName }</h4>
                    <p>
                        Step ${ obj.stepId } ${ obj.serviceStep.title } has been assigned to you.
                    </p>
                    <p>
                        Here are the needed details:
                    </p>
                    <div class="details" style="width:90%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >
                        <table class="details__table" style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;" >
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >ID:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.stepId }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Work type:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.serviceStep.title }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Language:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ langPair }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Industry:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.industry }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Wordcount:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.finance.Wordcount.payables }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Deadline:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ deadline }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Cost:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.finance.Price.payables } &euro;</td>
                            </tr>
                        </table>
                    </div>
                    <p class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;" >
                        By clicking on one of the links below, you can accept or reject the job.
                    </p>
                    <p>
                        You can accept the quote by clicking the link below:  
                    </p>
                    I accept - ${ acceptQuote }
                    <p>or</p>
                    I reject - ${ declineQuote }
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function stepCancelledMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.vendor.firstName }</h4>
                    <p>
                        We would like to information you that step: ${ obj.stepId } ${ obj.serviceStep.title } has been cancelled.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function stepMiddleCancelledMessage(obj) {
	const fee = obj.status === "Completed" ? obj.finance.Price.payables : obj.finance.Price.halfPayables;
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.vendor.firstName }</h4>
                    <p>
                        We would like to inform you that step: ${ obj.stepId } ${ obj.serviceStep.title } has been cancelled in the middle.
                    </p>
                    <p>
                        You will be paid ${ fee } &euro;, which is according to relative work you have completed.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function vendorReassignmentMessage(obj, reason) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.vendor.firstName }</h4>
                    <p>
                        We would like to update you that ${ obj.stepId } ${ obj.serviceStep.title } has been reassigned to a different vendor. 
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function vendorMiddleReassignmentMessage(obj, reason, isPay) {
	const fee = isPay ? obj.finance.Price.halfPayables : obj.finance.Price.payables;
	const progress = obj.serviceStep.calculationUnit === "Words" ?
			(obj.progress.wordsDone / obj.progress.totalWordCount * 100).toFixed(2)
			: obj.progress
	const payText = isPay ?
			`<p>You will be paid according to your partial completion of the step.</p>
        <p>You have completed ${ progress } % of the task and your fee for this step is: ${ fee } &euro;</p>`
			: ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.vendor.firstName }</h4>
                    <p>
                        Step ${ obj.stepId } (${ obj.serviceStep.title }) has been reassigned to another vendor.
                    </p>
                    <p>Reason: ${ reason }</p>
                    <p>
                        ${ payText }
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function vendorMiddleAssignmentMessage(obj) {
	const mainMessage = obj.isStart ?
			"Although someone else has worked on this step, you shall start the task from the brining."
			: "You should continue your work from the place it has been stopped."
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.step.vendor.firstName }</h4>
                    <p>
                        Step: ${ obj.step.stepId } has been reassigned to you. 
                    </p>
                    <p>
                        ${ mainMessage }
                    </p>
                    <p>An availability email with all the details of the project will be sent to you shortly.</p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function stepReopenedMessage(obj) {
	const reason = obj.reason || "";
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.vendor.firstName }</h4>
                    <p>
                         Step: ${ obj.stepId } ${ obj.serviceStep.title } has been reopened.
                    </p>
                    <p>
                        Reason: ${ reason }
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function stepReadyToStartMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Hello ${ obj.step.vendor.firstName }</h4>
                    <p>
                        Step ${ obj.step.stepId }: ${ obj.project.projectName } is now ready to start.
                    </p>
                    <p>
                        You can access the system or click on the link below and enter the task directly.
                    </p>
                    <p>
                        <a href="https://vendor.pangea.global/dashboard/project-details/${ obj.step.id }" target="_blank">Open job: ${ obj.step.stepId }: ${ obj.project.projectName }</a>
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function sendMemoqCredentials(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Hello ${ obj.firstName }</h4>
										<p>Your account on Memoq has been created.</p>
										<p>
											<div>Your credentials:</div>
											<div>Login: ${ obj.email }</div>
											<div>Password: secret</div>
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

module.exports = {
	applicationMessage,
	requestMessageForVendor,
	stepCancelledMessage,
	stepMiddleCancelledMessage,
	vendorReassignmentMessage,
	vendorMiddleReassignmentMessage,
	vendorMiddleAssignmentMessage,
	stepReopenedMessage,
	stepReadyToStartMessage,
	sendMemoqCredentials
}
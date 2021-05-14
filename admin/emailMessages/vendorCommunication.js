let apiUrl = require("../helpers/apiurl")
!apiUrl && (apiUrl = 'https://admin.pangea.global')
const jwt = require('jsonwebtoken')
const { secretKey } = require('../configs')
const { returnIconCurrencyByStringCode } = require('../helpers/commonFunctions')

function applicationMessage (obj) {
	let cvFiles = ""
	let industries = obj.industries.reduce((acc, curr) => {
		acc = `${acc} ${curr.name};`
		return acc;
	},'')
	let coverLetterFiles = ""
	if (obj.cvFiles.length) {
		cvFiles = obj.cvFiles.reduce((acc, cur, index) => {
			return acc + `<a href="${ apiUrl }${ cur }" download target='_self'>cvFile${ index + 1 }</a>; `
		}, "")
	}
	if (obj.coverLetterFiles.length) {
		coverLetterFiles = obj.coverLetterFiles.reduce((acc, cur, index) => {
			return acc + `<a href="${ apiUrl }${ cur }" download target='_self'>coverLetterFile${ index + 1 }</a>; `
		}, "")
	}

	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row" style="color:#66563E;">New application request</span></p>
                    <p style="font-weight: 400;"><b style="margin-right: 6px;color:#66563E;"> Name: </b> ${obj.firstName} </p>
                    <p style="font-weight: 400;"><b style="margin-right: 6px;color:#66563E;"> Surname: </b> ${obj.surname} </p>
                    <p style="font-weight: 400;"><b style="margin-right: 6px;"> Email: </b> <span>${ obj.email }</span> </p>
                    <p style="font-weight: 400;"><b style="margin-right: 6px;"> Phone: </b> <span>${ obj.phone }</span> </p>
                    <p style="font-weight: 400;"><b style="margin-right: 6px;"> Mother tongue: </b> <span>${ obj.lang }</span> </p>
                    <p style="font-weight: 400;"><b style="margin-right: 6px;"> Industries: </b> <span>${ industries }</span> </p>
                    <p style="font-weight: 400;"><b style="margin-right: 6px;"> Availability: </b> <span>${ obj.availability }</span> </p>
                    <p style="font-weight: 400;"><b style="margin-right: 6px;"> Software experience: </b> <span>${ obj.softwares }</span> </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}
function vendorRegistration(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                		<p style="color: #66563E; background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.firstName },</span></p>
										<p style="font-weight: 400;color:#66563E;">
                      Thank you for your interest in working with Pangea.
                      We are always on the lookout for talent, yet only the best of the best get to join us.
                      Submitting your information tells us you may be our next superstar.
                      It all starts with completing your profile. Here is what you need to do:
										</p>
										<p style="font-weight: 400;color:#66563E;">Enter our system and complete your competencies:</p>
										<p style="font-weight: 400;color:#66563E;">language pair and industry</p>
										<p style="font-weight: 400;color:#66563E;">1. Go to: <a href="https://vendor.pangea.global/login" style="color: #D15F46;">Vendor Portal</a></p>
										<p style="font-weight: 400;color:#66563E;">2. Log in to the system with the following details:</p>
                    <p style="font-weight: 400;color:#66563E;margin-left: 10px;">• username: <b>${ obj.email.replace(/@/g, '<span>@</span>').replace(/\./g, '<span>.</span>') }</b> </p>
                    <p style="font-weight: 400;color:#66563E;margin-left: 10px;">• password: <b>${ obj.pass }</b> </p>
										<p style="font-weight: 400;color:#66563E;">
                      3. Once in, you will be required to provide additional information that will allow us
                      to get a clearer idea of your industry expertise and language proficiency.
                      Please fill in the form, as required.
                    </p>
                    <p style="font-weight: 400;color:#66563E;">
                      We normally allow all candidates a period of 21 days to complete their profile.
                      Should you not manage to complete this step within the given time frame,
                      contact us and we will extend the deadline. In the lapse of time,
                      should you fail to notify us to request an extension, your profile will be automatically deleted.
                      If you wish to join Pangea at a later stage, you will have to repeat the process.
                    </p>
                    <p style="font-weight: 400;color:#66563E;">Many thanks,</p>
                    <p style="font-weight: 400;color:#66563E;">Pangea HR team</p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function requestMessageForVendor(obj) {
	const date = Date.now()
	const langPair = obj.sourceLanguage ? `${ obj.sourceLanguage } >> ${ obj.targetLanguage }; ` : `${ obj.targetLanguage } / ${ obj.packageSize }; `
	const token = jwt.sign({ vendorId: obj.vendor.id }, secretKey, { expiresIn: '24h' })
	const stepId = obj.stepId.replace(/ /g, '%20')
	const acceptQuote = '<a href=' + `${ apiUrl }/projectsapi/pangea-re-survey-page-step-decision?decision=accept&vendorId=${ obj.vendor.id }&projectId=${ obj.projectId }&stepId=${ stepId }&to=${ date }&t=${ token }` + ` target="_blank" style="color: #D15F46;">I accept - ${ obj.name }, ${ (obj.nativeFinance.Price.payables).toFixed(2) } ${ returnIconCurrencyByStringCode('EUR') }</a>`
	const declineQuote = '<a href=' + `${ apiUrl }/projectsapi/pangea-re-survey-page-step-decision?decision=decline&vendorId=${ obj.vendor.id }&projectId=${ obj.projectId }&stepId=${ stepId }&to=${ date }&t=${ token }` + ` target="_blank" style="color: #D15F46;">I reject - ${ obj.name }, ${ (obj.nativeFinance.Price.payables).toFixed(2) } ${ returnIconCurrencyByStringCode('EUR') }</a>`
	const start = obj.start.split('T')[0].split('-').reverse().join('-')
	const deadline = obj.deadline.split('T')[0].split('-').reverse().join('-')
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p>
                        Step ${ obj.stepId } ${ obj.serviceStep.title } has been assigned to you.
                    </p>
                    <p style="font-weight: 400;">
                        Here are the needed details:
                    </p>
                    <div class="details" style="width:95%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >
                        <table class="details__table" style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;" >
                            <tr>
                                <td class="main_weight600" style="background:#F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >ID:</td>
                                <td style="font-weight: 400;background:#F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.stepId }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Work type:</td>
                                <td style="font-weight: 400;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.serviceStep.title }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="background:#F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Language:</td>
                                <td style="font-weight: 400;background:#F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ langPair }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Industry:</td>
                                <td style="font-weight: 400;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.industry }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="background:#F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Wordcount:</td>
                                <td style="font-weight: 400;background:#F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.nativeFinance.Wordcount.payables || '-' }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Deadline:</td>
                                <td style="font-weight: 400;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ deadline }</td>
                            </tr>
                            <tr>
                             <td class="main_weight600" style="background:#F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Cost:</td>
                             <td style="font-weight: 400;background:#F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ (obj.nativeFinance.Price.payables).toFixed(2) } ${ returnIconCurrencyByStringCode('EUR') }</td>
                            </tr>
                        </table>
                    </div>
                    <p class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;" >
                        By clicking on one of the links below, you can accept or reject the job.
                    </p>
                    <p style="font-weight: 400;">
                        You can accept the quote by clicking the link below:
                    </p>

                    <span style="font-weight: 400;">I accept - ${ acceptQuote }</span>
                    <p style="font-weight: 400;">or</p>
                    <span style="font-weight: 400;">I reject - ${ declineQuote }</span>

                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function stepCancelledMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        We would like to information you that step: ${ obj.stepId } ${ obj.serviceStep.title } has been cancelled.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function stepMiddleCancelledMessage(obj) {
	const fee = obj.status === "Completed" ? obj.nativeFinance.Price.payables : obj.nativeFinance.Price.halfPayables
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        We would like to inform you that step: ${ obj.stepId } ${ obj.serviceStep.title } has been cancelled in the middle.
                    </p>
                    <p style="font-weight: 400;">
                        You will be paid ${ fee || obj.nativeFinance.Price.payables || 0 } ${ returnIconCurrencyByStringCode('EUR') } which is according to relative work you have completed.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function vendorReassignmentMessage(obj, reason) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        We would like to update you that ${ obj.stepId } ${ obj.serviceStep.title } has been reassigned to a different vendor.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function vendorMiddleReassignmentMessage(allUnits, obj, reason, isPay) {
	const { type } = allUnits.find(({ _id }) => _id.toString() === obj.serviceStep.unit.toString())
	const progress = type === "CAT Wordcount" ?
			(obj.progress.wordsDone / obj.progress.totalWordCount * 100).toFixed(2) :
			obj.progress
	const fee = obj.nativeFinance.Price.halfPayables ? obj.nativeFinance.Price.halfPayables : obj.nativeFinance.Price.payables
	const payText = isPay ?
			`<p style="font-weight: 400;">You will be paid according to your partial completion of the step.</p>
        <p style="font-weight: 400;">You have completed ${ progress } % of the task and your fee for this step is: ${ fee } ${ returnIconCurrencyByStringCode('EUR') }</p>`
			: ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Step ${ obj.stepId } (${ obj.serviceStep.title }) has been reassigned to another vendor.
                    </p>
                    <p style="font-weight: 400;">Reason: ${ reason }</p>
                    <p style="font-weight: 400;">
                        ${ payText }
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function vendorMiddleAssignmentMessage(obj) {
	const mainMessage = obj.isStart ?
			"Although someone else has worked on this step, you shall start the task from the beginning."
			: "You should continue your work from the place it has been stopped."
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.step.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Step: ${ obj.step.stepId } has been reassigned to you.
                    </p>
                    <p style="font-weight: 400;">
                        ${ mainMessage }
                    </p>
                    <p style="font-weight: 400;">An availability email with all the details of the project will be sent to you shortly.</p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function stepReopenedMessage(obj) {
	const reason = obj.reason ? `<p style="font-weight: 400;">Reason: ${ obj.reason }</p>` : ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                         Step: ${ obj.stepId } ${ obj.serviceStep.title } has been reopened.
                    </p>
                    ${ reason }
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function stepReadyToStartMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Hello ${ obj.step.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Step ${ obj.step.stepId }: ${ obj.project.projectName } is now ready to start.
                    </p>
                    <p style="font-weight: 400;">
                        You can access the system or click on the link below and enter the task directly.
                    </p>
                    <p style="font-weight: 400;">
                        <a style="color: #D15F46;" href="https://vendor.pangea.global/dashboard/" target="_blank">Open job: ${ obj.step.stepId }: ${ obj.project.projectName }</a>
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function sendMemoqCredentials(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                		<p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Hello ${ obj.firstName }</span></p>
										<p style="font-weight: 400;">Your account on Memoq has been created.</p>
										<p style="font-weight: 400;">
											<div>Your credentials:</div>
											<div>Login: ${ obj.email }</div>
											<div>Password: 1234</div>
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
	sendMemoqCredentials,
	vendorRegistration
}

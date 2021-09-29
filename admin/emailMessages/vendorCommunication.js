let apiUrl = require("../helpers/apiurl")
!apiUrl && (apiUrl = 'https://admin.pangea.global')
const jwt = require('jsonwebtoken')
const { secretKey } = require('../configs')
const { returnIconCurrencyByStringCode } = require('../helpers/commonFunctions')
const logo = apiUrl + '/static/certificate-images/logo.png'
const { Units } = require('../models')
const moment = require('moment')

function applicationMessage(obj, infoForMail) {
	let cvFiles = ""
	let industries = obj.industries.reduce((acc, curr) => {
		acc = `${ acc } ${ curr.name };`
		return acc
	}, '')
	const langPair = infoForMail.targetLanguages.map(({ lang }) => infoForMail.sourceLanguage.lang + " >> " + lang)
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

	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span style="color:#333;">Hello Recruitment Team,</span></p>
                    <p style="font-size: 14px; font-weight: 400;"><span id="client-name-row" style="color:#333;">A new applicant has submitted a form.</span></p>
                    <p style="font-size: 14px; font-weight: 400;"><span id="client-name-row" style="color:#333;">Here is the initial information:</span></p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;color:#333;"> Name: </b> ${ obj.firstName } </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;color:#333;"> Surname: </b> ${ obj.surname } </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;"> Email: </b> <span>${ obj.email }</span> </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;"> Phone Number: </b> <span>${ obj.phone }</span> </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;"> Mother tongue: </b> <span>${ obj.lang }</span> </p>
                    <p style="font-weight: 400; color:#66563e;margin-bottom: 0;"><b style="margin-right: 6px;"> Language Pair: </b></p>
                    <p style="font-weight: 400; color:#66563e; margin-left: 20px;margin-top: 0;"> <span>${ langPair.join(', <br>') }</span> </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;"> Industries: </b> <span>${ industries }</span> </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;"> Position: </b> <span>${ infoForMail.step.title }</span> </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;"> Rate: </b> <span>${ infoForMail.rate }</span> </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;"> Availability: </b> <span>${ obj.availability }</span> </p>
                    <p style="font-weight: 400; color:#66563e;"><b style="margin-right: 6px;"> Software experience: </b> <span>${ obj.softwares }</span> </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function vendorRegistration(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="color: #333; background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.firstName },</span></p>
										<p style="font-weight: 400;color:#333;">
                      Thank you for your interest in working with Pangea.
                      We are always on the lookout for talent, yet only the best of the best get to join us.
                      Submitting your information tells us you may be our next superstar.
										</p>
										<p style="font-weight: 400;color:#333;">
                      If you wish to change any of the information you have submitted, 
                      you can access the candidate platform and adjust your profile. 
                      Here is what you need to do:
										</p>
										<p style="font-weight: 400;color:#333;">1. Go to: <a href="https://vendor.pangea.global/login" style="color: #D15F46;">Vendor Portal</a></p>
										<p style="font-weight: 400;color:#333;">2. Log in to the system with the following details:</p>
                    <p style="font-weight: 400;color:#333;margin-left: 10px;">• username: <b>${ obj.email.replace(/@/g, '<span>@</span>').replace(/\./g, '<span>.</span>') }</b> </p>
                    <p style="font-weight: 400;color:#333;margin-left: 10px;">• password: <b>${ obj.pass }</b> </p>
										<p style="font-weight: 400;color:#333;">
                      <b>What's the next step?</b>
                    </p>
                    <p style="font-weight: 400;color:#333;">
                      One of our recruiters will <b>review</b> your application and <b>send you a short test in one or more of your selected language pairs for the specified industry(ies)</b>.
                    </p>
                    <p style="font-weight: 400;color:#333;">Kind regards,</p>
                    <p style="font-weight: 400;color:#333;">Pangea HR team</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function requestMessageForVendor(obj) {
	const date = Date.now()
	const token = jwt.sign({ vendorId: obj.vendor.id }, secretKey, { expiresIn: '24h' })
	const langPair = obj.sourceLanguage === obj.targetLanguage ? obj.targetLanguage : obj.sourceLanguage + ' >> ' + obj.targetLanguage

	const acceptHref = `${ apiUrl }/quote-decision?vendorId=${ obj.vendor.id }&projectId=${ obj.projectId }&stepId=${ obj._id }&from=${ date }&t=${ token }&type=vendor&prop=accept`
	const declineHref = `${ apiUrl }/quote-decision?vendorId=${ obj.vendor.id }&projectId=${ obj.projectId }&stepId=${ obj._id }&from=${ date }&t=${ token }&type=vendor&prop=reject`

	let acceptQuote = `<a href="${ acceptHref }" style="background: #47A6A6;color: #fff;padding: 6px 20px;text-decoration: none;border-radius: 4px;cursor: pointer;margin: 7px 10px 0px 0;display: inline-block;">I accept ${ +(obj.nativeFinance.Price.payables).toFixed(2) } ${ returnIconCurrencyByStringCode('EUR') }</a>`
	let declineQuote = `<a href="${ declineHref }" style="background: #d15f45;color: #fff;padding: 6px 20px;text-decoration: none;border-radius: 4px;cursor: pointer;margin: 7px 10px 0px 0;display: inline-block;">I reject ${ +(obj.nativeFinance.Price.payables).toFixed(2) } ${ returnIconCurrencyByStringCode('EUR') }</a>`

	const start = moment(obj.start).format('DD-MM-YYYY, HH:mm')
	const deadline = moment(obj.deadline).format('DD-MM-YYYY, HH:mm')

	return `<style type="text/css">.im {color: #333 !important;}</style>
					<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName } ${ obj.vendor.surname || '' }</span></p>

                    <p> Job ${ obj.name } has been assigned to you.</p>
    
								    <div class="block" style="border: 1px solid #bfbfbf; width: max-content;">
											  <div style="border-bottom: 1px solid #ededed;">
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">ID:</div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">${ obj.stepId }</div>
											  </div>
								        <div style="border-bottom: 1px solid #ededed;">
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">Work type:</div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">${ obj.name }</div>
											  </div>
											  <div style="border-bottom: 1px solid #ededed;">
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">Language:</div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">${ langPair }</div>
											  </div>
											  <div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">Industry:</div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">${ obj.industry }</div>
											  </div>
								        <div style="border-bottom: 1px solid #ededed;">
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">Approx. start date:</div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">${ start }</div>
											  </div>
											  <div style="border-bottom: 1px solid #ededed;">
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">Deadline:</div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">${ deadline }</div>
											  </div>
											  <div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">Cost:</div>
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">${ (obj.nativeFinance.Price.payables).toFixed(2) } ${ returnIconCurrencyByStringCode('EUR') }</div>
											  </div>
										</div>
	                  <p style="margin-top: 35px;">You can accept the quote by clicking the link below:<br>
                    <span> ${ acceptQuote }</span>
                    <span> ${ declineQuote }</span>
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function stepCancelledMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        We would like to information you that step: ${ obj.stepId } ${ obj.serviceStep.title } has been cancelled.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function stepMiddleCancelledMessage(obj) {
	const fee = obj.status === "Completed" ? obj.nativeFinance.Price.payables : obj.nativeFinance.Price.halfPayables
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        We would like to inform you that step: ${ obj.stepId } ${ obj.serviceStep.title } has been cancelled in the middle.
                    </p>
                    <p style="font-weight: 400;">
                        You will be paid ${ fee || obj.nativeFinance.Price.payables || 0 } ${ returnIconCurrencyByStringCode('EUR') } which is according to relative work you have completed.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function vendorReassignmentMessage(obj, reason) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        We would like to update you that ${ obj.stepId } ${ obj.serviceStep.title } has been reassigned to a different vendor.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function vendorCanStartStartedSecondStep(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName } ${ obj.vendor.surname || '' }</span></p>
                    <p style="font-weight: 400;">
                    	Step <b>${ obj.step.stepId }: ${ obj.step.name }</b> is now ready to start.
										</p>
                    <p style="font-weight: 400;">
                    	You can go to the system at the link below.
										</p>
                    <p style="font-weight: 400;">
                    	<a href="https://vendor.pangea.global/dashboard/" target="_blank">Vendor Portal</a>
										</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
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
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Step ${ obj.stepId } (${ obj.serviceStep.title }) has been reassigned to another vendor.
                    </p>
                    <p style="font-weight: 400;">Reason: ${ reason }</p>
                    <p style="font-weight: 400;">
                        ${ payText }
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function vendorMiddleAssignmentMessage(obj) {
	const mainMessage = obj.isStart ?
			"Although someone else has worked on this step, you shall start the task from the beginning."
			: "You should continue your work from the place it has been stopped."
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.step.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Step: ${ obj.step.stepId } has been reassigned to you.
                    </p>
                    <p style="font-weight: 400;">
                        ${ mainMessage }
                    </p>
                    <p style="font-weight: 400;">An availability email with all the details of the project will be sent to you shortly.</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function stepReopenedMessage(obj) {
	const reason = obj.reason ? `<p style="font-weight: 400;">Reason: ${ obj.reason }</p>` : ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                         Step: ${ obj.stepId } ${ obj.serviceStep.title } has been reopened.
                    </p>
                    ${ reason }
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function stepReadyToStartMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Hello ${ obj.step.vendor.firstName }</span></p>
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
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function sendMemoqCredentials(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Hello ${ obj.firstName }</span></p>
										<p style="font-weight: 400;">Your account on Memoq has been created.</p>
										<p style="font-weight: 400;">
											<div>Your credentials:</div>
											<div>Login: ${ obj.email }</div>
											<div>Password: 1234</div>
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

async function generatePO(requestInfo, fullVendor, project) {
	const { firstName, surname } = fullVendor
	let { stepId, start, deadline, name, sourceLanguage, targetLanguage, industry, nativeFinance, serviceStep, totalWords, taskId, nativeVendorRate: { value: rate } } = requestInfo
	const { Wordcount, Price } = nativeFinance
	const { unit: unitId } = serviceStep
	const { type } = await Units.findOne({ "_id": unitId })
	const isTranslationJob = name === 'Translation'
	start = moment(start).format('DD-MM-YYYY, HH:mm')
	deadline = moment(deadline).format('DD-MM-YYYY, HH:mm')
	let col1 = ''
	let col2 = ''

	if (type === 'Packages') {
		col1 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Quantity:</div><div class="value">${ requestInfo.quantity }</div>`
		col2 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Unit:</div><div class="value">Packages</div>`
	} else if (type === 'CAT Wordcount' && isTranslationJob) {
		col1 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Total Wordcount:</div><div class="value">${ totalWords }</div>`
		col2 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Weighted Wordcount:</div><div class="value">${ Wordcount.payables }</div>`
	} else if (type === 'CAT Wordcount' && !isTranslationJob) {
		col1 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Total Wordcount:</div><div class="value">${ totalWords }</div>`
	} else {
		col1 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Quantity:</div><div class="value">${ requestInfo.hours }</div>`
		col2 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Unit:</div><div class="value">${ type }</div>`
	}

	let table = ''
	if (isTranslationJob) {
		const { tasks } = project
		const { metrics: original } = tasks.find(item => item.taskId === taskId)
		const metricsData = { ...original }
		delete metricsData.totalWords
		const tableStart = `<div class="table" style="padding: 0px 25px;">
				<table style="font-size: 14px;color: #333;width: 100%;text-align: left;border-collapse: collapse;border-bottom: 1px solid #999;border-left: 1px solid #999;margin-top: -30px;">
        <tr>
            <th style="width: 40%; padding: 8px 7px;border-right: 1px solid #999;border-top: 1px solid #999;"></th>
            <th style="width: 20%; padding: 8px 7px;border-right: 1px solid #999;border-top: 1px solid #999;">%</th>
            <th style="width: 20%; padding: 8px 7px;border-right: 1px solid #999;border-top: 1px solid #999;">Source Word</th>
            <th style="width: 20%; padding: 8px 7px;border-right: 1px solid #999;border-top: 1px solid #999;">Rate</th>
        </tr>`
		const tableBody = Object.values(metricsData).reduce((acc, { vendor, text, value }) => {
			acc = acc + `<tr>
	    <td style="padding: 8px 7px;border-right: 1px solid #999;border-top: 1px solid #999;font-weight: 600;">${ text }</td>
	    <td style="padding: 8px 7px;border-right: 1px solid #999;border-top: 1px solid #999;">${ vendor }</td>
	    <td style="padding: 8px 7px;border-right: 1px solid #999;border-top: 1px solid #999;">${ value }</td>
	    <td style="padding: 8px 7px;border-right: 1px solid #999;border-top: 1px solid #999;">${ +(vendor * (value / 100)).toFixed(1) }</td>
     </tr>`
			return acc
		}, '')
		const tableEnd = `</table></div>`

		table = tableStart + tableBody + tableEnd
	}

	return `<div class="pdf" style="height: 1054px;width: 814px;font-family: Arial, sans-serif;color: #333;padding: 30px;position: relative;">
			    <div class="header" style="display: -webkit-box;justify-content: space-between;">
			        <div class="header__logo">
			            <img src="${ logo }" alt="">
			        </div>
			        <div class="header__details" style="margin-left: 271px;">
			            <div class="header__details--line"
			                style="height: 24px;background: #48A6A6;width: 320px;margin-right: -30px;margin-bottom: 5px;"></div>
			            <div class="header__details--title" style="font-size: 26px;margin-bottom: 5px;">Purchase Order</div>
			            <div class="header__details--stepId" style="font-size: 14px;">${ stepId }</div>
			        </div>
			    </div>
			    <div class="body" style="padding: 25px;margin-top: 80px;">
			        <div class="body__to" style="font-size: 16px;margin-bottom: 15px;">To: </div>
			        <div class="body__vendor" style="font-size: 22px;font-weight: 600;margin-bottom: 15px;">${ firstName } ${ surname || '' }</div>
			        <div class="body__address" style="margin-bottom: 50px;">${ fullVendor.billingInfo.address || '' }</div>
			        <div class="body__line" style="background-color: #b5dbdb;height: 1px;"></div>
			    </div>
			    <div class="details" style="padding: 25px;">
			        <div class="cols" style="display: -webkit-box;">
			            <div class="col" style="width: 360px;margin-right: 50px;font-size: 14px;">
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                    <div class="key" style="font-weight: 600;margin-right: 10px;">Start Date & Time:</div>
			                    <div class="value">${ start }</div>
			                </div>
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                    <div class="key" style="font-weight: 600;margin-right: 10px;">Job Type:</div>
			                    <div class="value">${ name }</div>
			                </div>
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                    <div class="key" style="font-weight: 600;margin-right: 10px;">Source Language:</div>
			                    <div class="value">${ sourceLanguage }</div>
			                </div>
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                    ${ col1 }
			                </div>
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                    <div class="key" style="font-weight: 600;margin-right: 10px;">Rate:</div>
			                    <div class="value">${ +rate.toFixed(4) }</div>
			                </div>
			            </div>
			            <div class="col" style="width: 360px;margin-right: 50px;font-size: 14px;">
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                    <div class="key" style="font-weight: 600;margin-right: 10px;">Deadline:</div>
			                    <div class="value">${ deadline }</div>
			                </div>
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                    <div class="key" style="font-weight: 600;margin-right: 10px;">Industry:</div>
			                    <div class="value">${ industry }</div>
			                </div>
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                    <div class="key" style="font-weight: 600;margin-right: 10px;">Target Language:</div>
			                    <div class="value">${ targetLanguage }</div>
			                </div>
			                <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                	${ col2 }
			                </div>
			            </div>
			        </div>
			        <div class="paybles" style="font-size: 14px;margin-top: 40px;margin-bottom: 40px;">
			            <div class="row" style="display: -webkit-box;margin-bottom: 15px;">
			                <div class="key" style="font-weight: 600;margin-right: 10px;">Total Payables:</div>
			                <div class="value">${ +(Price.payables).toFixed(2) } EUR</div>
			            </div>
			        </div>
			    </div>
					${ table }
			    <div class="footer"
			        style="position: absolute;width: 764px;border-top: 3px solid #c8e4e4;margin-left: 25px;bottom: 0;padding: 15px 0 12px;">
			        <div class="text-line" style="font-size: 12px;text-align: center;font-weight: 600;">Pangea Translation Services
			            (Cyprus) LTD</div>
			        <div class="text-line" style="font-size: 12px;text-align: center;font-weight: 600;">Arch. Leontiou A’ 254, 3020
			            Limassol, Cyprus</div>
			        <div class="text-line" style="font-size: 12px;text-align: center;font-weight: 600;">Office : +357 25 252 150 |
			            www.pangea.global</div>
			        <div class="text-line" style="font-size: 12px;text-align: center;font-weight: 600;">Reg. No. HE362046</div>
			    </div>
			</div>`
}

module.exports = {
	generatePO,
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
	vendorRegistration,
	vendorCanStartStartedSecondStep
}

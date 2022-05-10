let apiUrl = process.env.ADMIN_URL
let apiUrlVendor = process.env.VENDOR_URL
const jwt = require('jsonwebtoken')
const { secretKey } = require('../configs')
const { returnIconCurrencyByStringCode } = require('../helpers/commonFunctions')
const logo = apiUrl + '/static/certificate-images/logo.png'
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
										<p style="font-weight: 400;color:#333;">1. Go to: <a href="${ apiUrlVendor }/login" style="color: #D15F46;">Vendor Portal</a></p>
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
	const instructionsTitle = "<div style='margin-top: 35px; margin-bottom: 10px;'><b><u>Please read carefully the instructions:</u></b></div>"
	const brief = `<p><b>General instructions:</b>${ obj.brief }</p>`
	const vendorBrief = `<p><b>Individual instructions:</b>${ obj.vendorBrief }</p>`
	const instructions = obj.brief || obj.vendorBrief
			? `${ instructionsTitle }  ${ obj.brief ? brief : '' } ${ obj.vendorBrief ? vendorBrief : '' }`
			: ''

	const date = Date.now()
	const token = jwt.sign({ vendorId: obj.vendor.id }, secretKey, { expiresIn: '24h' })
	const langPair = obj.sourceLanguage === obj.targetLanguage ? obj.targetLanguage : obj.sourceLanguage + ' >> ' + obj.targetLanguage

	const acceptHref = `${ apiUrl }/quote-decision?vendorId=${ obj.vendor.id }&projectId=${ obj.projectId }&stepId=${ obj._id }&from=${ date }&t=${ token }&type=vendor&prop=accept`
	const declineHref = `${ apiUrl }/quote-decision?vendorId=${ obj.vendor.id }&projectId=${ obj.projectId }&stepId=${ obj._id }&from=${ date }&t=${ token }&type=vendor&prop=reject`

	let acceptQuote = `<a href="${ acceptHref }" style="background: #4ba5a5;color: #fff;padding: 6px 20px;text-decoration: none;border-radius: 2px;cursor: pointer;margin: 7px 10px 0px 0;display: inline-block;">I accept ${ +(obj.nativeFinance.Price.payables).toFixed(2) } ${ returnIconCurrencyByStringCode('EUR') }</a>`
	let declineQuote = `<a href="${ declineHref }" style="background: #d66f58;color: #fff;padding: 6px 20px;text-decoration: none;border-radius: 2px;cursor: pointer;margin: 7px 10px 0px 0;display: inline-block;">I reject ${ +(obj.nativeFinance.Price.payables).toFixed(2) } ${ returnIconCurrencyByStringCode('EUR') }</a>`

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
											      <div style="display: inline-block; padding: 8px; min-width: 200px;">${ obj.stepAndUnit.step.title }</div>
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
										</div
										${ instructions }
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

function vendorReassignmentMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.vendor.firstName }</span></p>
                    <p style="font-weight: 400;">
                        We would like to update you that ${ obj.stepId } ${ obj.step.title } has been reassigned to a different vendor.
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
                    	Step <b>${ obj.step.stepId }: ${ obj.step.step.title }</b> is now ready to start.
										</p>
                    <p style="font-weight: 400;">
                    	You can go to the system at the link below.
										</p>
                    <p style="font-weight: 400;">
                    	<a href="${ apiUrlVendor }/dashboard/" target="_blank">Vendor Portal</a>
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
                        <a style="color: #D15F46;" href="${ apiUrlVendor }/dashboard/" target="_blank">Open job: ${ obj.step.stepId }: ${ obj.project.projectName }</a>
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
										<p style="font-weight: 400;">Your account on MemoQ has been created.</p>
										<p style="font-weight: 400;">
											<p>Your credentials</p>
											<p>Login: <b>${ obj.firstName.substr(0, 4) } ${ obj.surname.substr(0, 4) }</b></p>
											<p>Password: <b>LetMeInNow12345!</b></p>
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
	let { stepId, start, deadline, step, sourceLanguage, targetLanguage, industry, nativeFinance, payablesUnit, totalWords, taskId, nativeVendorRate: rate } = requestInfo
	const { Wordcount, Price, Quantity } = nativeFinance
	const { type } = payablesUnit
	const isTranslationJob = step.title === 'Translation'
	start = moment(start).format('DD-MM-YYYY, HH:mm')
	deadline = moment(deadline).format('DD-MM-YYYY, HH:mm')
	let col1 = ''
	let col2 = ''

	if (type === 'CAT Wordcount' && isTranslationJob) {
		col1 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Total Wordcount:</div><div class="value">${ totalWords }</div>`
		col2 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Weighted Wordcount:</div><div class="value">${ Wordcount.payables }</div>`
	} else if (type === 'CAT Wordcount' && !isTranslationJob) {
		col1 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Total Wordcount:</div><div class="value">${ totalWords }</div>`
	} else {
		col1 = `<div class="key" style="font-weight: 600;margin-right: 10px;">Quantity:</div><div class="value">${ Quantity.payables }</div>`
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

	return `<div class="pdf" style="height: 1054px;width: 814px;font-family: Tahoma, sans-serif;color: #333;padding: 30px;position: relative;">
			    <div class="header" style="display: -webkit-box;justify-content: space-between;">
			        <div class="header__logo">
				        <svg style="height: 72px; width: 253px;" id="Ñëîé_1" data-name="Ñëîé 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 253 72">
								<defs>
								<style>
								.cls-6{fill:#666;}
								.cls-1{fill:#555; stroke:#555; stroke-width:1.2px}
								.cls-2{fill:#ffffff;}
								.cls-4{fill:#F4C430;}
								.cls-5{fill:#4ba5a5;}
								.cls-3{fill:#d66f58;}
								.cls-6{font-size:14px; font-family:'Courier New', monospace; font-weight:400;}
								</style>
								</defs><path class="cls-1" d="M87,20.64v4.13a14.82,14.82,0,0,1,4.35-3.7,11.51,11.51,0,0,1,5.48-1.24A12.51,12.51,0,0,1,103,21.4a11,11,0,0,1,4.39,4.36,12,12,0,0,1,1.55,5.87,11.35,11.35,0,0,1-3.5,8.36A12.34,12.34,0,0,1,87,38.52V52.18h5.51a1.73,1.73,0,0,1,1.16.31,1.12,1.12,0,0,1,0,1.63,1.67,1.67,0,0,1-1.16.33H81.65a1.77,1.77,0,0,1-1.16-.31,1,1,0,0,1-.35-.83,1,1,0,0,1,.35-.82,1.71,1.71,0,0,1,1.16-.31h3V22.94h-3a1.66,1.66,0,0,1-1.16-.33,1,1,0,0,1-.35-.83,1,1,0,0,1,.35-.81,1.66,1.66,0,0,1,1.16-.33Zm19.65,11a9.1,9.1,0,0,0-2.84-6.71,10.09,10.09,0,0,0-14,0,9.29,9.29,0,0,0,0,13.41,10.06,10.06,0,0,0,13.93,0A9.08,9.08,0,0,0,106.62,31.63Z"/><path class="cls-1" d="M130.23,44V40.76a16.17,16.17,0,0,1-10.56,4.16,9.16,9.16,0,0,1-6.37-2.07,6.55,6.55,0,0,1-2.3-5.06A7.23,7.23,0,0,1,114,32c2-1.64,5-2.46,8.83-2.46a32.56,32.56,0,0,1,3.4.2c1.22.14,2.55.35,4,.64V26.74a4.07,4.07,0,0,0-1.73-3.24,8.26,8.26,0,0,0-5.18-1.37,26.12,26.12,0,0,0-7.43,1.54,5.13,5.13,0,0,1-1.11.27,1,1,0,0,1-.74-.33,1.09,1.09,0,0,1-.31-.81,1,1,0,0,1,.27-.73,9.13,9.13,0,0,1,3-1.1,26.83,26.83,0,0,1,6.37-1.14,9.79,9.79,0,0,1,6.7,2.12,6.29,6.29,0,0,1,2.4,4.79v15h3a1.76,1.76,0,0,1,1.18.31,1,1,0,0,1,.35.82,1,1,0,0,1-.35.81,1.7,1.7,0,0,1-1.18.32Zm0-11.28a22,22,0,0,0-3.38-.68,32.11,32.11,0,0,0-3.75-.21c-3.29,0-5.87.71-7.72,2.13a4.66,4.66,0,0,0-2.11,3.81,4.4,4.4,0,0,0,1.61,3.45,6.89,6.89,0,0,0,4.68,1.41A12.71,12.71,0,0,0,125,41.47a19.66,19.66,0,0,0,5.2-3.74Z"/><path class="cls-1" d="M146.16,20.64v3.43a16.26,16.26,0,0,1,4.29-3.32,9.92,9.92,0,0,1,4.32-.92,10.12,10.12,0,0,1,4.73,1.11,7.85,7.85,0,0,1,2.74,2.69,6.92,6.92,0,0,1,1.23,3.84V41.76h1.91a1.71,1.71,0,0,1,1.16.31,1,1,0,0,1,.35.82,1,1,0,0,1-.35.81,1.66,1.66,0,0,1-1.16.32h-6.07a1.71,1.71,0,0,1-1.19-.32,1.08,1.08,0,0,1-.35-.81,1,1,0,0,1,.35-.82,1.77,1.77,0,0,1,1.19-.31h1.89V27.85a5.38,5.38,0,0,0-1.76-4.06,6.53,6.53,0,0,0-4.7-1.66,8,8,0,0,0-3.88.9,20.8,20.8,0,0,0-4.7,4.5V41.76h2.56a1.71,1.71,0,0,1,1.16.31,1,1,0,0,1,.36.82,1.06,1.06,0,0,1-.36.81,1.66,1.66,0,0,1-1.16.32h-7.39a1.71,1.71,0,0,1-1.17-.32,1.08,1.08,0,0,1-.35-.81,1,1,0,0,1,.35-.82,1.76,1.76,0,0,1,1.17-.31h2.56V22.94H142a1.67,1.67,0,0,1-1.16-.33,1.08,1.08,0,0,1-.35-.83,1.05,1.05,0,0,1,.35-.81,1.67,1.67,0,0,1,1.16-.33Z"/><path class="cls-1" d="M188.67,24.8V20.64H194a1.66,1.66,0,0,1,1.16.33,1,1,0,0,1,.35.83,1,1,0,0,1-.35.81,1.66,1.66,0,0,1-1.16.33h-3.05V45.59a8.31,8.31,0,0,1-1,4,9,9,0,0,1-2.16,2.46,12.13,12.13,0,0,1-2.75,1.81,8.51,8.51,0,0,1-3.33.54h-6.42a1.77,1.77,0,0,1-1.16-.31,1.16,1.16,0,0,1,0-1.66,1.66,1.66,0,0,1,1.16-.33l6.51,0a6.5,6.5,0,0,0,3.6-1,7.8,7.8,0,0,0,2.66-3,6.17,6.17,0,0,0,.59-2.89V38.46a11.16,11.16,0,0,1-9.39,5A10.89,10.89,0,0,1,171.22,40a11.53,11.53,0,0,1-3.39-8.36,11.46,11.46,0,0,1,3.39-8.34,10.88,10.88,0,0,1,8.06-3.46A11.18,11.18,0,0,1,188.67,24.8Zm0,6.83a9.2,9.2,0,0,0-2.74-6.75,9.13,9.13,0,0,0-13.08,0,9.21,9.21,0,0,0-2.72,6.73,9.23,9.23,0,0,0,2.72,6.76,9.11,9.11,0,0,0,13.08,0A9.21,9.21,0,0,0,188.67,31.63Z"/><path class="cls-1" d="M222.06,32.87H198.94A11,11,0,0,0,202.63,40a11.25,11.25,0,0,0,7.65,2.69,18.33,18.33,0,0,0,5.32-.84,13.83,13.83,0,0,0,4.54-2.21,1.55,1.55,0,0,1,.89-.41,1,1,0,0,1,.76.34,1.13,1.13,0,0,1,.32.8,1.27,1.27,0,0,1-.43.89,12.13,12.13,0,0,1-4.61,2.52,20.17,20.17,0,0,1-6.79,1.18,13.36,13.36,0,0,1-9.73-3.83,12.44,12.44,0,0,1-3.9-9.24,11.37,11.37,0,0,1,3.66-8.48,12.52,12.52,0,0,1,9.06-3.54,12.33,12.33,0,0,1,9.15,3.63A12.69,12.69,0,0,1,222.06,32.87Zm-2.3-2.29a9.85,9.85,0,0,0-3.55-6.1,11.17,11.17,0,0,0-13.67,0A10,10,0,0,0,199,30.58Z"/><path class="cls-1" d="M244.5,44V40.76a16.15,16.15,0,0,1-10.56,4.16,9.16,9.16,0,0,1-6.37-2.07,6.55,6.55,0,0,1-2.3-5.06,7.23,7.23,0,0,1,3-5.75c2-1.64,5-2.46,8.83-2.46a32.4,32.4,0,0,1,3.4.2c1.22.14,2.55.35,4,.64V26.74a4.07,4.07,0,0,0-1.73-3.24,8.26,8.26,0,0,0-5.18-1.37,26.12,26.12,0,0,0-7.43,1.54,5,5,0,0,1-1.11.27,1,1,0,0,1-.74-.33,1.13,1.13,0,0,1-.31-.81,1,1,0,0,1,.27-.73,9.13,9.13,0,0,1,3-1.1,26.83,26.83,0,0,1,6.37-1.14,9.79,9.79,0,0,1,6.7,2.12,6.29,6.29,0,0,1,2.4,4.79v15h3a1.79,1.79,0,0,1,1.19.31,1,1,0,0,1,.35.82,1.08,1.08,0,0,1-.35.81,1.73,1.73,0,0,1-1.19.32Zm0-11.28a21.74,21.74,0,0,0-3.38-.68,32,32,0,0,0-3.75-.21c-3.29,0-5.87.71-7.72,2.13a4.66,4.66,0,0,0-2.11,3.81,4.4,4.4,0,0,0,1.61,3.45,6.89,6.89,0,0,0,4.68,1.41,12.68,12.68,0,0,0,5.47-1.18,19.66,19.66,0,0,0,5.2-3.74Z"/><circle class="cls-2" cx="56.96" cy="27.78" r="8.27"/><circle class="cls-2" cx="20.76" cy="27.78" r="8.27"/><path class="cls-3" d="M71.14,12.74c-.53-.53-1-1-1.57-1.46a20,20,0,0,0-25.22,0,21.56,21.56,0,0,0-1.6,1.46A19.27,19.27,0,0,0,36.86,26.9a19.58,19.58,0,0,0,5,13.3l.09.07.79.81A12.49,12.49,0,0,0,45,43.13l12,11,1.74-1.69c.1-.06,11-9.94,11-9.94a14.93,14.93,0,0,0,1.38-1.38A19.47,19.47,0,0,0,77,26.9,19.31,19.31,0,0,0,71.14,12.74ZM62.77,33.59a7.76,7.76,0,0,1-5.84,2.46A8,8,0,0,1,51,33.59a7.87,7.87,0,0,1-2.36-5.79,8.07,8.07,0,0,1,8.25-8.29,7.9,7.9,0,0,1,5.84,2.36,8.06,8.06,0,0,1,2.46,5.93A7.7,7.7,0,0,1,62.77,33.59Z"/><path class="cls-4" d="M34.94,12.74c-.52-.53-1-1-1.57-1.46A19.26,19.26,0,0,0,20.74,6.8,19.13,19.13,0,0,0,8.15,11.28c-.54.45-1.07.93-1.6,1.46A19.31,19.31,0,0,0,.66,26.9a19.58,19.58,0,0,0,5,13.3l.1.07q.38.4.78.81a12.82,12.82,0,0,0,2.29,2.05l12,11,1.74-1.69c.1-.06,11-9.94,11-9.94a13.79,13.79,0,0,0,1.38-1.38A19.43,19.43,0,0,0,40.83,26.9,19.27,19.27,0,0,0,34.94,12.74ZM26.58,33.59a7.78,7.78,0,0,1-5.84,2.46,8,8,0,0,1-5.89-2.46,7.84,7.84,0,0,1-2.36-5.79,8.07,8.07,0,0,1,8.25-8.29,7.92,7.92,0,0,1,5.84,2.36A8.08,8.08,0,0,1,29,27.8,7.73,7.73,0,0,1,26.58,33.59Z"/><path class="cls-5" d="M55,7.42c-.59-.59-1.18-1.14-1.77-1.64A21.76,21.76,0,0,0,38.92.72a21.6,21.6,0,0,0-14.2,5.06c-.61.5-1.21,1-1.81,1.64a21.83,21.83,0,0,0-6.64,16,22.07,22.07,0,0,0,5.65,15l.11.08c.28.31.58.61.88.92a14.27,14.27,0,0,0,2.59,2.31L39.06,54.09l2-1.91C41.13,52.11,53.39,41,53.39,41A14.33,14.33,0,0,0,55,39.41a22,22,0,0,0,6.65-16A21.8,21.8,0,0,0,55,7.42ZM45.51,31a8.75,8.75,0,0,1-6.59,2.77A9,9,0,0,1,32.28,31a8.89,8.89,0,0,1-2.67-6.54,9.11,9.11,0,0,1,9.31-9.36,9,9,0,0,1,6.59,2.66,9.12,9.12,0,0,1,2.77,6.7A8.72,8.72,0,0,1,45.51,31Z"/>
								<circle class="cls-2" cx="38.9" cy="24.43" r="9.32"/><text class="cls-6" transform="translate(80 70)">Translation Experts</text></svg>
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
			                    <div class="value">${ step.title }</div>
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
			    <div class="footer" style="position: absolute;width: 764px;border-top: 3px solid #c8e4e4;margin-left: 25px;bottom: 0;padding: 15px 0 12px;">
			        <div class="text-line" style="font-size: 12px;text-align: center;">Pangea Translation Services
			            (Cyprus) LTD</div>
			        <div class="text-line" style="font-size: 12px;text-align: center;">Arch. Leontiou A’ 254, 3020
			            Limassol, Cyprus</div>
			        <div class="text-line" style="font-size: 12px;text-align: center;">Office : +357 25 252 150 |
			            www.pangea.global</div>
			        <div class="text-line" style="font-size: 12px;text-align: center;">Reg. No. HE362046</div>
			    </div>
			</div>`
}

function invoiceReportIsReady({ yearAndMonth, reportId, vendor }) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ vendor.firstName } ${ vendor.surname || '' }</span></p>
										<p>The report for <b>${ yearAndMonth }</b> is ready for your review. You can access it from
											<a href="${ apiUrlVendor }/billing/invoices/details/${ reportId }" target="_blank">here</a>.
									 	</p>
									 	<p>Please ensure that the report accurately and completely reflects your activity for the reporting month.</p>
									 	<p>To confirm accuracy and approve the report in this format, please click “Confirm” and upload your invoice.</p>
									 	<p>Many thanks</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`

}

function invoiceReportIsPaid(isFull, { vendor, _id, reportId }) {
	const link = isFull
			? `<a href="${ apiUrlVendor }/billing/invoices/details-paid/${ _id }" target="_blank">${ reportId }</a>`
			: `<a href="${ apiUrlVendor }/billing/invoices/details/${ _id }" target="_blank">${ reportId }</a>`

	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ vendor.firstName } ${ vendor.surname || '' }</span></p>
                		<p>
                			This is to inform you that your Invoice ${ link } has been ${ isFull ? 'paid' : 'partially paid' }.
										</p>
										<p>Looking forward to working with you again.</p>
										<p>Best regards</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
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
	vendorCanStartStartedSecondStep,
	invoiceReportIsReady,
	invoiceReportIsPaid
}

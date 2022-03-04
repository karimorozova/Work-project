const apiUrl = process.env.ADMIN_URL

// Generate template for password restore message
function getMessageWithRandomPassword(password) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                   <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear pangea system user,</span></p>
                   	<p style="font-weight: 400;">
                   		We generated new password for you to sign in to the system.
										</p>
                    <p style="font-weight: 400;"> Please, use this password: <span style="font-weight: bold;"> ${ password }</span></p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>
`
}

// Generate template for message if quote approved and vendors now assigned
function managerAssignmentNotifyingMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                   <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.firstName }</span></p>
                   	<p>
                   	<b>Please note:</b> we have detected that project
                   	<a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj._id }" target="_blank">${ obj.projectId } - ${ obj.projectName }</a>
                   		has been approved and ready to start, but some tasks don't have a vendor assigned.
										</p>
										<p><b>Please take care ASAP</b></p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

//Template for Message for Ready to DR1
function managerTaskCompleteNotificationMessage(obj, user) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Task ${ obj.task.taskId } from project <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj._id }" target="_blank">${ obj.projectId } - ${ obj.projectName } </a>  is completed and ready for DR1.
                    </p>
                    <p style="font-weight: 400;">
                        Project deadline is: ${ obj.deadline }
                    </p>
                    <p style="font-weight: 400;">
                        Please, make the review or assign another PM to do it.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

//Delivery Task Template
function deliverablesDownloadedMessage(obj, user) {
	const lastName = obj.manager.lastName || ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.manager.firstName } ${ lastName }</span></p>  
                    <p style="font-weight: 400;">
                        Task ${ obj.taskId } from project  <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj._id }" target="_blank">${ obj.project_id } - ${ obj.projectName }</a>  has been reviewed and delivered by ${ user.firstName } ${ user.lastName || "" }
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function managerRequestNotifyingMessage(obj) {
	const industry = obj.industry ? obj.industry.name : ""
	const { sourceLanguage, packageSize } = obj
	const languages = obj.targetLanguages.reduce((acc, cur) => {
		acc += sourceLanguage ? `${ sourceLanguage.lang } >> ${ cur.lang }; ` : `${ cur.lang }/${ packageSize.size }; `
		return acc
	}, "")
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                   <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.user.firstName }</span></p>  
                    <p>
                        Client ${ obj.customer.name } has send a request.
                    </p>
                    <p>
                        Please find the details below:
                    </p>
                    <div class="details" style="width:90%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >

                        <table class="details__table" style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;" >
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Name:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.projectName }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >ID:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.requestId }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Service:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.service.title }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Language:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ languages }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Industry:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ industry }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Estimated delivery date:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.deadline }</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function managerRequestAssignedMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                   <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.user.firstName }</span></p>  
                    <p>
                        Request ${ obj.requestId } - ${ obj.projectName } has been assigned to you.
                    </p>
                    <p>
                        Please find the details below:
                    </p>
                    <div class="details" style="width:90%;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;" >

                        <table class="details__table" style="color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;" >
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Name:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.projectName }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >ID:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.requestId }</td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Service:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" ></td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Language:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" ></td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Industry:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" ></td>
                            </tr>
                            <tr>
                                <td class="main_weight600" style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;" >Estimated delivery date:</td>
                                <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;" >${ obj.deadline }</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function managersAndClientAcceptedMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.firstName }</span></p>
                    <p>
                    	This email is to confirm that quote <b>${ obj.projectId } - ${ obj.projectName }</b> has been accepted.
										</p>
										<p>
                    	Pls click <a href="${ process.env.PORTAL_URL }/dashboard/details/${ obj.nativeProjectId }" target="_blank">here</a> to enter the project in <b>αlfα by Pangea</b> portal
										</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function managersAndClientRejectedMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
            <header style="background-color:#efefef;text-align:center;" >
                <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
            </header>
            <div class="main" style="padding:25px;" >
                <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.firstName }</span></p>
								<p>This email is to confirm that quote <b>${ obj.projectId } - ${ obj.projectName }</b> has been rejected.</p>
            </div>
            <footer>
                <hr size="10" style="border:none;" color="#efefef">
                <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
            </footer>
        </div>`
}

//Generate template for PM/AM if Vendor start job.
function stepStartedMessage(obj, user) {
	const vendorSurname = obj.step.vendor.surname || ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                   	<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Vendor ${ obj.step.vendor.firstName } ${ vendorSurname } just start the step: ${ obj.step.stepId } from <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj._id }" target="_blank">${ obj.projectId } - ${ obj.projectName }</a>
                    </p>
                    <p style="font-weight: 400;">
                        You can track progress on Project page.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

//Generate template for PM/AM if Vendor complete job.
function stepCompletedMessage(obj, user) {
	const vendorSurname = obj.step.vendor.surname || ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Vendor ${ obj.step.vendor.firstName } ${ vendorSurname } just completed the step: ${ obj.step.stepId } from <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj._id }" target="_blank">${ obj.projectId } - ${ obj.projectName }</a>
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function requestCancelledMessage(obj) {
	const lastName = obj.accountManager.lastName || ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <h4 class="contact-name">Dear ${ obj.accountManager.firstName } ${ lastName }</h4>
                    <p>
                        Client${ obj.customer.name } has cancelled the project: ${ obj.requestId } - ${ obj.projectName }.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

//Generate template for PM/AM if Vendor Accept or Reject the job.
function stepDecisionMessage(obj, user) {
	const vendorSurname = obj.step.vendor.surname || ""
	const decision = obj.decision === "accept" ? "approved" : "rejected"
	const reason = obj.reason || ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                 		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Vendor <b>${ obj.step.vendor.firstName } ${ vendorSurname }</b> has <b> ${ decision }</b> the assigned step: ${ obj.step.stepId } 
                    </p>
     								<ul>
									     	<li>
									     		${ obj.step.step.title }
												</li>					
												<li>
													${ obj.step.sourceLanguage } >> ${ obj.step.targetLanguage }
												</li>	
										</ul>
                    <p style="font-weight: 400;">
                    	from project: <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj.project._id }" target="_blank">${ obj.project.projectId } - ${ obj.project.projectName }</a>
										</p>
                    <div style="font-weight: 400;">
                        ${ reason }
                    </div>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

//Template for Message for Ready to DR2
function readyForDr2Message(obj, user) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        The Delivery Review for ${ obj.taskId } from project <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj._id }" target="_blank">${ obj.projectId } - ${ obj.projectName }</a> has been finished. 
                    </p>
                    <p style="font-weight: 400;">
                        Please, do the Delivery Review 2
                    </p>
                    <p style="font-weight: 400;">
                        Project deadline is: ${ obj.deadline }
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function rollbackDR1Template(taskId, projectId) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="font-width: 400;">
                    	Delivery review of the task <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ projectId }" target="_blank"> ${ taskId }</a> is assigned to you.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

//Template for DR has been reassigned
function managerDr1Reassign(obj, DRNumber) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.prevManager.firstName } ${ obj.prevManager.lastName || "" }</span></p>
                    <p style="font-width: 400;">
                        The Delivery Review ${ DRNumber } for ${ obj.taskId } from project <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj.project._id }" target="_blank">${ obj.project.projectId } - ${ obj.project.projectName }</a> has been reassigned to ${ obj.manager.firstName } ${ obj.manager.lastName || "" }.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

// Template the DR has been assigned to you.
function managerDr1Assigned(obj, DRNumber) {
	const lastName = obj.manager.lastName || ""
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.manager.firstName } ${ lastName }</span></p>
                    <p style="font-weight: 400;">
                        Delivery review ${ DRNumber } for ${ obj.taskId } from project <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj.project._id }" target="_blank">${ obj.project.projectId } - ${ obj.project.projectName }</a> has been assigned to you.
                    </p>
                    <p style="font-weight: 400;">
                        Project deadline is: ${ obj.project.deadline }
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function severalDr1Assign(obj) {
	const tasks = obj.checkedTasksId.reduce((acc, curr) => {
		acc = acc + `<li>${ curr }</li>`
		return acc
	}, '')
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.manager.firstName } ${ obj.manager.lastName || "" }</span></p>
                    <p style="font-width: 400;">
                        DR1 for project <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj.project._id }" target="_blank">${ obj.project.projectId } - ${ obj.project.projectName }</a> 
                        has been assigned to you for the following tasks
                    </p>
                    <ul style="font-width: 400;">
                    	${ tasks }
										</ul>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function severalDr1reAssign(obj) {
	const tasks = obj.checkedTasksId.reduce((acc, curr) => {
		acc = acc + `<li>${ curr }</li>`
		return acc
	}, '')
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                		<p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.prevManager.firstName } ${ obj.prevManager.lastName || "" }</span></p>
                    <p style="font-width: 400;">
                        DR1 from project <a href="${ apiUrl }/pangea-projects/all-projects/All/details/${ obj.project._id }" target="_blank">${ obj.project.projectId } - ${ obj.project.projectName }</a> 
                        has been reassigned to ${ obj.manager.firstName } ${ obj.manager.lastName || "" } for the following tasks:
                    </p>
                    <ul style="font-width: 400;">
                    	${ tasks }
										</ul>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function allManagersMessageRequestIsCreated(user, request, client) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                   <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName } ${ user.lastName || '' }</span></p>
                    <p style="font-weight: 400;">
                        Incoming request: <a href="${ apiUrl }/pangea-projects/requests/details/${ request._id }" target="_blank">${ request.projectId } - ${ request.projectName }</a> 
                        from client: ${ client.name }, in service: ${ request.requestForm.service.title }, has been created. Please, check.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function pmAssignInRequest(request) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                   <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ request.projectManager.firstName } ${ request.projectManager.lastName || '' }</span></p>
                    <p style="font-weight: 400;">
                        Incoming request: <a href="${ apiUrl }/pangea-projects/requests/am-requests/Request_Approved/details/${ request._id }" target="_blank">${ request.projectId } - ${ request.projectName }</a> 
                        from client: ${ request.customer.name }, in service: ${ request.requestForm.service.title }, has been assign to you. Please, check.
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function getMessageResetPassword( url) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                   <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear user</span></p>
                   	<p style="font-weight: 400;">
                   		A request to reset your Pangea password has been made. 
										</p>	
										<p style="font-weight: 400;">
                      If you did not make this request, simply ignore this email. If you did make this request, please reset your password: 
										</p>	
										
										<p style="font-weight: 400;">
										<a href="${ url }" style="background: #d66f58;color: #fff;padding: 6px 20px;text-decoration: none;border-radius: 2px;cursor: pointer;margin: 7px 10px 0px 0;display: inline-block;">Reset Password</a>
										</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>
`
}

module.exports = {
	pmAssignInRequest,
	allManagersMessageRequestIsCreated,
	getMessageWithRandomPassword,
	managerAssignmentNotifyingMessage,
	managerTaskCompleteNotificationMessage,
	deliverablesDownloadedMessage,
	managersAndClientAcceptedMessage,
	managersAndClientRejectedMessage,
	stepStartedMessage,
	stepCompletedMessage,
	stepDecisionMessage,
	readyForDr2Message,
	managerDr1Reassign,
	managerDr1Assigned,
	rollbackDR1Template,
	severalDr1Assign,
	severalDr1reAssign,
	getMessageResetPassword,
}
// Generate template for password restore message
function getMessageWithRandomPassword(password) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                   <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear pangea system user,</span></p>
                   	<p style="font-weight: 400;">
                   		We generated new password for you to sign in to the system.
										</p>
                    <p style="font-weight: 400;"> Please, use this password: <span style="font-weight: bold;"> ${ password }</span></p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>
`;
}

// Generate template for message if quote approved and vendors now assigned
function managerAssignmentNotifyingMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                   <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Quote  <a href="https://admin.pangea.global/project-details/${obj._id}" target="_blank" style="color: #D15F45">${ obj.projectId } - ${ obj.projectName }</a> has been accepted. Please, assign Vendor(s) for the task(s) to start project.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

//Template for Message for Ready to DR1
function managerTaskCompleteNotificationMessage(obj, user) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                		<p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Task ${ obj.task.taskId } from project <a href="https://admin.pangea.global/project-details/${obj._id}" target="_blank" style="color: #D15F45">${ obj.projectId } - ${ obj.projectName } </a>  is completed and ready for DR1.
                    </p>
                    <p style="font-weight: 400;">
                        Project deadline is: ${ obj.deadline }
                    </p>
                    <p style="font-weight: 400;">
                        Please, make the review or assign another PM to do it.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

//Delivery Task Template
function deliverablesDownloadedMessage(obj, user) {
	const lastName = obj.manager.lastName || "";
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.manager.firstName } ${ lastName }</span></p>  
                    <p style="font-weight: 400;">
                        Task ${ obj.taskId } from project  <a href="https://admin.pangea.global/project-details/${obj._id}" target="_blank" style="color: #D15F45">${ obj.project_id } - ${ obj.projectName}</a>  has been reviewed and delivered by ${user.firstName} ${user.lastName || ""}
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function managerRequestNotifyingMessage(obj) {
	const industry = obj.industry ? obj.industry.name : "";
	const { sourceLanguage, packageSize } = obj;
	const languages = obj.targetLanguages.reduce((acc, cur) => {
		acc += sourceLanguage ? `${ sourceLanguage.lang } >> ${ cur.lang }; ` : `${ cur.lang }/${ packageSize.size }; `
		return acc;
	}, "")
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                   <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.user.firstName }</span></p>  
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
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function managerRequestAssignedMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                   <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.user.firstName }</span></p>  
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
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function managerProjectAcceptedMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.accManager }</h4>
                    <p>
                        Client ${ obj.customer.name } has just accepted quote:  <a href="https://admin.pangea.global/project-details/${obj._id}" target="_blank" style="color: #D15F45">${ obj.projectId } - ${ obj.projectName }</a>
                    </p>
                    <p>
                        You can proceed with the project.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function managerProjectRejectedMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
            <header style="background-color:#66563E;text-align:center;" >
                <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
            </header>
            <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                <h4 class="contact-name">Dear ${ obj.manager }</h4>
                <p>
                    Client ${ obj.customer.name } has just rejected quote: <a href="https://admin.pangea.global/project-details/${obj._id}" target="_blank" style="color: #D15F45">${ obj.projectId } - ${ obj.projectName }</a>
                </p>
                <p>
                    Please archive the project.
                </p>
            </div>
            <footer>
                <hr size="15" color="#66563E">
                <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
            </footer>
        </div>`;
}

//Generate template for PM/AM if Vendor start job.
function stepStartedMessage(obj, user) {
	const vendorSurname = obj.step.vendor.surname || "";
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                   	<p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Vendor ${ obj.step.vendor.firstName } ${ vendorSurname } just start the step: ${ obj.step.stepId } from <a href="https://admin.pangea.global/project-details/${obj._id}" target="_blank" style="color: #D15F45">${ obj.projectId } - ${ obj.projectName }</a>
                    </p>
                    <p style="font-weight: 400;">
                        You can track progress on Project page.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

//Generate template for PM/AM if Vendor complete job.
function stepCompletedMessage(obj, user) {
	const vendorSurname = obj.step.vendor.surname || "";
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Vendor ${ obj.step.vendor.firstName } ${ vendorSurname } just completed the step: ${ obj.step.stepId } from <a href="https://admin.pangea.global/project-details/${obj._id}" target="_blank" style="color: #D15F45">${ obj.projectId } - ${ obj.projectName }</a>
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

function requestCancelledMessage(obj) {
	const lastName = obj.accountManager.lastName || "";
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <h4 class="contact-name">Dear ${ obj.accountManager.firstName } ${ lastName }</h4>
                    <p>
                        Client${ obj.customer.name } has cancelled the project: ${ obj.requestId } - ${ obj.projectName }.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

//Generate template for PM/AM if Vendor Accept or Reject the job.
function stepDecisionMessage(obj, user) {
	const vendorSurname = obj.step.vendor.surname || "";
	const decision = obj.decision === "accept" ? "approved" : "rejected";
	const reason = obj.reason || "";
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                 		<p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        Vendor ${ obj.step.vendor.firstName } ${ vendorSurname } has ${ decision } the assigned step: ${ obj.step.stepId } from <a href="https://admin.pangea.global/project-details/${obj.project._id}" target="_blank" style="color: #D15F45">${ obj.project.projectId } - ${ obj.project.projectName }</a>
                    </p>
                    <div style="font-weight: 400;">
                        ${ reason }
                    </div>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

//Template for Message for Ready to DR2
function readyForDr2Message(obj, user) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ user.firstName }</span></p>
                    <p style="font-weight: 400;">
                        The Delivery Review for ${ obj.taskId } from project <a href="https://admin.pangea.global/project-details/${obj._id}" target="_blank" style="color: #D15F45">${ obj.projectId } - ${ obj.projectName }</a> has been finished. 
                    </p>
                    <p style="font-weight: 400;">
                        Please, do the Delivery Review 2
                    </p>
                    <p style="font-weight: 400;">
                        Project deadline is: ${ obj.deadline }
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

//Template for DR has been reassigned
function managerDr1Reassign(obj, DRNumber) {
	const lastNamePrevManager = obj.prevManager.lastName || "";
	const lastNameNextManager = obj.manager.lastName || "";
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                		<p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.prevManager.firstName } ${ lastNamePrevManager }</span></p>
                    <p style="font-width: 400;">
                        The Delivery Review ${DRNumber} for ${ obj.taskId } from project <a href="https://admin.pangea.global/project-details/${obj.project._id}" target="_blank" style="color: #D15F45">${ obj.project.projectId } - ${ obj.project.projectName }</a> has been reassigned to ${ obj.manager.firstName } ${ lastNameNextManager }.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}

// Template the DR has been assigned to you.
function managerDr1Assigned(obj, DRNumber) {
	const lastName = obj.manager.lastName || "";
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.manager.firstName } ${ lastName }</span></p>
                    <p style="font-weight: 400;">
                        Delivery review ${DRNumber} for ${ obj.taskId } from project <a href="https://admin.pangea.global/project-details/${obj.project._id}" target="_blank" style="color: #D15F45">${ obj.project.projectId } - ${ obj.project.projectName }</a> has been assigned to you.
                    </p>
                    <p style="font-weight: 400;">
                        Project deadline is: ${ obj.project.deadline }
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`;
}


module.exports = {
	getMessageWithRandomPassword,
	managerAssignmentNotifyingMessage,
	managerTaskCompleteNotificationMessage,
	deliverablesDownloadedMessage,
	managerRequestNotifyingMessage,
	managerRequestAssignedMessage,
	managerProjectAcceptedMessage,
	managerProjectRejectedMessage,
	stepStartedMessage,
	stepCompletedMessage,
	requestCancelledMessage,
	stepDecisionMessage,
	readyForDr2Message,
	managerDr1Reassign,
	managerDr1Assigned,

};
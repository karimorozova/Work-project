let apiUrl = require("../helpers/apiurl")
!!apiUrl && (apiUrl = 'https://admin.pangea.global')

const jwt = require('jsonwebtoken')
const { secretKey } = require('../configs')
const moment = require('moment')
const { returnIconCurrencyByStringCode } = require('../helpers/commonFunctions')

//Generate message for Project Quote
function messageForClientSendQuote(obj, allUnits, allSettingsSteps) {
	const date = Date.now()
	const activeTasks = obj.tasks.filter(item => item.status !== "Cancelled")
	const { minimumCharge: { value, toIgnore } } = obj
	let total = obj.selectedTasks.length ?
			obj.selectedTasks.reduce((acc, curr) => acc + curr.finance.Price.receivables, 0) :
			activeTasks.reduce((acc, curr) => acc + curr.finance.Price.receivables, 0)

	const fromMinimumCharge = !toIgnore ? (value > total) : false
	const tasksInfo = obj.selectedTasks.length ?
			getTasksInfo(obj, fromMinimumCharge, obj.selectedTasks, obj.steps, allUnits, allSettingsSteps) :
			getTasksInfo(obj, fromMinimumCharge, activeTasks, obj.steps, allUnits, allSettingsSteps)
	const tasksInfoArr = obj.selectedTasks.length ?
			getTasksInfo(obj, fromMinimumCharge, obj.selectedTasks, obj.steps, allUnits, allSettingsSteps, true) :
			getTasksInfo(obj, fromMinimumCharge, activeTasks, obj.steps, allUnits, allSettingsSteps, true)
	const taskInfoSubTotal = tasksInfoArr.reduce((acc, curr) => acc + curr.cost, 0)
	const taskInfoWithoutDiscountsArr = obj.selectedTasks.length ?
			getTasksInfo(obj, fromMinimumCharge, obj.selectedTasks, obj.steps, allUnits, allSettingsSteps, true, true) :
			getTasksInfo(obj, fromMinimumCharge, activeTasks, obj.steps, allUnits, allSettingsSteps, true, true)
	const taskInfoWithoutDiscounts = taskInfoWithoutDiscountsArr.reduce((acc, curr) => acc + curr.cost, 0)
	const token = jwt.sign({ id: obj.id }, secretKey, { expiresIn: '21d' })

	total = !toIgnore ? (value > total ? value : total.toFixed(2)) : total.toFixed(2)
	let detailHeader = "Please see below the quote details:"
	if (obj.isPriceUpdated) {
		detailHeader = "Your quote has been updated - please see below the quote details:"
	}
	const reason = obj.reason ? `<p>Reason ${ obj.reason }</p><p>Please see below the updated quote details</p>` : ""
	let acceptQuote = '<a href=' + `${ apiUrl }/projectsapi/pangea-re-survey-page-acceptquote?projectId=${ obj.id }&to=${ date }&t=${ token }` + ` target="_blank" style="color: #D15F46;">I accept - ${ obj.projectId }, ${ (obj.finance.Price.receivables).toFixed(2) } ${ returnIconCurrencyByStringCode(obj.projectCurrency) }</a>`
	let declineQuote = '<a href=' + `${ apiUrl }/projectsapi/pangea-re-survey-page-declinequote?projectId=${ obj.id }&to=${ date }t=${ token }` + ` target="_blank" style="color: #D15F46;">I reject - ${ obj.projectId }, ${ (obj.finance.Price.receivables).toFixed(2) } ${ returnIconCurrencyByStringCode(obj.projectCurrency) }</a>`
	if (obj.selectedTasks.length) {
		let taskIdsString = ''
		obj.selectedTasks.forEach(task => taskIdsString += `${ task.taskId };`)
		taskIdsString = taskIdsString.replace(/[' ']/g, '%')
		acceptQuote = '<a href=' + `${ apiUrl }/projectsapi/pangea-re-survey-page-accept-decline-tasks-quote?projectId=${ obj.id }&tasksIds=${ taskIdsString }&t=${ token }&to=${ date }&prop=Approved` + ` target="_blank" style="color: #D15F46;">I accept - ${ obj.projectId }, ${ (obj.finance.Price.receivables).toFixed(2) } ${ returnIconCurrencyByStringCode(obj.projectCurrency) }</a>`
		declineQuote = '<a href=' + `${ apiUrl }/projectsapi/pangea-re-survey-page-accept-decline-tasks-quote?projectId=${ obj.id }&tasksIds=${ taskIdsString }&t=${ token }&to=${ date }&prop=Rejected` + ` target="_blank" style="color: #D15F46;">I reject - ${ obj.projectId }, ${ (obj.finance.Price.receivables).toFixed(2) } ${ returnIconCurrencyByStringCode(obj.projectCurrency) }</a>`
	}

	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;">
                <header style="background-color:#66563E;text-align:center;">
                    <img class="logo" src="cid:logo@pan" alt="pangea"
                        style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;">
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;">
                    <div id="client-name-row"></div>
                    <p class="main_italic main_line15 main_weight600"
                        style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">
                        ***This is an automated message***<br>
                        This message is sent to you on behalf of ${ obj.accountManager.firstName } ${ obj.accountManager.lastName }</p>
                    <p>${ detailHeader }</p>
                    <div class="details" style="width: 95%; margin-top:0;margin-bottom:15px;margin-right:auto;margin-left:auto;">
                        <h4 class="details__title">Quote Details:</h4>
                        <div style="overflow-x:auto;">
	                        <table class="details__table"
	                            style="color:#66563E; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
	                            <tr>
	                                <td class="main_weight600"
	                                    style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
	                                    Name:</td>
	                                <td
	                                    style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
	                                    ${ obj.projectName }</td>
	                            </tr>
	                            <tr>
	                                <td class="main_weight600"
	                                    style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
	                                    ID:</td>
	                                <td
	                                    style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
	                                    ${ obj.projectId }</td>
	                            </tr>
	                            <tr>
	                                <td class="main_weight600"
	                                    style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
	                                    Industry:</td>
	                                <td
	                                    style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
	                                    ${ obj.industry.name }</td>
	                            </tr>
	                            <tr>
	                                <td class="main_weight600"
	                                    style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
	                                    Estimated delivery date:</td>
	                                <td
	                                    style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
	                                    ${ moment(obj.deadline).format('LLL') }</td>
	                            </tr>
	                        </table>
                        </div>
                        </br>
                        <div style="overflow-x:auto;">
	                        <table class="details__table"
	                            style="width:100%;color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
	                            <tr>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Service</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Language</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Step</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Unit</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Unit Price</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Quantity</td>
																	${ showCostHeader(fromMinimumCharge) }
	                            </tr>
	                            ${ tasksInfo }
	         										${ generateTotalRow(taskInfoSubTotal, fromMinimumCharge, obj) }
	                        </table>
                        </div>
                        </br>
                        <div style="overflow-x:auto;">
	                        <table class="details__table"
	                            style="color:#66563E;width: 60%;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
															${ generateSubTotalAndTMDiscountsRow(taskInfoSubTotal, taskInfoWithoutDiscounts, fromMinimumCharge, obj) }
	                            ${ discountsRows(obj, taskInfoWithoutDiscounts, fromMinimumCharge, taskInfoSubTotal) }
	                            <tr>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E;border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                Total:</td>
	                                <td
	                                    style="color:#fff; background: #66563E;border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                   ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
	                            </tr>
	                        </table>
												</div>
                    </div>
                    <p class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;">
                        By clicking on one of the link below, you can accept or reject our offer.<br>
                        <span class="main_line15-red"
                            style="background-color:#F4F0EE;padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;">
                            Clicking "I accept" will also approve and accept our <a
                                href="https://www.pangea.global/wp-content/uploads/2019/11/Pangea-Terms-Conditions.pdf" class="link"
                                style="color:#D15F46;">terms and conditions</a>
                        </span>
                    </p>
                    <p>You can accept the quote by clicking the link below:</p>
                    I accept - ${ acceptQuote }
                    <p>or</p>
                    I reject - ${ declineQuote }
                    <p><span class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;">Please note:</span><br>
                    		<span style="font-weight: 600; padding: 2px 0; background: #EBBA46">The quote does not include VAT</span><br>
                        In case of any questions, please do not hesitate to contact us :-)</p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global"
                        style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;">www.pangea.global</a>
                </footer>
            </div>`
}

//Generate message for Project Cost Quote
function messageForClientSendCostQuote(obj, allUnits, allSettingsSteps) {
	const activeTasks = obj.tasks.filter(item => item.status !== "Cancelled")
	const { minimumCharge: { value, toIgnore } } = obj
	let total = obj.selectedTasks.length ?
			obj.selectedTasks.reduce((acc, curr) => acc + curr.finance.Price.receivables, 0) :
			activeTasks.reduce((acc, curr) => acc + curr.finance.Price.receivables, 0)
	const fromMinimumCharge = !toIgnore ? (value > total) : false
	const tasksInfo = obj.selectedTasks.length ?
			getTasksInfo(obj, fromMinimumCharge, obj.selectedTasks, obj.steps, allUnits, allSettingsSteps) :
			getTasksInfo(obj, fromMinimumCharge, activeTasks, obj.steps, allUnits, allSettingsSteps)
	const tasksInfoArr = obj.selectedTasks.length ?
			getTasksInfo(obj, fromMinimumCharge, obj.selectedTasks, obj.steps, allUnits, allSettingsSteps, true) :
			getTasksInfo(obj, fromMinimumCharge, activeTasks, obj.steps, allUnits, allSettingsSteps, true)
	const taskInfoSubTotal = tasksInfoArr.reduce((acc, curr) => acc + curr.cost, 0)
	const taskInfoWithoutDiscountsArr = obj.selectedTasks.length ?
			getTasksInfo(obj, fromMinimumCharge, obj.selectedTasks, obj.steps, allUnits, allSettingsSteps, true, true) :
			getTasksInfo(obj, fromMinimumCharge, activeTasks, obj.steps, allUnits, allSettingsSteps, true, true)
	const taskInfoWithoutDiscounts = taskInfoWithoutDiscountsArr.reduce((acc, curr) => acc + curr.cost, 0)

	total = !toIgnore ? (value > total ? value : total.toFixed(2)) : total.toFixed(2)
	let detailHeader = "Please see below the estimated quote details:"

	return `<div class="wrapper"
                style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;">
                <header style="background-color:#66563E;text-align:center;">
                    <img class="logo" src="cid:logo@pan" alt="pangea"
                        style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;">
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;">
                    <div id="client-name-row"></div>
                    <p class="main_italic main_line15 main_weight600"
                        style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">
                        ***This is an automated message***<br>
                        This message is sent to you on behalf of ${ obj.accountManager.firstName } ${ obj.accountManager.lastName }</p>
                    <p>${ detailHeader }</p>
                    <div class="details" style="width: 95%; margin-top:0;margin-bottom:15px;margin-right:auto;margin-left:auto;">
                        <h4 class="details__title">Quote Details:</h4>
                        <div style="overflow-x:auto;">
	                        <table class="details__table"
	                            style="color:#66563E; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
	                            <tr>
	                                <td class="main_weight600"
	                                    style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
	                                    Name:</td>
	                                <td
	                                    style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
	                                    ${ obj.projectName }</td>
	                            </tr>
	                            <tr>
	                                <td class="main_weight600"
	                                    style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
	                                    ID:</td>
	                                <td
	                                    style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
	                                    ${ obj.projectId }</td>
	                            </tr>
	                            <tr>
	                                <td class="main_weight600"
	                                    style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
	                                    Industry:</td>
	                                <td
	                                    style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
	                                    ${ obj.industry.name }</td>
	                            </tr>
	                            <tr>
	                                <td class="main_weight600"
	                                    style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
	                                    Estimated delivery date:</td>
	                                <td
	                                    style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
	                                    ${ moment(obj.deadline).format('LLL') }</td>
	                            </tr>
	                        </table>
                        </div>
                        </br>
                        <div style="overflow-x:auto;">
	                        <table class="details__table"
	                            style="width:100%;color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
	                            <tr>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Service</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Language</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Step</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Unit</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Unit Price</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Quantity</td>
																	${ showCostHeader(fromMinimumCharge) }
	                            </tr>
	                            ${ tasksInfo }
	         										${ generateTotalRow(taskInfoSubTotal, fromMinimumCharge, obj) }
	                        </table>
                        </div>
                        </br>
                        <div style="overflow-x:auto;">
	                        <table class="details__table"
	                            style="color:#66563E;width: 60%;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
															${ generateSubTotalAndTMDiscountsRow(taskInfoSubTotal, taskInfoWithoutDiscounts, fromMinimumCharge, obj) }
	                            ${ discountsRows(obj, taskInfoWithoutDiscounts, fromMinimumCharge, taskInfoSubTotal) }
	                            <tr>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E;border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                Total:</td>
	                                <td
	                                    style="color:#fff; background: #66563E;border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
	                            </tr>
	                        </table>
												</div>
                    </div>
                    <p>
                    	This is a Cost Quote and provides only estimation.
										</p>
                    <p class="main_weight600 main_line15" style="font-weight:600;line-height:1.5;">
                        <span class="main_line15-red" style="background-color:#F4F0EE;padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;">
                            Should anything change in the files or instructions, so will the deadline and charges.
                        </span>
                    </p>
                    <p>
                    	<span style="font-weight: 600; padding: 2px 0; background: #EBBA46">Please note: The quote does not include VAT</span><br>
										</p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global"
                        style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;">www.pangea.global</a>
                </footer>
            </div>`
}

//Make template for .pdf file
function getPdfOfQuote(allUnits, allSettingsSteps, obj, tasksIds = []) {
	const selectedTasks = !tasksIds.length ? obj.tasks.filter(item => item.status !== "Cancelled") : obj.tasks.filter(task => tasksIds.includes(task.taskId))
	const { minimumCharge: { value, toIgnore } } = obj
	let total = selectedTasks.reduce((acc, curr) => acc + curr.finance.Price.receivables, 0)
	const fromMinimumCharge = !toIgnore ? (value > total) : false
	const tasksInfo = getTasksInfo(obj, fromMinimumCharge, selectedTasks, obj.steps, allUnits, allSettingsSteps)
	const tasksInfoArr = getTasksInfo(obj, fromMinimumCharge, selectedTasks, obj.steps, allUnits, allSettingsSteps, true)
	const taskInfoSubTotal = tasksInfoArr.reduce((acc, curr) => acc + curr.cost, 0)
	const taskInfoWithoutDiscountsArr = getTasksInfo(obj, fromMinimumCharge, selectedTasks, obj.steps, allUnits, allSettingsSteps, true, true)
	const taskInfoWithoutDiscounts = taskInfoWithoutDiscountsArr.reduce((acc, curr) => acc + curr.cost, 0)
	total = !toIgnore ? (value > total ? value : total.toFixed(2)) : total.toFixed(2)
	const clientName = obj.customer.officialName || obj.customer.name

	return `<div class="wrapper pdf" style="width:800px; margin: 0 auto; font-size:14px!important;font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="border: 1px solid #66563D;text-align:center;padding-top:15px;padding-bottom:15px;padding-right:0;padding-left:0;" >
                	<svg style="height: 70px;" id="Ñëîé_1" data-name="Ñëîé 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 253 72"><defs><style>.cls-1,.cls-6{fill:#66563d;}.cls-1{stroke:#66563d;stroke-miterlimit:10;stroke-width:1.27px;}.cls-2{fill:#f1fafc;}.cls-3{fill:#d15f45;}.cls-3,.cls-4,.cls-5{fill-rule:evenodd;}.cls-3,.cls-4{opacity:0.9;}.cls-4{fill:#f4c040;}.cls-5{fill:#4ba5a5;}.cls-6{font-size:13.87px;font-family:CourierNewPS-BoldMT, Courier New;font-weight:700;}</style></defs><path class="cls-1" d="M87,20.64v4.13a14.82,14.82,0,0,1,4.35-3.7,11.51,11.51,0,0,1,5.48-1.24A12.51,12.51,0,0,1,103,21.4a11,11,0,0,1,4.39,4.36,12,12,0,0,1,1.55,5.87,11.35,11.35,0,0,1-3.5,8.36A12.34,12.34,0,0,1,87,38.52V52.18h5.51a1.73,1.73,0,0,1,1.16.31,1.12,1.12,0,0,1,0,1.63,1.67,1.67,0,0,1-1.16.33H81.65a1.77,1.77,0,0,1-1.16-.31,1,1,0,0,1-.35-.83,1,1,0,0,1,.35-.82,1.71,1.71,0,0,1,1.16-.31h3V22.94h-3a1.66,1.66,0,0,1-1.16-.33,1,1,0,0,1-.35-.83,1,1,0,0,1,.35-.81,1.66,1.66,0,0,1,1.16-.33Zm19.65,11a9.1,9.1,0,0,0-2.84-6.71,10.09,10.09,0,0,0-14,0,9.29,9.29,0,0,0,0,13.41,10.06,10.06,0,0,0,13.93,0A9.08,9.08,0,0,0,106.62,31.63Z"/><path class="cls-1" d="M130.23,44V40.76a16.17,16.17,0,0,1-10.56,4.16,9.16,9.16,0,0,1-6.37-2.07,6.55,6.55,0,0,1-2.3-5.06A7.23,7.23,0,0,1,114,32c2-1.64,5-2.46,8.83-2.46a32.56,32.56,0,0,1,3.4.2c1.22.14,2.55.35,4,.64V26.74a4.07,4.07,0,0,0-1.73-3.24,8.26,8.26,0,0,0-5.18-1.37,26.12,26.12,0,0,0-7.43,1.54,5.13,5.13,0,0,1-1.11.27,1,1,0,0,1-.74-.33,1.09,1.09,0,0,1-.31-.81,1,1,0,0,1,.27-.73,9.13,9.13,0,0,1,3-1.1,26.83,26.83,0,0,1,6.37-1.14,9.79,9.79,0,0,1,6.7,2.12,6.29,6.29,0,0,1,2.4,4.79v15h3a1.76,1.76,0,0,1,1.18.31,1,1,0,0,1,.35.82,1,1,0,0,1-.35.81,1.7,1.7,0,0,1-1.18.32Zm0-11.28a22,22,0,0,0-3.38-.68,32.11,32.11,0,0,0-3.75-.21c-3.29,0-5.87.71-7.72,2.13a4.66,4.66,0,0,0-2.11,3.81,4.4,4.4,0,0,0,1.61,3.45,6.89,6.89,0,0,0,4.68,1.41A12.71,12.71,0,0,0,125,41.47a19.66,19.66,0,0,0,5.2-3.74Z"/><path class="cls-1" d="M146.16,20.64v3.43a16.26,16.26,0,0,1,4.29-3.32,9.92,9.92,0,0,1,4.32-.92,10.12,10.12,0,0,1,4.73,1.11,7.85,7.85,0,0,1,2.74,2.69,6.92,6.92,0,0,1,1.23,3.84V41.76h1.91a1.71,1.71,0,0,1,1.16.31,1,1,0,0,1,.35.82,1,1,0,0,1-.35.81,1.66,1.66,0,0,1-1.16.32h-6.07a1.71,1.71,0,0,1-1.19-.32,1.08,1.08,0,0,1-.35-.81,1,1,0,0,1,.35-.82,1.77,1.77,0,0,1,1.19-.31h1.89V27.85a5.38,5.38,0,0,0-1.76-4.06,6.53,6.53,0,0,0-4.7-1.66,8,8,0,0,0-3.88.9,20.8,20.8,0,0,0-4.7,4.5V41.76h2.56a1.71,1.71,0,0,1,1.16.31,1,1,0,0,1,.36.82,1.06,1.06,0,0,1-.36.81,1.66,1.66,0,0,1-1.16.32h-7.39a1.71,1.71,0,0,1-1.17-.32,1.08,1.08,0,0,1-.35-.81,1,1,0,0,1,.35-.82,1.76,1.76,0,0,1,1.17-.31h2.56V22.94H142a1.67,1.67,0,0,1-1.16-.33,1.08,1.08,0,0,1-.35-.83,1.05,1.05,0,0,1,.35-.81,1.67,1.67,0,0,1,1.16-.33Z"/><path class="cls-1" d="M188.67,24.8V20.64H194a1.66,1.66,0,0,1,1.16.33,1,1,0,0,1,.35.83,1,1,0,0,1-.35.81,1.66,1.66,0,0,1-1.16.33h-3.05V45.59a8.31,8.31,0,0,1-1,4,9,9,0,0,1-2.16,2.46,12.13,12.13,0,0,1-2.75,1.81,8.51,8.51,0,0,1-3.33.54h-6.42a1.77,1.77,0,0,1-1.16-.31,1.16,1.16,0,0,1,0-1.66,1.66,1.66,0,0,1,1.16-.33l6.51,0a6.5,6.5,0,0,0,3.6-1,7.8,7.8,0,0,0,2.66-3,6.17,6.17,0,0,0,.59-2.89V38.46a11.16,11.16,0,0,1-9.39,5A10.89,10.89,0,0,1,171.22,40a11.53,11.53,0,0,1-3.39-8.36,11.46,11.46,0,0,1,3.39-8.34,10.88,10.88,0,0,1,8.06-3.46A11.18,11.18,0,0,1,188.67,24.8Zm0,6.83a9.2,9.2,0,0,0-2.74-6.75,9.13,9.13,0,0,0-13.08,0,9.21,9.21,0,0,0-2.72,6.73,9.23,9.23,0,0,0,2.72,6.76,9.11,9.11,0,0,0,13.08,0A9.21,9.21,0,0,0,188.67,31.63Z"/><path class="cls-1" d="M222.06,32.87H198.94A11,11,0,0,0,202.63,40a11.25,11.25,0,0,0,7.65,2.69,18.33,18.33,0,0,0,5.32-.84,13.83,13.83,0,0,0,4.54-2.21,1.55,1.55,0,0,1,.89-.41,1,1,0,0,1,.76.34,1.13,1.13,0,0,1,.32.8,1.27,1.27,0,0,1-.43.89,12.13,12.13,0,0,1-4.61,2.52,20.17,20.17,0,0,1-6.79,1.18,13.36,13.36,0,0,1-9.73-3.83,12.44,12.44,0,0,1-3.9-9.24,11.37,11.37,0,0,1,3.66-8.48,12.52,12.52,0,0,1,9.06-3.54,12.33,12.33,0,0,1,9.15,3.63A12.69,12.69,0,0,1,222.06,32.87Zm-2.3-2.29a9.85,9.85,0,0,0-3.55-6.1,11.17,11.17,0,0,0-13.67,0A10,10,0,0,0,199,30.58Z"/><path class="cls-1" d="M244.5,44V40.76a16.15,16.15,0,0,1-10.56,4.16,9.16,9.16,0,0,1-6.37-2.07,6.55,6.55,0,0,1-2.3-5.06,7.23,7.23,0,0,1,3-5.75c2-1.64,5-2.46,8.83-2.46a32.4,32.4,0,0,1,3.4.2c1.22.14,2.55.35,4,.64V26.74a4.07,4.07,0,0,0-1.73-3.24,8.26,8.26,0,0,0-5.18-1.37,26.12,26.12,0,0,0-7.43,1.54,5,5,0,0,1-1.11.27,1,1,0,0,1-.74-.33,1.13,1.13,0,0,1-.31-.81,1,1,0,0,1,.27-.73,9.13,9.13,0,0,1,3-1.1,26.83,26.83,0,0,1,6.37-1.14,9.79,9.79,0,0,1,6.7,2.12,6.29,6.29,0,0,1,2.4,4.79v15h3a1.79,1.79,0,0,1,1.19.31,1,1,0,0,1,.35.82,1.08,1.08,0,0,1-.35.81,1.73,1.73,0,0,1-1.19.32Zm0-11.28a21.74,21.74,0,0,0-3.38-.68,32,32,0,0,0-3.75-.21c-3.29,0-5.87.71-7.72,2.13a4.66,4.66,0,0,0-2.11,3.81,4.4,4.4,0,0,0,1.61,3.45,6.89,6.89,0,0,0,4.68,1.41,12.68,12.68,0,0,0,5.47-1.18,19.66,19.66,0,0,0,5.2-3.74Z"/><circle class="cls-2" cx="56.96" cy="27.78" r="8.27"/><circle class="cls-2" cx="20.76" cy="27.78" r="8.27"/><path class="cls-3" d="M71.14,12.74c-.53-.53-1-1-1.57-1.46a20,20,0,0,0-25.22,0,21.56,21.56,0,0,0-1.6,1.46A19.27,19.27,0,0,0,36.86,26.9a19.58,19.58,0,0,0,5,13.3l.09.07.79.81A12.49,12.49,0,0,0,45,43.13l12,11,1.74-1.69c.1-.06,11-9.94,11-9.94a14.93,14.93,0,0,0,1.38-1.38A19.47,19.47,0,0,0,77,26.9,19.31,19.31,0,0,0,71.14,12.74ZM62.77,33.59a7.76,7.76,0,0,1-5.84,2.46A8,8,0,0,1,51,33.59a7.87,7.87,0,0,1-2.36-5.79,8.07,8.07,0,0,1,8.25-8.29,7.9,7.9,0,0,1,5.84,2.36,8.06,8.06,0,0,1,2.46,5.93A7.7,7.7,0,0,1,62.77,33.59Z"/><path class="cls-4" d="M34.94,12.74c-.52-.53-1-1-1.57-1.46A19.26,19.26,0,0,0,20.74,6.8,19.13,19.13,0,0,0,8.15,11.28c-.54.45-1.07.93-1.6,1.46A19.31,19.31,0,0,0,.66,26.9a19.58,19.58,0,0,0,5,13.3l.1.07q.38.4.78.81a12.82,12.82,0,0,0,2.29,2.05l12,11,1.74-1.69c.1-.06,11-9.94,11-9.94a13.79,13.79,0,0,0,1.38-1.38A19.43,19.43,0,0,0,40.83,26.9,19.27,19.27,0,0,0,34.94,12.74ZM26.58,33.59a7.78,7.78,0,0,1-5.84,2.46,8,8,0,0,1-5.89-2.46,7.84,7.84,0,0,1-2.36-5.79,8.07,8.07,0,0,1,8.25-8.29,7.92,7.92,0,0,1,5.84,2.36A8.08,8.08,0,0,1,29,27.8,7.73,7.73,0,0,1,26.58,33.59Z"/><path class="cls-5" d="M55,7.42c-.59-.59-1.18-1.14-1.77-1.64A21.76,21.76,0,0,0,38.92.72a21.6,21.6,0,0,0-14.2,5.06c-.61.5-1.21,1-1.81,1.64a21.83,21.83,0,0,0-6.64,16,22.07,22.07,0,0,0,5.65,15l.11.08c.28.31.58.61.88.92a14.27,14.27,0,0,0,2.59,2.31L39.06,54.09l2-1.91C41.13,52.11,53.39,41,53.39,41A14.33,14.33,0,0,0,55,39.41a22,22,0,0,0,6.65-16A21.8,21.8,0,0,0,55,7.42ZM45.51,31a8.75,8.75,0,0,1-6.59,2.77A9,9,0,0,1,32.28,31a8.89,8.89,0,0,1-2.67-6.54,9.11,9.11,0,0,1,9.31-9.36,9,9,0,0,1,6.59,2.66,9.12,9.12,0,0,1,2.77,6.7A8.72,8.72,0,0,1,45.51,31Z"/><circle class="cls-2" cx="38.9" cy="24.43" r="9.32"/><text class="cls-6" transform="translate(79.96 68.1)">Translation Experts</text></svg>
                </header>
                <div class="quote__header" style="font-size:14px;background-color:#66563D;color:white;text-transform:uppercase;text-align:center;font-weight:bold;padding-top:15px;padding-bottom:15px;padding-right:0;padding-left:0;" >
                    quote
                </div>
                <div class="quote" style=" border: 1px solid #66563D; display: -webkit-box;" >
                    <div class="quote__left" style="width:380px;margin-top:20px;margin-bottom:20px;margin-right:10px;margin-left:10px;" >
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title to" style="text-align:center;font-weight:bold;width:100px;" >
                                To:
                            </div>
                            <div class="quote__row-text" style="width:300px;" >
                                <b>${ clientName }</b>
                            </div>
                        </div>
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" ></div>
                            <div class="quote__row-text" style="width:300px;" >
                                ${ obj.customer.address || "" }
                            </div>
                        </div>
                    </div>
                    <div class="quote__right" style="width:380px;margin-top:20px;margin-bottom:20px;margin-right:10px;margin-left:10px;" >
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" >
                                Date:
                            </div>
                            <div class="quote__row-text" style="width:300px;" >
                                ${ moment(obj.deadline).format('LLL') }
                            </div>
                        </div>
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" >
                                Currency:
                            </div>
                            <div class="quote__row-text" style="width:300px;" >
                                ${ obj.customer.currency }
                            </div>
                        </div>
                        <div class="quote__row" style="padding-top:2px;padding-bottom:2px;padding-right:0;padding-left:0;display:-webkit-box;" >
                            <div class="quote__row-title" style="font-weight:bold;width:100px;" >
                                Quote ID:
                            </div>
                            <div class="quote__row-text" style="width:300px;" >
                                ${ obj.projectId }
                            </div>
                        </div>
                    </div>

                </div>
                <div class="quote__subheader" style="text-align:center;font-weight:bold;padding-top:15px;padding-bottom:15px;padding-right:0;padding-left:0;border: 1px solid #66563D;" >
                    ${ obj.projectName }
                </div>

	                       <table class="details__table"
	                            style="width:100%;color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
	                            <tr>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Service</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Language</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Step</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Unit</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Unit Price</td>
	                                <td class="main_weight600"
	                                    style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    Quantity</td>
																	${ showCostHeader(fromMinimumCharge) }
	                            </tr>
	                        		${ tasksInfo }
	         										${ generateTotalRow(taskInfoSubTotal, fromMinimumCharge, obj) }

	                        </table>
	                        <table class="details__table"
	                            style="color:#66563E;width: 100%;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
															${ generateSubTotalAndTMDiscountsRow(taskInfoSubTotal, taskInfoWithoutDiscounts, fromMinimumCharge, obj) }
	                            ${ discountsRows(obj, taskInfoWithoutDiscounts, fromMinimumCharge, taskInfoSubTotal) }
	                            <tr>
	                                <td class="main_weight600"
	                                    style="color:#fff; width: 88%; background: #66563E;border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                Total:</td>
	                                <td
	                                    style="color:#fff; background: #66563E;border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
	                                    ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
	                            </tr>
	                        </table>
            </div>`
}

//Check min price in Project
function generateSubTotalAndTMDiscountsRow(taskInfoSubTotal, taskInfoWithoutDiscounts, fromMinimumCharge, obj) {
	const TMDiscount = taskInfoSubTotal - taskInfoWithoutDiscounts
	const TMRow = TMDiscount > 0 ? `<td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;"> TM Discount:</td>
<td style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;"> ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ TMDiscount.toFixed(2) }</td>` : `<td style="display: none;"></td><td style="display: none;"></td>`
	return !fromMinimumCharge ? `<tr>
            <td class="main_weight600"
                style="border:none;background: #F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                Sub-total:</td>
            <td
                style="border:none;background: #F4F0EE;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ taskInfoSubTotal.toFixed(2) }</td>
        </tr>
        <tr>
 						${ TMRow }
        </tr>` : `<tr style="display: none"></tr>`
}

//Check min price in Project
function showCostHeader(fromMinimumCharge) {
	return !fromMinimumCharge ? `<td class="main_weight600"
						style="color:#fff; width: 12%; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
    			Cost</td>` : `<td style="display: none"></td>`
}

//generate discounts and amounts
function discountsRows(obj, taskInfoWithoutDiscounts, fromMinimumCharge, taskInfoSubTotal) {
	const TMDiscount = taskInfoSubTotal - taskInfoWithoutDiscounts
	const startIndex = TMDiscount > 0 ? 2 : 1
	return obj.discounts.length && !fromMinimumCharge ?
			obj.discounts.reduce((acc, curr, index) => {
				let color = (index + startIndex) % 2 ? '#fff' : '#F4F0EE'
				acc += `<tr><td class="main_weight600"
				style="border:none;background: ${ color };padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
						${ curr.name }</td>
						<td style="border:none;background: ${ color };padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ ((taskInfoWithoutDiscounts * curr.value) / 100).toFixed(2) }</td></tr>`
				return acc
			}, '') :
			`<tr style="display: none;"></tr>`
}

//Show or hide SubTotal row
function generateTotalRow(taskInfoSubTotal, fromMinimumCharge, obj) {
	return !fromMinimumCharge ? `<tr>
            <td class="main_weight600"
                  style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                  Sub-total</td>
                  <td style="background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;"></td>
                  <td style="background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;"></td>
                  <td style="background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;"></td>
                <td style="background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;"></td>
                  <td style="background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;"></td>
					 <td class="main_weight600"
					 style="color:#fff; background: #66563E; border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">
                 ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ taskInfoSubTotal.toFixed(2) }</td>
					</tr>` : `<tr style="display: none;"></tr>`
}

//Task information for Project Quote
function getTasksInfo(obj, fromMinimumCharge, tasks, steps, allUnits, allSettingsSteps, onlyInformation = false, sumForTMDiscounts = false) {
	const tasksInfo = tasks.reduce((acc, curTask, index) => {
		const taskSteps = steps.filter(item => item.taskId === curTask.taskId)
		const langPair = curTask.sourceLanguage ? `${ curTask.sourceLanguage } >> ${ curTask.targetLanguage }` : `${ curTask.targetLanguage } / ${ curTask.packageSize }`
		let cost
		let totalQuantity
		for (let curStep of taskSteps) {
			const { type } = allUnits.find(({ _id }) => _id.toString() === curStep.serviceStep.unit.toString())
			const { title } = allSettingsSteps.find(({ _id }) => _id.toString() === curStep.serviceStep.step.toString())
			if (type === 'CAT Wordcount') {
				cost = sumForTMDiscounts ? curStep.finance.Wordcount.receivables * curStep.clientRate.value : curStep.totalWords * curStep.clientRate.value
				totalQuantity = curStep.totalWords
			} else {
				if (type === 'Packages') {
					totalQuantity = curStep.quantity
				} else {
					totalQuantity = curStep.hours
				}
				cost = curStep.defaultStepPrice
			}
			acc.push({
				task: curTask.service.title,
				langPair: `${ langPair }`,
				jobType: title,
				unitPrice: curStep.clientRate.value.toFixed(4),
				unit: type,
				quantity: totalQuantity,
				cost,
				color: (index + 2) % 2 ? '#fff' : '#F4F0EE'
			})
		}
		return [ ...acc ]
	}, [])
	let result = ""
	for (let info of tasksInfo) {
		result += getTaskCode(obj, fromMinimumCharge, info)
	}
	return onlyInformation ? tasksInfo : result
}

//List of Steps for Quote message body
function getTaskCode(obj, fromMinimumCharge, taskInfo) {
	return `<tr>
                <td
                    style="background: ${ taskInfo.color };border: none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${ taskInfo.task }</td>
                <td
                    style="background: ${ taskInfo.color };border: none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${ taskInfo.langPair }</td>
                <td
                    style="background: ${ taskInfo.color };border: none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${ taskInfo.jobType }</td>
                <td
                    style="background: ${ taskInfo.color };border: none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${ taskInfo.unit }</td>
                <td
                    style="background: ${ taskInfo.color };border: none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ taskInfo.unitPrice }</td>
                <td
                    style="background: ${ taskInfo.color };border: none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">
                    ${ taskInfo.quantity }</td>
              	${ showCost(obj, fromMinimumCharge, taskInfo) }
            </tr>`

	function showCost(obj, fromMinimumCharge, taskInfo) {
		return !fromMinimumCharge ? `
		   <td style="background: ${ taskInfo.color };border: none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;"> ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ taskInfo.cost.toFixed(2) }</td>` :
				`<td style="display: none"></td>`
	}
}

function emailMessageForContact(obj) {
	const surname = obj.surname || ""
	const langPairs = obj.tasks.reduce((acc, cur) => {
		const pair = cur.sourceLanguage ? `${ cur.sourceLanguage } >> ${ cur.targetLanguage }; ` : `${ cur.targetLanguage } / ${ cur.packageSize }; `
		return acc + pair
	}, "")
	return `<div class="message-wrapper" style="width: 960px;border: 1px solid rgb(129, 129, 129);">
            <h3 class="clientName" style="margin-top: 0;padding: 30px;background-color: rgb(250, 250, 250);">Dear ${ obj.firstName } ${ surname },</h3>
            <div class="all-info" style="padding: 0 15px 0 30px;">
                <p class="description" style="font-size: 18px;">
                    Here is the information about the project:
                </p>
                <h3 class="detailsTitle">Project Details</h3>
                <table class="details">
                    <tr>
                        <td>Project number:</td>
                        <td>${ obj.projectId }</td>
                    </tr>
                    <tr>
                        <td>Project name:</td>
                        <td>${ obj.projectName }</td>
                    </tr>
                    <tr>
                        <td>Service:</td>
                        <td>${ obj.service }</td>
                    </tr>
                    <tr>
                        <td>Languages:</td>
                        <td>${ langPairs }</td>
                    </tr>
                    <tr>
                        <td>Specialization:</td>
                        <td>${ obj.industry.name }</td>
                    </tr>
                    <tr>
                        <td>Start date: </td>
                        <td>${ obj.startDate }</td>
                    </tr>
                    <tr>
                        <td>Deadline: </td>
                        <td>${ obj.deadline }</td>
                    </tr>
                </table>
                <h2 class="contact" style="border-bottom: 1px solid rgb(29, 29, 29);">Contact Pangea Translation Services (Cyprus) LTD</h2>
                <a href="http://pangea.global" target="_blank"><img src="cid:logo@pan" style="width: 50%; margin-left: 145px;"></a>
            </div>
        </div>`
}

// Return template for Task ready for Delivery
function taskReadyMessage(obj) {
	const am = `${ obj.project.accountManager.firstName } ${ obj.project.accountManager.lastName }`
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${ am }</p>
                    <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.contact.firstName } ${ obj.contact.surname || "" }</span></p>
                    <p style="font-weight: 400;">
                        Task ${ obj.task.taskId } (${ obj.task.service.title }) from project ${ obj.project.projectId } - ${ obj.project.projectName } is ready.
                    </p>
                    <p style="font-weight: 400;">
                        It will be delivered once all tasks have been completed.
                    </p>
                    <p style="font-weight: 400;">
                        In case of any questions, please do not hesitate to contact us :-)
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

// Return template for Task for Delivery
function taskDeliveryMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                    <header style="background-color:#66563E;text-align:center;" >
                        <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                    </header>
                    <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                        <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                            This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
                        <p style="background: #F4F0EE; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.contact.firstName } ${ obj.contact.surname || "" }</span></p>
                        <p style="font-weight: 400;">
                            I'm pleased to inform you that task <strong>${ obj.task.taskId } (${ obj.task.service.title })</strong> from project <strong>${ obj.projectId } - ${ obj.projectName }</strong> has been completed and is ready for review.
                        </p>
                        <p style="font-weight: 400;">
                            The files are available for you in our <a href="https://portal.pangea.global/dashboard/details/${ obj.id }">Portal</a> and attached to this email in a zip format.
                        </p>
                        <p style="font-weight: 400;">
                            In case of any questions, please do not hesitate to contact us :-)
                        </p>
                    </div>
                    <footer>
                        <hr size="15" color="#66563E">
                        <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                    </footer>
                </div>`
}

function projectCancelledMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
                		<div id="client-name-row">&nbsp;</div>
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
                    <p>
                        We are sorry to update you , but project <strong>${ obj.projectId } - ${ obj.projectName }</strong> has been cancelled.
                    </p>
                    <p>
                        Reason: <strong>${ obj.reason }</strong>
                    </p>
                    <p>
                        Kindly contact your Account Manager for further information.
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function projectMiddleCancelledMessage(obj) {
	const isPayRow = obj.isPay ? `<p>You will need to pay a partial amount of <strong>${ obj.finance.Price.receivables } ${ returnIconCurrencyByStringCode(obj.projectCurrency) }</strong></p>` : `<p>You will not be charged for this project.</p>`
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
		                <div id="client-name-row">&nbsp;</div>
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
                    <p>
                        We would like to inform you that project <strong>${ obj.projectId } - ${ obj.projectName }</strong> has been cancelled in the middle of the work.
                    </p>
                    <p>
                        Reason: <strong>${ obj.reason }</strong>.
                    </p>
                    <p>
                        ${ isPayRow }
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`

}

//MM Not used
// function tasksCancelledMessage(obj) {
// 	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
//                 <header style="background-color:#66563E;text-align:center;" >
//                     <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
//                 </header>
//                 <div class="main" style="padding-top:40px;padding-bottom:40px;padding-right:40px;padding-left:40px;" >
//                     <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
//                         This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
//                     <h4 class="contact-name">Dear ${ obj.contact.firstName } ${ obj.contact.surname }</h4>
//                     <p>
//                         The task <strong>${ obj.taskId }</strong> from your project <strong>${ obj.projectId } - ${ obj.projectName }</strong> has been cancelled.
//                     </p>
//                 </div>
//                 <footer>
//                     <hr size="15" color="#66563E">
//                     <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
//                 </footer>
//             </div>`;
// }

function listOfPaymentTasks(obj, taskList, steps) {
	let tableBody = ""
	for (let task of taskList) {
		const taskSteps = steps.filter(item => item.taskId === task.taskId)
		const porgress = getTaskProgress(task, taskSteps)
		tableBody += `<tr>
                        <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">${ task.taskId }</td>
                        <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">${ porgress }%</td>
                        <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">${ task.finance.Price.halfReceivables } ${ returnIconCurrencyByStringCode(obj.projectCurrency) }</td>
                    </tr>`
	}
	return tableBody
}

function listOfTasks(taskList) {
	let list = ""
	for (let task of taskList) {
		list += `<li>${ task.taskId }</li>`
	}
	return list
}

function tasksMiddleCancelledMessage(obj) {
	const paymentTasks = listOfPaymentTasks(obj, obj.tasks, obj.project.steps)
	const listTasks = listOfTasks(obj.tasks)
	const isPayHead = obj.isPay ? `<p>The following tasks have been completed partially and payment will be as following</p>` : `<p>You will not be charged for the following tasks:</p>`
	let isPayRow
	if (obj.isPay) {
		isPayRow = `<table style="width:100%;color:#66563E;border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">Task ID</th>
                    <th style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">Completion</th>
                    <th style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;font-weight:600;">Cost</th>
                </tr>
            </thead>
            <tbody>
                ${ paymentTasks }
            </tbody>
        </table>`
	} else {
		isPayRow = `<ul>${ listTasks }</ul>`
	}
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                    This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
                    <div id="client-name-row"></div>
                    <p>
                        We would like to information that task(s) from project <strong>${ obj.project.projectId } - ${ obj.project.projectName }</strong> has been cancelled in the middle of the work.
                    </p>
                    <p>
                        Reason: <strong>${ obj.reason }</strong>.
                    </p>
                    ${ isPayHead }
                    ${ isPayRow }
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

//When Project Ready to Delivery
function projectDeliveryMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:rgb(129, 129, 129);font-family:'Roboto', sans-serif;color:#66563E;box-sizing:border-box;" >
                <header style="background-color:#66563E;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin-top:20px;margin-bottom:20px;margin-right:0;margin-left:0;" >
                </header>
                <div class="main" style="padding-top:40px;padding-right:40px;padding-left:40px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
                    <div id="client-name-row"></div>
                    <p style="font-weight: 400;">
                        I'm pleased to inform you that project: <strong>${ obj.projectId } - ${ obj.projectName }</strong>, has been completed and is ready
                        for review.
                    </p>
                    <p style="font-weight: 400;">
                        The files are available for you in our
                        <a href="${ apiUrl }/dashboard/details/${ obj.id }">Portal</a>
                        and attached to this email in a zip format.
                    </p>
                    <p style="font-weight: 400;">
                        In case of any questions, please do not hesitate to contact us
                    </p>
                </div>
                <footer>
                    <hr size="15" color="#66563E">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#66563E;" >www.pangea.global</a>
                </footer>
            </div>`
}

function getTaskProgress(task, steps) {
	if (task.hasOwnProperty('metrcis')) {
		return steps.reduce((init, cur) => {
			return init + (cur.progress.wordsDone / cur.progress.totalWordCount) * 100 / steps.length
		}, 0).toFixed(2)
	}
	return Math.round(steps.reduce((init, cur) => {
		return init + cur.progress / steps.length
	}, 0))
}

module.exports = {
	messageForClientSendQuote,
	emailMessageForContact,
	taskReadyMessage,
	taskDeliveryMessage,
	projectCancelledMessage,
	tasksMiddleCancelledMessage,
	projectDeliveryMessage,
	projectMiddleCancelledMessage,
	getPdfOfQuote,
	messageForClientSendCostQuote
}

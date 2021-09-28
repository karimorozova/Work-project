const moment = require("moment")
const { getUniqueLanguagePairsByTasks, getUniqueServicesBySteps } = require('../helpers/commonFunctions')
const { returnIconCurrencyByStringCode } = require('../helpers/commonFunctions')

function returnAdditionalInformationFUllQuote(obj) {
	const activeTasks = obj.tasks.filter(item => item.status !== "Cancelled")
	const activeSteps = obj.steps.filter(step => activeTasks.map(({ taskId }) => taskId).includes(step.taskId))
	const { minimumCharge: { value, toIgnore } } = obj
	let total = activeTasks.reduce((acc, curr) => acc + curr.finance.Price.receivables, 0)
	total = !toIgnore ? (value > total ? value : total.toFixed(2)) : total.toFixed(2)
	const languagesPairs = getUniqueLanguagePairsByTasks(activeTasks)
	const servicesList = getUniqueServicesBySteps(activeSteps)
	return {
		total,
		languagesPairs,
		servicesList
	}
}

function generateTemplateForDefaultMessage(msg) {
	return `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<div class="card" style="color: #66563E; font-family:'Roboto'; width: 600px;margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <p class="bold" style="font-weight: bold;">
            ${ msg }
        </p>
    </div>
</div>`
}

function generateTemplateForAcceptQuote(obj, link) {
	const { total, languagesPairs, servicesList } = returnAdditionalInformationFUllQuote(obj)

	return `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<div class="card" style="color: #66563E; font-family:'Roboto'; width: 600px;margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <div class="card-name" style="font-size: 20px;font-weight: bold;">
            Decide on a Quote
        </div>
        <p class="bold" style="font-weight: bold;">
            Quote Details:
        </p>
        <div style="overflow-x:auto; ">
            <table class="details__table" style="color:#66563E;font-size: 14px; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Name:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectName }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ID:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectId }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Industry:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.industry.name }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Services:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ servicesList } </td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Language-pair(s):</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ languagesPairs }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Estimated delivery date:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ moment(obj.deadline).format('LLL') }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Amount:</td>
                    <td style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
                </tr>
            </table>
        </div>
        <p>
            Heads up! The action cannot be undone.
        </p>
        <div class="btn-row" style="display: flex;justify-content: center;">
            <a href="${ link }" class="no_underline" style="text-decoration: none;"><div class="button" style="text-align: center;line-height: 32px;width: 165px;height: 32px;border-radius: 4px;font-size: 16px;color: #fff;background-color: #D15F45;outline: none;border: none;transition: .1s ease;box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);margin-right: 20px;">Accept</div></a>
            <a href="" class="no_underline" style="text-decoration: none;"><div class="button" style="text-align: center;line-height: 32px;width: 165px;height: 32px;border-radius: 4px;font-size: 16px;color: #fff;background-color: #D15F45;outline: none;border: none;transition: .1s ease;box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);margin-right: 20px;">Cancel</div></a>
        </div>
    </div>
</div>`
}

function generateTemplateForRejectQuote(obj, link) {
	const { total, languagesPairs, servicesList } = returnAdditionalInformationFUllQuote(obj)

	return `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<div class="card" style="color: #66563E; font-family:'Roboto'; width: 600px;margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <div class="card-name" style="font-size: 20px;font-weight: bold;">
            Decide on a Quote
        </div>
        <p class="bold" style="font-weight: bold;">
            Quote Details:
        </p>
        <div style="overflow-x:auto; ">
            <table class="details__table" style="color:#66563E;font-size: 14px; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Name:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectName }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ID:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectId }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Industry:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.industry.name }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Services:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ servicesList } </td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Language-pair(s):</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ languagesPairs }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Estimated delivery date:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ moment(obj.deadline).format('LLL') }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Amount:</td>
                    <td style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
                </tr>
            </table>
        </div>
        <p>
            Heads up! The action cannot be undone.
        </p>
        <div class="btn-row" style="display: flex;justify-content: center;">
            <a href="${ link }" class="no_underline" style="text-decoration: none;"><div class="button" style="text-align: center;line-height: 32px;width: 165px;height: 32px;border-radius: 4px;font-size: 16px;color: #fff;background-color: #D15F45;outline: none;border: none;transition: .1s ease;box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);margin-right: 20px;">Reject</div></a>
            <a href="" class="no_underline" style="text-decoration: none;"><div class="button" style="text-align: center;line-height: 32px;width: 165px;height: 32px;border-radius: 4px;font-size: 16px;color: #fff;background-color: #D15F45;outline: none;border: none;transition: .1s ease;box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);margin-right: 20px;">Cancel</div></a>
        </div>
    </div>
</div>`
}

function generateTemplateForAlertAcceptQuote(obj) {
	const { total, languagesPairs, servicesList } = returnAdditionalInformationFUllQuote(obj)
	const linkPortal = `<div style="margin-top: 15px; font-weight: bold"><a href="https://portal.pangea.global/dashboard/details/${ obj._id }" style="color: #4BA5A5;">Enter the project page for more information</a></div>`
	return `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<div class="card" style="color: #66563E; font-family:'Roboto'; width: 600px;margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <p class="bold" style="font-weight: bold;">
            Quote Details:
        </p>
        <div style="overflow-x:auto; ">
            <table class="details__table" style="color:#66563E;font-size: 14px; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Name:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectName }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ID:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectId }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Industry:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.industry.name }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Services:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ servicesList } </td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Language-pair(s):</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ languagesPairs }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Estimated delivery date:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ moment(obj.deadline).format('LLL') }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Amount:</td>
                    <td style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
                </tr>
            </table>
        </div>
        ${ linkPortal }
				<p style="display: flex; align-items: center;">
				<img src="../static/success.png" alt="">
					<span style="font-size: 20px; margin-left: 10px; font-weight: bold;">The quote has been accepted</span>
				</p>
    </div>
</div>`
}

function generateTemplateForAlertRejectQuote(obj) {
	const { total, languagesPairs, servicesList } = returnAdditionalInformationFUllQuote(obj)

	return `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<div class="card" style="color: #66563E;width: 600px; font-family:'Roboto'; margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <p class="bold" style="font-weight: bold;">
            Quote Details:
        </p>
        <div style="overflow-x:auto; ">
            <table class="details__table" style="color:#66563E;font-size: 14px; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Name:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectName }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ID:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectId }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Industry:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.industry.name }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Services:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ servicesList } </td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Language-pair(s):</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ languagesPairs }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Estimated delivery date:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ moment(obj.deadline).format('LLL') }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Amount:</td>
                    <td style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
                </tr>
            </table>
        </div>
				<p style="display: flex; align-items: center;">
					<img src="../static/failure.png" alt="" >
					<span style="font-size: 20px; margin-left: 10px; font-weight: bold;">The quote has been rejected</span>
				</p>
    </div>
</div>`
}

function returnAdditionalInformationTasksQuote(obj, currTasks) {
	const activeTasks = obj.tasks.filter(item => currTasks.includes(item.taskId))
	const activeSteps = obj.steps.filter(step => activeTasks.map(({ taskId }) => taskId).includes(step.taskId))
	const { minimumCharge: { value, toIgnore } } = obj
	let total = activeTasks.reduce((acc, curr) => acc + curr.finance.Price.receivables, 0)
	total = !toIgnore ? (value > total ? value : total.toFixed(2)) : total.toFixed(2)
	const languagesPairs = getUniqueLanguagePairsByTasks(activeTasks)
	const servicesList = getUniqueServicesBySteps(activeSteps)
	return {
		total,
		languagesPairs,
		servicesList
	}
}

function generateTemplateForTasksAcceptOrRejectQuote(obj, tasks, prop, link) {
	const { total, languagesPairs, servicesList } = returnAdditionalInformationTasksQuote(obj, tasks)
	const btnName = prop === 'Approved' ? 'Accept' : 'Reject'
	return `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<div class="card" style="color: #66563E; font-family:'Roboto'; width: 600px;margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <div class="card-name" style="font-size: 20px;font-weight: bold;">
            Decide on a Quote
        </div>
        <p class="bold" style="font-weight: bold;">
            Quote Details:
        </p>
        <div style="overflow-x:auto; ">
            <table class="details__table" style="color:#66563E;font-size: 14px; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Name:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectName }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ID:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectId }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Industry:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.industry.name }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Services:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ servicesList } </td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Language-pair(s):</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ languagesPairs }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Estimated delivery date:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ moment(obj.deadline).format('LLL') }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Amount:</td>
                    <td style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
                </tr>
            </table>
        </div>
        <p>
            Heads up! The action cannot be undone.
        </p>
        <div class="btn-row" style="display: flex;justify-content: center;">
            <a href="${ link }" class="no_underline" style="text-decoration: none;"><div class="button" style="text-align: center;line-height: 32px;width: 165px;height: 32px;border-radius: 4px;font-size: 16px;color: #fff;background-color: #D15F45;outline: none;border: none;transition: .1s ease;box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);margin-right: 20px;">${ btnName }</div></a>
            <a href="" class="no_underline" style="text-decoration: none;"><div class="button" style="text-align: center;line-height: 32px;width: 165px;height: 32px;border-radius: 4px;font-size: 16px;color: #fff;background-color: #D15F45;outline: none;border: none;transition: .1s ease;box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);margin-right: 20px;">Cancel</div></a>
        </div>
    </div>
</div>`
}

function generateTemplateForAlertForTasksAcceptOrRejectQuote(obj, tasks, prop) {
	const { total, languagesPairs, servicesList } = returnAdditionalInformationTasksQuote(obj, tasks)
	const linkToPortal = prop === 'Approved' ?
			`<div style="margin-top: 15px; font-weight: bold"><a href="https://portal.pangea.global/dashboard/details/${ obj._id }" style="color: #4BA5A5;">Enter the project page for more information</a></div>` :
			`<span></span>`
	const alert = prop === 'Approved' ?
			`<p style="display: flex; align-items: center;">
					<img src="../static/success.png" alt="" >
					<span style="font-size: 20px; margin-left: 10px; font-weight: bold;">The quote has been accepted</span>
				</p>` :
			`<p style="display: flex; align-items: center;">
					<img src="../static/failure.png" alt="" >
					<span style="font-size: 20px; margin-left: 10px; font-weight: bold;">The quote has been rejected</span>
				</p>`
	return `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<div class="card" style="color: #66563E;width: 600px; font-family:'Roboto'; margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <p class="bold" style="font-weight: bold;">
            Quote Details:
        </p>
        <div style="overflow-x:auto; ">
            <table class="details__table" style="color:#66563E;font-size: 14px; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Name:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectName }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ID:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectId }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Industry:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.industry.name }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Services:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ servicesList } </td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Language-pair(s):</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ languagesPairs }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Estimated delivery date:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ moment(obj.deadline).format('LLL') }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Amount:</td>
                    <td style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ${ returnIconCurrencyByStringCode(obj.projectCurrency) } ${ total }</td>
                </tr>
            </table>
        </div>
        ${ linkToPortal }
        ${ alert }
    </div>
</div>`

}

function generateTemplateForTasksAcceptOrRejectVendor(obj, step, prop, link) {
	const currentStep = obj.steps.find(({ stepId }) => stepId === step)
	let title = prop === 'accept' ? 'Approve ' : 'Reject '
	title = title + 'your purchase order'
	const description = prop === 'accept' ? `<p>Once you accept the PO, you are committed to the task. Should you need to make a change, kindly approach the Project Manager.</p>` : '<p></p>'

	const btnName = prop === 'accept' ? 'Accept' : 'Reject'
	return `
		<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
		<div class="card" style="color: #66563E; font-family:'Roboto'; width: 600px;margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <div class="card-name" style="font-size: 20px;font-weight: bold;">
            ${ title }
        </div>
        <p class="bold" style="font-weight: bold;">
            PO Details:
        </p>
        <div style="overflow-x:auto; ">
            <table class="details__table" style="color:#66563E;font-size: 14px; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Name:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectName }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ID:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectId }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Industry:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.industry.name }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Service:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ currentStep.serviceStep.title } </td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Language-pair:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ currentStep.sourceLanguage } >> ${ currentStep.targetLanguage }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;paddcing-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Deadline:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ moment(currentStep.deadline).format('LLL') }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Payable:</td>
                    <td style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                      ${ returnIconCurrencyByStringCode('EUR') } ${ (currentStep.nativeFinance.Price.payables).toFixed(2) }</td>
                </tr>
            </table>
        </div>
	     	${ description }
        <div class="btn-row" style="display: flex;justify-content: center;">
            <a href="${ link }" class="no_underline" style="text-decoration: none;"><div class="button" style="text-align: center;line-height: 32px;width: 165px;height: 32px;border-radius: 4px;font-size: 16px;color: #fff;background-color: #D15F45;outline: none;border: none;transition: .1s ease;box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);margin-right: 20px;">${ btnName }</div></a>
            <a href="" class="no_underline" style="text-decoration: none;"><div class="button" style="text-align: center;line-height: 32px;width: 165px;height: 32px;border-radius: 4px;font-size: 16px;color: #fff;background-color: #D15F45;outline: none;border: none;transition: .1s ease;box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);margin-right: 20px;">Cancel</div></a>
        </div>
    </div>
</div>`
}

function generateTemplateForAlertTasksAcceptOrRejectVendor(obj, step, prop) {
	const currentStep = obj.steps.find(({ stepId }) => stepId === step)
	const alert = prop === 'accept' ?
			`<p style="display: flex; align-items: center;">
					<img src="../static/success.png" alt="" >
					<span style="font-size: 20px; margin-left: 10px; font-weight: bold;">The quote has been accepted</span>
				</p>` :
			`<p style="display: flex; align-items: center;">
					<img src="../static/failure.png" alt="" >
					<span style="font-size: 20px; margin-left: 10px; font-weight: bold;">The quote has been rejected</span>
				</p>`
	const linkToPortal = prop === 'accept' ?
			`<div style="margin-top: 15px; font-weight: bold"><a href="https://vendor.pangea.global/dashboard/project-details/${ obj._id }/${ currentStep._id }" style="color: #4BA5A5;">Enter the step page for more information</a></div>` :
			`<span></span>`
	return `
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<div class="card" style="color: #66563E; font-family:'Roboto'; width: 600px;margin: 0 auto;margin-top: 50px;margin-bottom: 50px;-webkit-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);-moz-box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);font-size: 16px;">
    <div class="card-header" style="padding: 20px;background: #66563E;text-align: center;">
        <img src="../static/email-logo.png" alt="">
    </div>
    <div class="card-body" style="background: #fff;padding: 20px;">
        <p class="bold" style="font-weight: bold;">
            PO Details:
        </p>
        <div style="overflow-x:auto; ">
            <table class="details__table" style="color:#66563E;font-size: 14px; width: 100%; border-width:1px;border-style:solid;border-color:#66563E;border-collapse:collapse;">
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Name:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectName }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ID:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.projectId }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Industry:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ obj.industry.name }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Service:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ currentStep.serviceStep.title } </td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Language-pair:</td>
                    <td style="border:none;background: #F4F0EE; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ currentStep.sourceLanguage } >> ${ currentStep.targetLanguage }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; padding-top:5px;padding-bottom:5px;paddcing-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Deadline:</td>
                    <td style="border:none; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;">
                        ${ moment(currentStep.deadline).format('LLL') }</td>
                </tr>
                <tr>
                    <td class="main_weight600" style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        Payable:</td>
                    <td style="border:none; background: #66563E; color: white; padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;min-width:200px;font-weight:600;">
                        ${ returnIconCurrencyByStringCode('EUR') } ${ (currentStep.nativeFinance.Price.payables).toFixed(2) }</td>
                </tr>
            </table>
        </div>
        ${ linkToPortal }
				${ alert }
    </div>
</div>`
}

module.exports = {
	generateTemplateForAcceptQuote,
	generateTemplateForRejectQuote,
	generateTemplateForAlertAcceptQuote,
	generateTemplateForAlertRejectQuote,
	generateTemplateForDefaultMessage,
	generateTemplateForTasksAcceptOrRejectQuote,
	generateTemplateForAlertForTasksAcceptOrRejectQuote,
	generateTemplateForTasksAcceptOrRejectVendor,
	generateTemplateForAlertTasksAcceptOrRejectVendor
}

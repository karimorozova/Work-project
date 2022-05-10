let apiUrl = process.env.ADMIN_URL
let apiUrlClient = process.env.PORTAL_URL
const jwt = require('jsonwebtoken')
const { secretKey } = require('../configs')
const { Projects, Units } = require('../models')
const { returnIconCurrencyByStringCode } = require('../helpers/commonFunctions')

const {
	getFinanceDetailsTMDiscounts,
	getFinanceDetailsDiscounts,
	getStepsTotal,
	getStepsSubTotal,
	getProjectDetails,
	getJobsDetails
} = require('./buildersQuote')
const moment = require("moment")
const { getInvoiceFinance } = require("../invoicing/helpers")

async function messageForClientSendQuote(project, tasksIds, allUnits, allSettingsSteps) {
	const date = Date.now()
	const token = jwt.sign({ id: project._id }, secretKey, { expiresIn: '21d' })
	let { accountManager, tasks, steps, finance, discounts, projectCurrency, additionsSteps } = project
	steps = steps.filter(item => item.status !== "Cancelled" && item.isReceivableVisible)
	const subTotal = getStepsSubTotal(tasksIds, steps, allUnits)
	const TMDiscount = +(getStepsSubTotal(tasksIds, steps, allUnits) - getStepsTotal(tasksIds, steps, allUnits)).toFixed(2)
	const isHideWhenMinimumCharge = project.minimumCharge.isUsed
	let totalForAdditions = 0
	if (additionsSteps.length && !tasksIds.length) {
		for (let curStep of additionsSteps) {
			totalForAdditions += +curStep.finance.Price.receivables
		}
	}
	let total = isHideWhenMinimumCharge ? project.minimumCharge.value + totalForAdditions : finance.Price.receivables + totalForAdditions
	total = tasksIds.length ? steps.filter(i => tasksIds.includes(i.taskId)).reduce((a, c) => a + c.finance.Price.receivables, 0).toFixed(2) : total


	const displaySubTotal = discounts.length || TMDiscount > 0.05
			? `<p style="padding: 5px 0; font-size: 14px; font-weight: 600;"> <span> Sub-total: ${ +(subTotal + totalForAdditions).toFixed(2) } ${ returnIconCurrencyByStringCode(project.projectCurrency) }</span> </p>`
			: ''

	const displayFinanceDetails = discounts.length || TMDiscount > 0.05
			? `<div class="block" style="border: 1px solid #bfbfbf; width: max-content;">
						${ getFinanceDetailsTMDiscounts(project, TMDiscount) }
						${ getFinanceDetailsDiscounts(project, subTotal - TMDiscount) }
				</div>`
			: ''

	let acceptHref = `${ apiUrl }/quote-decision?projectId=${ project._id }&from=${ date }&t=${ token }&prop=accept&type=client`
	let declineHref = `${ apiUrl }/quote-decision?projectId=${ project._id }&from=${ date }&t=${ token }&prop=reject&type=client`

	if (tasksIds.length) {
		const tasks = tasksIds.join('*').replace(/[' ']/g, '_')
		acceptHref += `&tasksIds=${ tasks }`
		declineHref += `&tasksIds=${ tasks }`
	}

	let acceptQuote = `<a href="${ acceptHref }" style="background: #4ba5a5;color: #fff;padding: 6px 20px;text-decoration: none;border-radius: 2px;cursor: pointer;margin: 3px 10px 10px 0;display: inline-block;">I accept ${ +parseFloat(total).toFixed(2) } ${ returnIconCurrencyByStringCode(projectCurrency) }</a>`
	let declineQuote = `<a href="${ declineHref }" style="background: #d66f58;color: #fff;padding: 6px 20px;text-decoration: none;border-radius: 2px;cursor: pointer;margin: 3px 10px 10px 0;display: inline-block;">I reject ${ +parseFloat(total).toFixed(2) } ${ returnIconCurrencyByStringCode(projectCurrency) }</a>`

	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding: 25px;" >
										<div id="client-name-row"></div>
										<p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">
                        ***This is an automated message***<br>
                        This message is sent to you on behalf of ${ accountManager.firstName } ${ accountManager.lastName }
                    </p>
                    <p>
                    	Please see below the quote details:
										</p>
                    ${ getProjectDetails(project) }
                    ${ getJobsDetails(project, tasksIds, steps, allUnits) }
										${ isHideWhenMinimumCharge ? '' : displaySubTotal }
										${ isHideWhenMinimumCharge ? '' : displayFinanceDetails }
										<p style="padding: 5px 0; font-size: 14px; font-weight: 600;"> Total: ${ +parseFloat(total).toFixed(2) } ${ returnIconCurrencyByStringCode(projectCurrency) }</p>
										 <p>By clicking on one of the link below, you can accept or reject our offer.
										 <br>Clicking "I accept" will also approve and accept our <a style="color:#333;" href="https://www.pangea.global/wp-content/uploads/2019/11/Pangea-Terms-Conditions.pdf" class="link">terms and conditions</a>
                    </p>
                    <p>You can accept the quote by clicking the link below: <br>
                    <span> ${ acceptQuote }</span>
                    <span> ${ declineQuote }</span>
                    </p>
                    <p><span>Please note:</span><br>
                    <span style="font-weight: bold;">The quote does not include VAT</span><br>
                    In case of any questions, please do not hesitate to contact us :-)</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}


function getPdfOfQuote(project, tasksIds, allUnits, allSettingsSteps) {
	let { steps, finance, discounts, projectCurrency, projectId, clientBillingInfo, additionsSteps } = project

	steps = steps.filter(item => item.status !== "Cancelled" && item.isReceivableVisible)
	const subTotal = getStepsSubTotal(tasksIds, steps, allUnits)
	const TMDiscount = +(getStepsSubTotal(tasksIds, steps, allUnits) - getStepsTotal(tasksIds, steps, allUnits)).toFixed(2)
	const isHideWhenMinimumCharge = project.minimumCharge.isUsed
	let totalForAdditions = 0
	if (additionsSteps.length && !tasksIds.length) {
		for (let curStep of additionsSteps) {
			totalForAdditions += +curStep.finance.Price.receivables
		}
	}
	let total = isHideWhenMinimumCharge ? project.minimumCharge.value + totalForAdditions : finance.Price.receivables + totalForAdditions
	total = tasksIds.length ? steps.filter(i => tasksIds.includes(i.taskId)).reduce((a, c) => a + c.finance.Price.receivables, 0).toFixed(2) : total


	const displaySubTotal = discounts.length || TMDiscount > 0.05
			? `<div style="text-align: right; padding: 22px 0; font-size: 14px; font-weight: 600;">
			<div style="display: inline-block; min-width: 110px; text-align: left;">Sub-total:</div>
			<div style="display: inline-block; min-width: 150px;">${ returnIconCurrencyByStringCode(project.projectCurrency) } ${ +(subTotal + totalForAdditions).toFixed(2) }</div>
			</div>`
			: ''

	const displayFinanceDetails = discounts.length || TMDiscount > 0.05
			? `<div class="block" style="border: 1px solid #bfbfbf; width: max-content;">
					${ getFinanceDetailsTMDiscounts(project, TMDiscount) }
					${ getFinanceDetailsDiscounts(project, subTotal - TMDiscount) }
			</div>`
			: ''

	return `
	<div class="pdf" style="width: 814px; font-size: 13px; font-family: Tahoma, sans-serif; color: #333;padding: 30px;position: relative;">
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
					<div class="header__details--title" style="font-size: 26px;margin-bottom: 5px;">Quote</div>
					<div class="header__details--stepId" style="font-size: 14px;">${ projectId }</div>
				</div>
			</div>
			<div class="body" style="margin: 50px 0; width: 754px;">
				<div class="body__to" style="font-size: 16px;margin-bottom: 15px;">To: </div>
				<div class="body__vendor" style="font-size: 22px;font-weight: 600;margin-bottom: 15px;">${ clientBillingInfo?.officialName || project.customer?.name || '' }</div>
				<div class="body__address" style="margin-bottom: 50px;">
								${ clientBillingInfo?.address?.street1 || clientBillingInfo?.address?.street2 || '' }, ${ clientBillingInfo?.address?.city || '' }, ${ clientBillingInfo?.address?.country || '' }
						</div>
				<div class="body__line" style="background-color: #b5dbdb; height: 1px;"></div>
			</div>
			<div class="details" style="width: 754px; margin-bottom: 90px;">
				${ getProjectDetails(project) }
				${ getJobsDetails(project, tasksIds, steps, allUnits) }
				${ isHideWhenMinimumCharge ? '' : displaySubTotal }
				${ isHideWhenMinimumCharge ? '' : displayFinanceDetails }
		
			<div style="text-align: right; padding: 22px 0; font-size: 14px; font-weight: 600;">
						<div style="display: inline-block; min-width: 110px; text-align: left;">Total:</div>
						<div style="display: inline-block; min-width: 150px;">${ returnIconCurrencyByStringCode(projectCurrency) } ${ +parseFloat(total).toFixed(2) } </div>
			</div>
			</div>
			<div class="footer" style="position: absolute; width: 754px; border-top: 3px solid #c8e4e4;bottom: 0;padding: 15px 0 12px;">
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

async function messageForClientSendCostQuote(project, allUnits, allSettingsSteps) {
	const tasksIds = []
	let { accountManager, tasks, steps, finance, discounts, projectCurrency, additionsSteps } = project
	steps = steps.filter(item => item.status !== "Cancelled" && item.isReceivableVisible)
	const subTotal = getStepsSubTotal(tasksIds, steps, allUnits)
	const TMDiscount = +(getStepsSubTotal(tasksIds, steps, allUnits) - getStepsTotal(tasksIds, steps, allUnits)).toFixed(2)
	let totalForAdditions = 0
	if (additionsSteps.length && !tasksIds.length) {
		for (let curStep of additionsSteps) {
			totalForAdditions += +curStep.finance.Price.receivables
		}
	}
	const isHideWhenMinimumCharge = project.minimumCharge.isUsed
	let total = isHideWhenMinimumCharge ? project.minimumCharge.value + totalForAdditions : finance.Price.receivables + totalForAdditions

	const displaySubTotal = discounts.length || TMDiscount > 0.05
			? `<p style="padding: 5px 0; font-size: 14px; font-weight: 600;"> Sub-total: ${ +(subTotal + +totalForAdditions).toFixed(2) } ${ returnIconCurrencyByStringCode(project.projectCurrency) }</p>`
			: ''

	const displayFinanceDetails = discounts.length || TMDiscount > 0.05
			? `<div class="block" style="border: 1px solid #bfbfbf; width: max-content;">
						${ getFinanceDetailsTMDiscounts(project, TMDiscount) }
						${ getFinanceDetailsDiscounts(project, subTotal - TMDiscount) }
				</div>`
			: ''

	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding: 25px;" >
										<div id="client-name-row"></div>
										<p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">
                        ***This is an automated message***<br>
                        This message is sent to you on behalf of ${ accountManager.firstName } ${ accountManager.lastName }
                    </p>
                    <p>
                    	Please see below the quote details:
										</p>
                    ${ getProjectDetails(project) }
                    ${ getJobsDetails(project, tasksIds, steps, allUnits) }
										${ isHideWhenMinimumCharge ? '' : displaySubTotal }
										${ isHideWhenMinimumCharge ? '' : displayFinanceDetails }
										<p style="padding: 5px 0; font-size: 14px; font-weight: 600;"> Total: ${ +parseFloat(total).toFixed(2) } ${ returnIconCurrencyByStringCode(projectCurrency) }</p>
										
										<p>This is a Cost Quote and provides only estimation.</p>
										<p>Should anything change in the files or instructions, so will the deadline and charges.</p>
										<p><span style="font-weight: bold;">The quote does not include VAT</span></p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

// Return template for Task for Delivery
function getDeliveryMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                    <header style="background-color:#efefef;text-align:center;" >
                        <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                    </header>
                    <div class="main" style="padding:25px;" >
                        <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                            This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
                        <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.contact.firstName } ${ obj.contact.surname || "" }</span></p>
                        <p style="font-weight: 400;">
                        	I'm pleased to inform you that delivery: <strong> ${ obj.projectId } - ${ obj.deliveryName } </strong> is completed and is ready for review:
                        </p>
                        <div style="font-weight: 400;">
                        	${ obj.comment }
												</div>
												<ul>
													<li>
														<span style="font-weight: 400;"> language pair:</span>
														<strong>${ obj.languagesAndServices.languages.join(', ') }</strong>
													</li>
												</ul>
			                    <p style="font-weight: 400;">
			                        The files are available for you in our <a href="${ apiUrlClient }/dashboard/details/${ obj.id }">Portal</a> and attached to this email in a zip format.
		                    	</p>
                        <p style="font-weight: 400;">
                            In case of any questions, please do not hesitate to contact us :-)
                        </p>
                    </div>
                    <footer>
                        <hr size="10" style="border:none;" color="#efefef">
                        <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                    </footer>
                </div>`
}

function getNotifyDeliveryMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                    <header style="background-color:#efefef;text-align:center;" >
                        <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                    </header>
                    <div class="main" style="padding:25px;" >
                        <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                            This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
                        <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.contact.firstName } ${ obj.contact.surname || "" }</span></p>
                        <p style="font-weight: 400;">
													I'm pleased to inform you that delivery: <strong> ${ obj.projectId } - ${ obj.deliveryName } </strong> is completed:
                        </p>
												<ul>
													<li>
														<span style="font-weight: 400;"> language pair:</span>
														<strong>${ obj.languagesAndServices.languages.join(', ') }</strong>
													</li>
												</ul>
		                    <p style="font-weight: 400;">
		                        The files are available for you in our <a href="${ apiUrlClient }/dashboard/details/${ obj.id }">Portal</a> and attached to this email in a zip format.
	                      </p>
                        <p style="font-weight: 400;">
                            In case of any questions, please do not hesitate to contact us :-)
                        </p>
                    </div>
                    <footer>
                        <hr size="10" style="border:none;" color="#efefef">
                        <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                    </footer>
                </div>`
}

function projectCancelledMessage(obj) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
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
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

function projectMiddleCancelledMessage(obj) {
	const isPayRow = obj.isPay ? `<p>You will need to pay a partial amount of <strong>${ obj.finance.Price.receivables } ${ returnIconCurrencyByStringCode(obj.projectCurrency) }</strong></p>` : `<p>You will not be charged for this project.</p>`
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
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
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`

}

function listOfPaymentTasks(obj, taskList, steps) {
	let tableBody = ""
	for (let task of taskList) {
		const taskSteps = steps.filter(item => item.taskId === task.taskId)
		const progress = getTaskProgress(task, taskSteps)
		tableBody += `<tr>
                        <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">${ task.taskId }</td>
                        <td style="border-width:1px;border-style:solid;border-color:#66563E;padding-top:5px;padding-bottom:5px;padding-right:5px;padding-left:5px;">${ progress }%</td>
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
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
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
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

//When Project Ready to Delivery
function projectDeliveryMessage(obj) {
	//DELIVER PROJECT CHANGE TEMPLATE #MAX
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;" >
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-right:0;margin-left:0;line-height:1.5;" >***This is an automated message***<br>
                        This message is sent to you on behalf of ${ obj.accManager.firstName } ${ obj.accManager.lastName }</p>
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ obj.contact.firstName } ${ obj.contact.surname || "" }</span></p>
                    <p style="font-weight: 400;">
                    		I'm pleased to inform you the following languages tasks from  project: ${ obj.projectId } - ${ obj.projectName } have been completed and is ready for review.
                    </p>
                    <p style="font-weight: 400;">
                        The files are available for you in our
                        <a href="${ apiUrlClient }/dashboard/details/${ obj.id }">Portal</a>
                        and attached to this email in a zip format.
                    </p>
                     <div style="font-weight: 400;">
                        	${ obj.comment }
											</div>
                    <p style="font-weight: 400;">
                        In case of any questions, please do not hesitate to contact us :-)
                    </p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
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


function invoicingMessage(contact, report, currency) {
	const { externalIntegration, total } = report
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;">
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">***This is an automated message***</p>
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear ${ contact.firstName || '' } ${ contact.surname || '' }</span></p>
                    <p>Invoice <b>${ externalIntegration.reportId || '' }</b> for the sum of: <b>${ total.toFixed(2) } ${ returnIconCurrencyByStringCode(currency) }</b> can be viewed, printed or downloaded as a PDF file from the link below.</p>
                    <p>Kindly add the invoice ID as a reference, when sending the transfer.</p>
                    <p style="background: rgba(245, 198, 83, 0.14);padding: 10px;">***Please make sure that the transfer includes <b>all bank fees</b>, so that the receivables on our side match the amount stated in the invoice.***</p>
                    <p>Click to view your Invoice and choose the payment option</p>
                    <p>We look forward to doing more business with you.</p>
                    <br>
                    <p>Regards,<br>Finance team</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

async function pdfPPPReportTemplate(report, BI) {
	const tasksIds = []
	const { stepsWithProject } = report
	const { projectId } = stepsWithProject[0]
	const { officialName, address: { street1, street2, country, city } } = BI

	const project = await Projects.findOne({ projectId }).populate('industry')
	const allUnits = await Units.find()

	let { steps, finance, discounts, projectCurrency } = project
	steps = steps.filter(item => item.status !== "Cancelled")
	const subTotal = getStepsSubTotal(tasksIds, steps, allUnits)
	const TMDiscount = +(getStepsSubTotal(tasksIds, steps, allUnits) - getStepsTotal(tasksIds, steps, allUnits)).toFixed(2)
	const isHideWhenMinimumCharge = project.minimumCharge.isUsed
	let total = isHideWhenMinimumCharge ? project.minimumCharge.value : finance.Price.receivables
	total = tasksIds.length ? steps.filter(i => tasksIds.includes(i.taskId)).reduce((a, c) => a + c.finance.Price.receivables, 0).toFixed(2) : total

	const displaySubTotal = discounts.length || TMDiscount > 0.05
			? `<p style="padding: 5px 0; font-size: 14px;  text-align: right; font-weight: 600;"> Sub-total: ${ +(subTotal).toFixed(2) } ${ returnIconCurrencyByStringCode(project.projectCurrency) }</p>`
			: ''

	const displaySubTotal2 = project.paymentAdditions.length
			? `<p style="padding: 5px 0; font-size: 14px;  text-align: right; font-weight: 600;"> ${ discounts.length || TMDiscount ? 'Sub-total (II):' : 'Sub-total:' } ${ +(total - project.paymentAdditions.reduce((a, c) => a + c.value, 0)).toFixed(2) } ${ returnIconCurrencyByStringCode(project.projectCurrency) }</p>`
			: ''

	const displayFinanceDetails = discounts.length || TMDiscount > 0.05
			? `<div class="block" style="border: 1px solid #bfbfbf; width: max-content;">
						${ getFinanceDetailsTMDiscounts(project, TMDiscount) }
						${ getFinanceDetailsDiscounts(project, subTotal - TMDiscount) }
				</div>`
			: ''

	return `
	<div class="pdf" style="height: 1054px;width: 814px;font-family: Arial, sans-serif;color: #333;padding: 30px;position: relative;">
			    <div class="header" style="display: -webkit-box;justify-content: space-between;">
			        <div class="header__logo">
		             <svg style="height: 72px; width: 253px;" xmlns="http://www.w3.org/2000/svg" id="Ñëîé_1" data-name="Ñëîé 1" viewBox="0 0 253 72"><defs><style>.cls-1,.cls-6{fill:#66563d;}.cls-1{stroke:#66563d;stroke-miterlimit:10;stroke-width:1.27px;}.cls-2{fill:#f1fafc;}.cls-3{fill:#d66f58;}.cls-3,.cls-4,.cls-5{fill-rule:evenodd;}.cls-3,.cls-4{opacity:0.9;}.cls-4{fill:#f4c040;}.cls-5{fill:#4ba5a5;}.cls-6{font-size:13.87px;font-family:CourierNewPS-BoldMT, Courier New;font-weight:700;}</style></defs><path class="cls-1" d="M87,20.64v4.13a14.82,14.82,0,0,1,4.35-3.7,11.51,11.51,0,0,1,5.48-1.24A12.51,12.51,0,0,1,103,21.4a11,11,0,0,1,4.39,4.36,12,12,0,0,1,1.55,5.87,11.35,11.35,0,0,1-3.5,8.36A12.34,12.34,0,0,1,87,38.52V52.18h5.51a1.73,1.73,0,0,1,1.16.31,1.12,1.12,0,0,1,0,1.63,1.67,1.67,0,0,1-1.16.33H81.65a1.77,1.77,0,0,1-1.16-.31,1,1,0,0,1-.35-.83,1,1,0,0,1,.35-.82,1.71,1.71,0,0,1,1.16-.31h3V22.94h-3a1.66,1.66,0,0,1-1.16-.33,1,1,0,0,1-.35-.83,1,1,0,0,1,.35-.81,1.66,1.66,0,0,1,1.16-.33Zm19.65,11a9.1,9.1,0,0,0-2.84-6.71,10.09,10.09,0,0,0-14,0,9.29,9.29,0,0,0,0,13.41,10.06,10.06,0,0,0,13.93,0A9.08,9.08,0,0,0,106.62,31.63Z"/><path class="cls-1" d="M130.23,44V40.76a16.17,16.17,0,0,1-10.56,4.16,9.16,9.16,0,0,1-6.37-2.07,6.55,6.55,0,0,1-2.3-5.06A7.23,7.23,0,0,1,114,32c2-1.64,5-2.46,8.83-2.46a32.56,32.56,0,0,1,3.4.2c1.22.14,2.55.35,4,.64V26.74a4.07,4.07,0,0,0-1.73-3.24,8.26,8.26,0,0,0-5.18-1.37,26.12,26.12,0,0,0-7.43,1.54,5.13,5.13,0,0,1-1.11.27,1,1,0,0,1-.74-.33,1.09,1.09,0,0,1-.31-.81,1,1,0,0,1,.27-.73,9.13,9.13,0,0,1,3-1.1,26.83,26.83,0,0,1,6.37-1.14,9.79,9.79,0,0,1,6.7,2.12,6.29,6.29,0,0,1,2.4,4.79v15h3a1.76,1.76,0,0,1,1.18.31,1,1,0,0,1,.35.82,1,1,0,0,1-.35.81,1.7,1.7,0,0,1-1.18.32Zm0-11.28a22,22,0,0,0-3.38-.68,32.11,32.11,0,0,0-3.75-.21c-3.29,0-5.87.71-7.72,2.13a4.66,4.66,0,0,0-2.11,3.81,4.4,4.4,0,0,0,1.61,3.45,6.89,6.89,0,0,0,4.68,1.41A12.71,12.71,0,0,0,125,41.47a19.66,19.66,0,0,0,5.2-3.74Z"/><path class="cls-1" d="M146.16,20.64v3.43a16.26,16.26,0,0,1,4.29-3.32,9.92,9.92,0,0,1,4.32-.92,10.12,10.12,0,0,1,4.73,1.11,7.85,7.85,0,0,1,2.74,2.69,6.92,6.92,0,0,1,1.23,3.84V41.76h1.91a1.71,1.71,0,0,1,1.16.31,1,1,0,0,1,.35.82,1,1,0,0,1-.35.81,1.66,1.66,0,0,1-1.16.32h-6.07a1.71,1.71,0,0,1-1.19-.32,1.08,1.08,0,0,1-.35-.81,1,1,0,0,1,.35-.82,1.77,1.77,0,0,1,1.19-.31h1.89V27.85a5.38,5.38,0,0,0-1.76-4.06,6.53,6.53,0,0,0-4.7-1.66,8,8,0,0,0-3.88.9,20.8,20.8,0,0,0-4.7,4.5V41.76h2.56a1.71,1.71,0,0,1,1.16.31,1,1,0,0,1,.36.82,1.06,1.06,0,0,1-.36.81,1.66,1.66,0,0,1-1.16.32h-7.39a1.71,1.71,0,0,1-1.17-.32,1.08,1.08,0,0,1-.35-.81,1,1,0,0,1,.35-.82,1.76,1.76,0,0,1,1.17-.31h2.56V22.94H142a1.67,1.67,0,0,1-1.16-.33,1.08,1.08,0,0,1-.35-.83,1.05,1.05,0,0,1,.35-.81,1.67,1.67,0,0,1,1.16-.33Z"/><path class="cls-1" d="M188.67,24.8V20.64H194a1.66,1.66,0,0,1,1.16.33,1,1,0,0,1,.35.83,1,1,0,0,1-.35.81,1.66,1.66,0,0,1-1.16.33h-3.05V45.59a8.31,8.31,0,0,1-1,4,9,9,0,0,1-2.16,2.46,12.13,12.13,0,0,1-2.75,1.81,8.51,8.51,0,0,1-3.33.54h-6.42a1.77,1.77,0,0,1-1.16-.31,1.16,1.16,0,0,1,0-1.66,1.66,1.66,0,0,1,1.16-.33l6.51,0a6.5,6.5,0,0,0,3.6-1,7.8,7.8,0,0,0,2.66-3,6.17,6.17,0,0,0,.59-2.89V38.46a11.16,11.16,0,0,1-9.39,5A10.89,10.89,0,0,1,171.22,40a11.53,11.53,0,0,1-3.39-8.36,11.46,11.46,0,0,1,3.39-8.34,10.88,10.88,0,0,1,8.06-3.46A11.18,11.18,0,0,1,188.67,24.8Zm0,6.83a9.2,9.2,0,0,0-2.74-6.75,9.13,9.13,0,0,0-13.08,0,9.21,9.21,0,0,0-2.72,6.73,9.23,9.23,0,0,0,2.72,6.76,9.11,9.11,0,0,0,13.08,0A9.21,9.21,0,0,0,188.67,31.63Z"/><path class="cls-1" d="M222.06,32.87H198.94A11,11,0,0,0,202.63,40a11.25,11.25,0,0,0,7.65,2.69,18.33,18.33,0,0,0,5.32-.84,13.83,13.83,0,0,0,4.54-2.21,1.55,1.55,0,0,1,.89-.41,1,1,0,0,1,.76.34,1.13,1.13,0,0,1,.32.8,1.27,1.27,0,0,1-.43.89,12.13,12.13,0,0,1-4.61,2.52,20.17,20.17,0,0,1-6.79,1.18,13.36,13.36,0,0,1-9.73-3.83,12.44,12.44,0,0,1-3.9-9.24,11.37,11.37,0,0,1,3.66-8.48,12.52,12.52,0,0,1,9.06-3.54,12.33,12.33,0,0,1,9.15,3.63A12.69,12.69,0,0,1,222.06,32.87Zm-2.3-2.29a9.85,9.85,0,0,0-3.55-6.1,11.17,11.17,0,0,0-13.67,0A10,10,0,0,0,199,30.58Z"/><path class="cls-1" d="M244.5,44V40.76a16.15,16.15,0,0,1-10.56,4.16,9.16,9.16,0,0,1-6.37-2.07,6.55,6.55,0,0,1-2.3-5.06,7.23,7.23,0,0,1,3-5.75c2-1.64,5-2.46,8.83-2.46a32.4,32.4,0,0,1,3.4.2c1.22.14,2.55.35,4,.64V26.74a4.07,4.07,0,0,0-1.73-3.24,8.26,8.26,0,0,0-5.18-1.37,26.12,26.12,0,0,0-7.43,1.54,5,5,0,0,1-1.11.27,1,1,0,0,1-.74-.33,1.13,1.13,0,0,1-.31-.81,1,1,0,0,1,.27-.73,9.13,9.13,0,0,1,3-1.1,26.83,26.83,0,0,1,6.37-1.14,9.79,9.79,0,0,1,6.7,2.12,6.29,6.29,0,0,1,2.4,4.79v15h3a1.79,1.79,0,0,1,1.19.31,1,1,0,0,1,.35.82,1.08,1.08,0,0,1-.35.81,1.73,1.73,0,0,1-1.19.32Zm0-11.28a21.74,21.74,0,0,0-3.38-.68,32,32,0,0,0-3.75-.21c-3.29,0-5.87.71-7.72,2.13a4.66,4.66,0,0,0-2.11,3.81,4.4,4.4,0,0,0,1.61,3.45,6.89,6.89,0,0,0,4.68,1.41,12.68,12.68,0,0,0,5.47-1.18,19.66,19.66,0,0,0,5.2-3.74Z"/><circle class="cls-2" cx="56.96" cy="27.78" r="8.27"/><circle class="cls-2" cx="20.76" cy="27.78" r="8.27"/><path class="cls-3" d="M71.14,12.74c-.53-.53-1-1-1.57-1.46a20,20,0,0,0-25.22,0,21.56,21.56,0,0,0-1.6,1.46A19.27,19.27,0,0,0,36.86,26.9a19.58,19.58,0,0,0,5,13.3l.09.07.79.81A12.49,12.49,0,0,0,45,43.13l12,11,1.74-1.69c.1-.06,11-9.94,11-9.94a14.93,14.93,0,0,0,1.38-1.38A19.47,19.47,0,0,0,77,26.9,19.31,19.31,0,0,0,71.14,12.74ZM62.77,33.59a7.76,7.76,0,0,1-5.84,2.46A8,8,0,0,1,51,33.59a7.87,7.87,0,0,1-2.36-5.79,8.07,8.07,0,0,1,8.25-8.29,7.9,7.9,0,0,1,5.84,2.36,8.06,8.06,0,0,1,2.46,5.93A7.7,7.7,0,0,1,62.77,33.59Z"/><path class="cls-4" d="M34.94,12.74c-.52-.53-1-1-1.57-1.46A19.26,19.26,0,0,0,20.74,6.8,19.13,19.13,0,0,0,8.15,11.28c-.54.45-1.07.93-1.6,1.46A19.31,19.31,0,0,0,.66,26.9a19.58,19.58,0,0,0,5,13.3l.1.07q.38.4.78.81a12.82,12.82,0,0,0,2.29,2.05l12,11,1.74-1.69c.1-.06,11-9.94,11-9.94a13.79,13.79,0,0,0,1.38-1.38A19.43,19.43,0,0,0,40.83,26.9,19.27,19.27,0,0,0,34.94,12.74ZM26.58,33.59a7.78,7.78,0,0,1-5.84,2.46,8,8,0,0,1-5.89-2.46,7.84,7.84,0,0,1-2.36-5.79,8.07,8.07,0,0,1,8.25-8.29,7.92,7.92,0,0,1,5.84,2.36A8.08,8.08,0,0,1,29,27.8,7.73,7.73,0,0,1,26.58,33.59Z"/><path class="cls-5" d="M55,7.42c-.59-.59-1.18-1.14-1.77-1.64A21.76,21.76,0,0,0,38.92.72a21.6,21.6,0,0,0-14.2,5.06c-.61.5-1.21,1-1.81,1.64a21.83,21.83,0,0,0-6.64,16,22.07,22.07,0,0,0,5.65,15l.11.08c.28.31.58.61.88.92a14.27,14.27,0,0,0,2.59,2.31L39.06,54.09l2-1.91C41.13,52.11,53.39,41,53.39,41A14.33,14.33,0,0,0,55,39.41a22,22,0,0,0,6.65-16A21.8,21.8,0,0,0,55,7.42ZM45.51,31a8.75,8.75,0,0,1-6.59,2.77A9,9,0,0,1,32.28,31a8.89,8.89,0,0,1-2.67-6.54,9.11,9.11,0,0,1,9.31-9.36,9,9,0,0,1,6.59,2.66,9.12,9.12,0,0,1,2.77,6.7A8.72,8.72,0,0,1,45.51,31Z"/><circle class="cls-2" cx="38.9" cy="24.43" r="9.32"/><text class="cls-6" transform="translate(79.96 68.1)">Translation Experts</text></svg>
			        </div>
			        <div class="header__details" style="margin-left: 271px;">
			            <div class="header__details--line"
			                style="height: 24px;background: #48A6A6;width: 320px;margin-right: -30px;margin-bottom: 5px;"></div>
			            <div class="header__details--title" style="font-size: 26px;margin-bottom: 5px;">Task Report</div>
			            <div class="header__details--stepId" style="font-size: 14px;">${ projectId }</div>
			        </div>
			    </div>
			    <div class="body" style="padding: 25px;margin-top: 80px;">
			        <div class="body__to" style="font-size: 16px;margin-bottom: 15px;">To: </div>
			        <div class="body__vendor" style="font-size: 22px;font-weight: 600;margin-bottom: 15px;">${ officialName }</div>
			        <div class="body__address" style="margin-bottom: 50px;">${ street1 || street2 || 'No street' }, ${ city || 'No city' }, ${ country || 'No country' }</div>
			        <div class="body__line" style="background-color: #b5dbdb; height: 1px;"></div>
			    </div>
			    <div class="details" style="padding: 25px;">
              ${ getJobsDetails(project, tasksIds, steps, allUnits) }
							${ isHideWhenMinimumCharge ? '' : displaySubTotal }
							${ isHideWhenMinimumCharge ? '' : displayFinanceDetails }
							${ isHideWhenMinimumCharge || tasksIds.length ? '' : displaySubTotal2 }
							<p style="padding: 5px 0; text-align: right; font-size: 14px; font-weight: 600;"> Total: ${ +(total).toFixed(2) } ${ returnIconCurrencyByStringCode(projectCurrency) }</p>
			    </div>
			</div>`
}

const getPdfInvoice = (invoice) => {
	const state = paymentProfile(invoice).getState() ? `<div className="profile__text">${ paymentProfile(invoice).getState() }</div>` : ''
	const tableDetailsVAT = getInvoiceFinance(invoice).vat
			? `<div class="row" style="height: 30px;">
	          <div class="row__key" style="width: 115px;margin-right: 10px; display: inline-block;">VAT:</div>
	          <div class="row__value" style="width: 150px;display: inline-block;"><span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span><span>${ getInvoiceFinance(invoice).vat }</span></div>
	        </div>`
			: ''
	const tableDetailsDiscount = getInvoiceFinance(invoice).discount
			? `<div class="row" style="height: 30px;">
          <div class="row__key" style="width: 115px;margin-right: 10px; display: inline-block;">Discount:</div>
          <div class="row__value" style="width: 150px;display: inline-block;"><span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span><span>${ getInvoiceFinance(invoice).discount }</span></div>
        </div>`
			: ''
	const tableStart = `<div class="table">
				<table style="font-size: 14px;color: #333;width: 100%;text-align: left;border-collapse: collapse;border-bottom: 1px solid #ededed;border-left: 1px solid #ededed;">
        <tr>
            <th style="padding: 10px 7px;color:#fff;background:#555;border-right: 1px solid #ededed;">Title</th>
            <th style="padding: 10px 7px;color:#fff;background:#555;border-right: 1px solid #ededed;">Quantity</th>
            <th style="padding: 10px 7px;color:#fff;background:#555;border-right: 1px solid #ededed;">Rate</th>
             ${ getInvoiceFinance(invoice).discount ? '<th style="padding: 10px 7px;color:#fff;background:#555;border-right: 1px solid #ededed;">Discount</th>' : '' } 
             ${ getInvoiceFinance(invoice).vat ? '<th style="padding: 10px 7px;color:#fff;background:#555;border-right: 1px solid #ededed;">Tax</th>' : '' } 
            <th style="padding: 10px 7px;color:#fff;background:#555;border-right: 1px solid #ededed;">Amount</th>
        </tr>`
	const tableBody = invoice.items.reduce((acc, item) => {
		acc = acc + `<tr>
		    <td style="padding: 10px 7px;border-right: 1px solid #ededed;border-top: 1px solid #ededed;">${ item.title }</td>
		    <td style="padding: 10px 7px;border-right: 1px solid #ededed;border-top: 1px solid #ededed;">${ +(+item.quantity).toFixed(2) }</td>
		    <td style="padding: 10px 7px;border-right: 1px solid #ededed;border-top: 1px solid #ededed;">${ +(+item.rate).toFixed(2) }</td>
	       ${ getInvoiceFinance(invoice).discount
				? `<td style="padding: 10px 7px;border-right: 1px solid #ededed;border-top: 1px solid #ededed;">
							${ item.discount }
							${ item.discountType === 'Currency' ? `<span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span>` : `<span style="margin-left: 2px;">%</span>` } 
          </td>`
				: '' } 
	       ${ getInvoiceFinance(invoice).vat
				? `<td style="padding: 10px 7px;border-right: 1px solid #ededed;border-top: 1px solid #ededed;">
											${ item.tax }
											${ item.taxType === 'Currency' ? `<span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span>` : `<span style="margin-left: 2px;">%</span>` } 
									</td>`
				: '' } 
		    <td style="padding: 10px 7px;border-right: 1px solid #ededed;border-top: 1px solid #ededed;">${ +(+item.amount).toFixed(2) } <span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span></td>
	     </tr>`
		return acc
	}, '')
	const tableEnd = `</table></div>`

	return `
		<div class="template" style="font-family: 'Helvetica'; width: 848px;box-sizing: border-box;padding: 40px;font-size:14px; color: #333;">
		  <div class="header">
		    <div class="header__logo" style="width: 451px; margin-right: 25px; display: inline-block; vertical-align: top;">
		      <div class="header__logo-image" style="width: 230px; ">
		        <div class="header__logo">
		          <svg style="height: 72px; width: 253px;" id="Ñëîé_1" data-name="Ñëîé 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 253 72"> <defs> <style>.cls-6{fill: #666;}.cls-1{fill: #555; stroke: #555; stroke-width: 1.2px}.cls-2{fill: #ffffff;}.cls-4{fill: #F4C430;}.cls-5{fill: #4ba5a5;}.cls-3{fill: #d66f58;}.cls-6{font-size: 14px; font-family: 'Courier New', monospace; font-weight: 400;}</style> </defs> <path class="cls-1" d="M87,20.64v4.13a14.82,14.82,0,0,1,4.35-3.7,11.51,11.51,0,0,1,5.48-1.24A12.51,12.51,0,0,1,103,21.4a11,11,0,0,1,4.39,4.36,12,12,0,0,1,1.55,5.87,11.35,11.35,0,0,1-3.5,8.36A12.34,12.34,0,0,1,87,38.52V52.18h5.51a1.73,1.73,0,0,1,1.16.31,1.12,1.12,0,0,1,0,1.63,1.67,1.67,0,0,1-1.16.33H81.65a1.77,1.77,0,0,1-1.16-.31,1,1,0,0,1-.35-.83,1,1,0,0,1,.35-.82,1.71,1.71,0,0,1,1.16-.31h3V22.94h-3a1.66,1.66,0,0,1-1.16-.33,1,1,0,0,1-.35-.83,1,1,0,0,1,.35-.81,1.66,1.66,0,0,1,1.16-.33Zm19.65,11a9.1,9.1,0,0,0-2.84-6.71,10.09,10.09,0,0,0-14,0,9.29,9.29,0,0,0,0,13.41,10.06,10.06,0,0,0,13.93,0A9.08,9.08,0,0,0,106.62,31.63Z"/> <path class="cls-1" d="M130.23,44V40.76a16.17,16.17,0,0,1-10.56,4.16,9.16,9.16,0,0,1-6.37-2.07,6.55,6.55,0,0,1-2.3-5.06A7.23,7.23,0,0,1,114,32c2-1.64,5-2.46,8.83-2.46a32.56,32.56,0,0,1,3.4.2c1.22.14,2.55.35,4,.64V26.74a4.07,4.07,0,0,0-1.73-3.24,8.26,8.26,0,0,0-5.18-1.37,26.12,26.12,0,0,0-7.43,1.54,5.13,5.13,0,0,1-1.11.27,1,1,0,0,1-.74-.33,1.09,1.09,0,0,1-.31-.81,1,1,0,0,1,.27-.73,9.13,9.13,0,0,1,3-1.1,26.83,26.83,0,0,1,6.37-1.14,9.79,9.79,0,0,1,6.7,2.12,6.29,6.29,0,0,1,2.4,4.79v15h3a1.76,1.76,0,0,1,1.18.31,1,1,0,0,1,.35.82,1,1,0,0,1-.35.81,1.7,1.7,0,0,1-1.18.32Zm0-11.28a22,22,0,0,0-3.38-.68,32.11,32.11,0,0,0-3.75-.21c-3.29,0-5.87.71-7.72,2.13a4.66,4.66,0,0,0-2.11,3.81,4.4,4.4,0,0,0,1.61,3.45,6.89,6.89,0,0,0,4.68,1.41A12.71,12.71,0,0,0,125,41.47a19.66,19.66,0,0,0,5.2-3.74Z"/> <path class="cls-1" d="M146.16,20.64v3.43a16.26,16.26,0,0,1,4.29-3.32,9.92,9.92,0,0,1,4.32-.92,10.12,10.12,0,0,1,4.73,1.11,7.85,7.85,0,0,1,2.74,2.69,6.92,6.92,0,0,1,1.23,3.84V41.76h1.91a1.71,1.71,0,0,1,1.16.31,1,1,0,0,1,.35.82,1,1,0,0,1-.35.81,1.66,1.66,0,0,1-1.16.32h-6.07a1.71,1.71,0,0,1-1.19-.32,1.08,1.08,0,0,1-.35-.81,1,1,0,0,1,.35-.82,1.77,1.77,0,0,1,1.19-.31h1.89V27.85a5.38,5.38,0,0,0-1.76-4.06,6.53,6.53,0,0,0-4.7-1.66,8,8,0,0,0-3.88.9,20.8,20.8,0,0,0-4.7,4.5V41.76h2.56a1.71,1.71,0,0,1,1.16.31,1,1,0,0,1,.36.82,1.06,1.06,0,0,1-.36.81,1.66,1.66,0,0,1-1.16.32h-7.39a1.71,1.71,0,0,1-1.17-.32,1.08,1.08,0,0,1-.35-.81,1,1,0,0,1,.35-.82,1.76,1.76,0,0,1,1.17-.31h2.56V22.94H142a1.67,1.67,0,0,1-1.16-.33,1.08,1.08,0,0,1-.35-.83,1.05,1.05,0,0,1,.35-.81,1.67,1.67,0,0,1,1.16-.33Z"/> <path class="cls-1" d="M188.67,24.8V20.64H194a1.66,1.66,0,0,1,1.16.33,1,1,0,0,1,.35.83,1,1,0,0,1-.35.81,1.66,1.66,0,0,1-1.16.33h-3.05V45.59a8.31,8.31,0,0,1-1,4,9,9,0,0,1-2.16,2.46,12.13,12.13,0,0,1-2.75,1.81,8.51,8.51,0,0,1-3.33.54h-6.42a1.77,1.77,0,0,1-1.16-.31,1.16,1.16,0,0,1,0-1.66,1.66,1.66,0,0,1,1.16-.33l6.51,0a6.5,6.5,0,0,0,3.6-1,7.8,7.8,0,0,0,2.66-3,6.17,6.17,0,0,0,.59-2.89V38.46a11.16,11.16,0,0,1-9.39,5A10.89,10.89,0,0,1,171.22,40a11.53,11.53,0,0,1-3.39-8.36,11.46,11.46,0,0,1,3.39-8.34,10.88,10.88,0,0,1,8.06-3.46A11.18,11.18,0,0,1,188.67,24.8Zm0,6.83a9.2,9.2,0,0,0-2.74-6.75,9.13,9.13,0,0,0-13.08,0,9.21,9.21,0,0,0-2.72,6.73,9.23,9.23,0,0,0,2.72,6.76,9.11,9.11,0,0,0,13.08,0A9.21,9.21,0,0,0,188.67,31.63Z"/> <path class="cls-1" d="M222.06,32.87H198.94A11,11,0,0,0,202.63,40a11.25,11.25,0,0,0,7.65,2.69,18.33,18.33,0,0,0,5.32-.84,13.83,13.83,0,0,0,4.54-2.21,1.55,1.55,0,0,1,.89-.41,1,1,0,0,1,.76.34,1.13,1.13,0,0,1,.32.8,1.27,1.27,0,0,1-.43.89,12.13,12.13,0,0,1-4.61,2.52,20.17,20.17,0,0,1-6.79,1.18,13.36,13.36,0,0,1-9.73-3.83,12.44,12.44,0,0,1-3.9-9.24,11.37,11.37,0,0,1,3.66-8.48,12.52,12.52,0,0,1,9.06-3.54,12.33,12.33,0,0,1,9.15,3.63A12.69,12.69,0,0,1,222.06,32.87Zm-2.3-2.29a9.85,9.85,0,0,0-3.55-6.1,11.17,11.17,0,0,0-13.67,0A10,10,0,0,0,199,30.58Z"/> <path class="cls-1" d="M244.5,44V40.76a16.15,16.15,0,0,1-10.56,4.16,9.16,9.16,0,0,1-6.37-2.07,6.55,6.55,0,0,1-2.3-5.06,7.23,7.23,0,0,1,3-5.75c2-1.64,5-2.46,8.83-2.46a32.4,32.4,0,0,1,3.4.2c1.22.14,2.55.35,4,.64V26.74a4.07,4.07,0,0,0-1.73-3.24,8.26,8.26,0,0,0-5.18-1.37,26.12,26.12,0,0,0-7.43,1.54,5,5,0,0,1-1.11.27,1,1,0,0,1-.74-.33,1.13,1.13,0,0,1-.31-.81,1,1,0,0,1,.27-.73,9.13,9.13,0,0,1,3-1.1,26.83,26.83,0,0,1,6.37-1.14,9.79,9.79,0,0,1,6.7,2.12,6.29,6.29,0,0,1,2.4,4.79v15h3a1.79,1.79,0,0,1,1.19.31,1,1,0,0,1,.35.82,1.08,1.08,0,0,1-.35.81,1.73,1.73,0,0,1-1.19.32Zm0-11.28a21.74,21.74,0,0,0-3.38-.68,32,32,0,0,0-3.75-.21c-3.29,0-5.87.71-7.72,2.13a4.66,4.66,0,0,0-2.11,3.81,4.4,4.4,0,0,0,1.61,3.45,6.89,6.89,0,0,0,4.68,1.41,12.68,12.68,0,0,0,5.47-1.18,19.66,19.66,0,0,0,5.2-3.74Z"/> <circle class="cls-2" cx="56.96" cy="27.78" r="8.27"/> <circle class="cls-2" cx="20.76" cy="27.78" r="8.27"/> <path class="cls-3" d="M71.14,12.74c-.53-.53-1-1-1.57-1.46a20,20,0,0,0-25.22,0,21.56,21.56,0,0,0-1.6,1.46A19.27,19.27,0,0,0,36.86,26.9a19.58,19.58,0,0,0,5,13.3l.09.07.79.81A12.49,12.49,0,0,0,45,43.13l12,11,1.74-1.69c.1-.06,11-9.94,11-9.94a14.93,14.93,0,0,0,1.38-1.38A19.47,19.47,0,0,0,77,26.9,19.31,19.31,0,0,0,71.14,12.74ZM62.77,33.59a7.76,7.76,0,0,1-5.84,2.46A8,8,0,0,1,51,33.59a7.87,7.87,0,0,1-2.36-5.79,8.07,8.07,0,0,1,8.25-8.29,7.9,7.9,0,0,1,5.84,2.36,8.06,8.06,0,0,1,2.46,5.93A7.7,7.7,0,0,1,62.77,33.59Z"/> <path class="cls-4" d="M34.94,12.74c-.52-.53-1-1-1.57-1.46A19.26,19.26,0,0,0,20.74,6.8,19.13,19.13,0,0,0,8.15,11.28c-.54.45-1.07.93-1.6,1.46A19.31,19.31,0,0,0,.66,26.9a19.58,19.58,0,0,0,5,13.3l.1.07q.38.4.78.81a12.82,12.82,0,0,0,2.29,2.05l12,11,1.74-1.69c.1-.06,11-9.94,11-9.94a13.79,13.79,0,0,0,1.38-1.38A19.43,19.43,0,0,0,40.83,26.9,19.27,19.27,0,0,0,34.94,12.74ZM26.58,33.59a7.78,7.78,0,0,1-5.84,2.46,8,8,0,0,1-5.89-2.46,7.84,7.84,0,0,1-2.36-5.79,8.07,8.07,0,0,1,8.25-8.29,7.92,7.92,0,0,1,5.84,2.36A8.08,8.08,0,0,1,29,27.8,7.73,7.73,0,0,1,26.58,33.59Z"/> <path class="cls-5" d="M55,7.42c-.59-.59-1.18-1.14-1.77-1.64A21.76,21.76,0,0,0,38.92.72a21.6,21.6,0,0,0-14.2,5.06c-.61.5-1.21,1-1.81,1.64a21.83,21.83,0,0,0-6.64,16,22.07,22.07,0,0,0,5.65,15l.11.08c.28.31.58.61.88.92a14.27,14.27,0,0,0,2.59,2.31L39.06,54.09l2-1.91C41.13,52.11,53.39,41,53.39,41A14.33,14.33,0,0,0,55,39.41a22,22,0,0,0,6.65-16A21.8,21.8,0,0,0,55,7.42ZM45.51,31a8.75,8.75,0,0,1-6.59,2.77A9,9,0,0,1,32.28,31a8.89,8.89,0,0,1-2.67-6.54,9.11,9.11,0,0,1,9.31-9.36,9,9,0,0,1,6.59,2.66,9.12,9.12,0,0,1,2.77,6.7A8.72,8.72,0,0,1,45.51,31Z"/> <circle class="cls-2" cx="38.9" cy="24.43" r="9.32"/> <text class="cls-6" transform="translate(80 70)">Translation Experts</text> </svg>
		        </div>
		      </div>
		      <div class="header__logo-company" style="margin-top: 25px;">
		        <div class="profile__name" style="font-weight: bold;">Pangea Translation Services (Cyprus) LTD</div>
		        <div class="profile__text">Maximos Court A,  Arch. Leontiou A, 254</div>
		        <div class="profile__text">Cyprus, Limassol, 3020</div>
		        <div class="profile__text">CY10362046H</div>
		      </div>
		    </div>
		    <div class="header__data" style="width: 280px; display: inline-block; vertical-align: top;">
		      <div class="header__data-line" style="height: 18px;background: #4ba5a5;margin-right: -40px;"></div>
		      <div class="header__data-title" style="margin: 15px 0 10px;  font-size: 30px;">Invoice</div>
		      <div class="header__data-number" style="margin: 7px 0; font-size: 16px; font-weight: bold;">${ invoice.invoiceId }</div>
		      <div class="row" style="height: 30px;">
		        <div class="row__key" style="width: 115px;margin-right: 10px; display: inline-block;">Balance Due:</div>
		        <div class="row__value" style="width: 150px;display: inline-block;"><span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span><span>${ getInvoiceFinance(invoice).total }</span></div>
		      </div>
		    </div>
		  </div>
		  <div class="subheader" style="margin: 15px 0 32px 0px;padding-bottom: 25px;border-bottom: 1px solid #4ba5a5;">
		    <div class="subheader__left" style="width: 451px; margin-right: 25px; display: inline-block; vertical-align: top;">
		      <div class="profile__name" style="font-weight: bold;">${ paymentProfile(invoice).getOfficialName() }</div>
		      <div class="profile__text">${ paymentProfile(invoice).getAddress() }</div>
		      ${ state }
		      <div class="profile__text">${ paymentProfile(invoice).getCityWithCode() }</div>
		      <div class="profile__text">${ paymentProfile(invoice).getVat() }</div>
		    </div>
		    <div class="subheader__right" style="width: 280px; display: inline-block; vertical-align: top;">
		
		      <div class="row" style="height: 30px;">
		        <div class="row__key" style="width: 115px;margin-right: 10px;display: inline-block;">Invoice Date:</div>
		        <div class="row__value" style="width: 150px;display: inline-block;">${ getTime(invoice.invoicingDate) }</div>
		      </div>
		      <div class="row" style="height: 30px;">
		        <div class="row__key" style="width: 115px;margin-right: 10px;display: inline-block;">Terms:</div>
		        <div class="row__value" style="width: 150px;display: inline-block;">${ invoice.terms.name }</div>
		      </div>
		      <div class="row" style="height: 30px;">
		        <div class="row__key" style="width: 115px;margin-right: 10px;display: inline-block;">Due Date:</div>
		        <div class="row__value" style="width: 150px;display: inline-block;">${ getTime(invoice.dueDate) }</div>
		      </div>
		    </div>
		  </div>
		  <div class="body">
		    <div class="body__table">
		    	${ tableStart }
		    	${ tableBody }
		    	${ tableEnd }
		    </div>
		    <div class="body__subtable" style="width: 280px; margin-left: 480px; margin-top: 35px;">
		      <div class="table-details">
		        <div class="row" style="height: 30px;">
		          <div class="row__key" style="width: 115px;margin-right: 10px; display: inline-block;">Sub Total:</div>
		          <div class="row__value" style="width: 150px;display: inline-block;"><span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span><span>${ getInvoiceFinance(invoice).subTotal }</span></div>
		        </div>
						${ tableDetailsVAT }
						${ tableDetailsDiscount }
		        <div class="row" style="height: 30px;">
		          <div class="row__key" style="width: 115px;margin-right: 10px; display: inline-block;">Total:</div>
		          <div class="row__value" style="width: 150px;display: inline-block;"><span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span><span>${ getInvoiceFinance(invoice).total }</span></div>
		        </div>
		        <div class="splitter" style="margin-top: 6px;margin-bottom: 6px;height: 1px;background-color: #ededed;width: 100%;"></div>
		        <div class="row" style="height: 30px; width:">
		          <div class="row__key" style="width: 115px;margin-right: 10px; display: inline-block;">Balance Due:</div>
		          <div class="row__value" style="width: 150px;display: inline-block;"><span>${ returnIconCurrencyByStringCode(invoice.customer.currency) }</span><span>${ getInvoiceFinance(invoice).total }</span></div>
		        </div>
		      </div>
		    </div>
		  </div>
		  <div class="Payments">
		  	<h4>Pay via Bank Transfer:</h4>
          <div class="row" style="height: 30px;">
	          <div class="row__key" style="width: 140px;margin-right: 10px; display: inline-block;">ACCOUNT NAME:</div>
	          <div class="row__value" style="width: 400px;display: inline-block;"><span>Pangea Translation Services (Cyprus) LTD</span></div>
	        </div>
          <div class="row" style="height: 30px;">
	          <div class="row__key" style="width: 140px;margin-right: 10px; display: inline-block;">BANK NAME:</div>
	          <div class="row__value" style="width: 400px;display: inline-block;"><span>Hellenic Bank</span></div>
	        </div>
          <div class="row" style="height: 30px;">
	          <div class="row__key" style="width: 140px;margin-right: 10px; display: inline-block;">ACCOUNT NUMBER:</div>
	          <div class="row__value" style="width: 400px;display: inline-block;"><span>240-01-776394-01</span></div>
	        </div>
          <div class="row" style="height: 30px;">
	          <div class="row__key" style="width: 140px;margin-right: 10px; display: inline-block;">IBAN:</div>
	          <div class="row__value" style="width: 400px;display: inline-block;"><span>CY75005002400002400177639401</span></div>
	        </div>
          <div class="row" style="height: 30px;">
	          <div class="row__key" style="width: 140px;margin-right: 10px; display: inline-block;">SWIFT:</div>
	          <div class="row__value" style="width: 400px;display: inline-block;"><span>HEBACY2N</span></div>
	        </div>
          <div class="row" style="height: 30px;">
	          <div class="row__key" style="width: 140px;margin-right: 10px; display: inline-block;">BANK ADDRESS:</div>
	          <div class="row__value" style="width: 400px;display: inline-block;"><span>131 Arch. Makarios III & Ioanni Polemi P.O Box 51791, 3508 Lemesos, Cyprus</span></div>
	        </div>
		  </div>
		</div>`

	function paymentProfile(invoice) {
		const bi = invoice.customer.billingInfo.find(({ _id }) => `${ _id }` === `${ invoice.clientBillingInfo }`)
		const { officialName, address } = bi
		const { city, country, state, street1, street2, vat, zipCode } = address
		return {
			getOfficialName: () => officialName || '',
			getAddress: () => `${ street1 || '' }${ street2 && '. ' }${ street2 || '' }`,
			getState: () => state || '',
			getCity: () => city || '',
			getZipCode: () => zipCode || '',
			getCountry: () => country || '',
			getCityWithCode() {
				return `${ this.getCountry() }${ this.getCity() && ', ' }${ this.getCity() }${ this.getZipCode() && ', ' }${ this.getZipCode() }`
			},
			getVat: () => vat || ''
		}
	}

	function getTime(date) {
		return moment(date).format('DD/MM/YYYY')
	}
}

function getInvoiceSendTemplate(invoice) {
	return `<div class="wrapper" style="width:800px;border-width:1px;border-style:solid;border-color:#bfbfbf;font-family:'Roboto', sans-serif;color:#333!important;box-sizing:border-box;" >
                <header style="background-color:#efefef;text-align:center;" >
                    <img class="logo" src="cid:logo@pan" alt="pangea" style="margin:7px;" >
                </header>
                <div class="main" style="padding:25px;">
                    <p class="main_italic main_line15 main_weight600" style="font-weight:600;font-style:italic;margin-top:10px;margin-bottom:40px;margin-right:0;margin-left:0;line-height:1.5;">
                    ***This is an automated message*** <br>
                    This message is sent to you on behalf of Accounting
                    </p>
                    <p style="background: #f7f7f7; font-size: 14px; font-weight: bold; padding: 14px;"><span id="client-name-row">Dear Test</span></p>
                    <p>Invoice <b>${ invoice.invoiceId }</b> for the sum of: <b>${ returnIconCurrencyByStringCode(invoice.customer.currency) }${ getInvoiceFinance(invoice).total }</b> 
                    	can be viewed, printed or downloaded as a PDF file from the link below.</p>
                    <p>Kindly add the invoice ID as a reference, when sending the transfer.</p>
                    <p style="background: rgba(245, 198, 83, 0.14);padding: 10px;">
                    ***Please make sure that the transfer includes <b>all bank fees</b>, so that the receivables on our side match the amount stated in the invoice.***</p>
                    <p>Click to view your Invoice and choose the payment option</p>
                    <p>We look forward to doing more business with you.</p>
                    <br>
                    <p>Regards,<br>Finance team</p>
                </div>
                <footer>
                    <hr size="10" style="border:none;" color="#efefef">
                    <a class="footer__link" href="https://www.pangea.global" style="display:block;width:100%;text-align:center;padding-top:10px;padding-bottom:15px;padding-right:0;padding-left:0;text-decoration:none;color:#333;" >www.pangea.global</a>
                </footer>
            </div>`
}

module.exports = {
	pdfPPPReportTemplate,
	invoicingMessage,
	messageForClientSendQuote,
	getDeliveryMessage,
	projectCancelledMessage,
	tasksMiddleCancelledMessage,
	projectDeliveryMessage,
	projectMiddleCancelledMessage,
	getPdfOfQuote,
	messageForClientSendCostQuote,
	getNotifyDeliveryMessage,
	getPdfInvoice,
	getInvoiceSendTemplate
}

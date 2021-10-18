const { returnIconCurrencyByStringCode } = require('../helpers/commonFunctions')
const moment = require('moment')

function getAdditionsCosts(project, tasksIds) {
	if (tasksIds.length) return ''
	if (project.paymentAdditions.length) {
		const data = project.paymentAdditions.reduce((acc, curr) => {
			acc += `<div class="row" style="border-bottom: 1px solid #ededed;">
							<div class="key" style="display: inline-block; padding: 8px; min-width: 200px;">${ curr.name }:</div>
							<div class="value" style="display: inline-block; padding: 8px; min-width: 200px;"> ${ returnIconCurrencyByStringCode(project.projectCurrency) } ${ curr.value }</div>
            </div>`
			return acc
		}, '')

		return `<div class="block" style="border: 1px solid #bfbfbf; width: max-content;">${ data }</div>`
	}
	return ''
}

function getJobsDetails(project, tasksIds, steps, allUnits) {
	let allSteps = steps
	if (tasksIds.length) allSteps = steps.filter(i => tasksIds.includes(i.taskId))
	const isHideWhenMinimumCharge = project.minimumCharge.value > project.finance.Price.receivables && !project.minimumCharge.toIgnore

	const data = allSteps.reduce((acc, curr) => {
		const { type } = allUnits.find(({ _id }) => _id.toString() === curr.serviceStep.unit.toString())
		const name = type === 'CAT Wordcount' ? curr.serviceStep.memoqAssignmentRole === 0 ? 'Translation' : 'Revising' : curr.name
		let quantity = 0
		let cost = 0

		if (type === 'CAT Wordcount') {
			quantity = +curr.totalWords
			cost += +curr.totalWords * +curr.clientRate.value
		} else if (type === 'Packages') {
			quantity = +curr.quantity
			cost += +curr.quantity * +curr.clientRate.value
		} else {
			quantity = +curr.hours
			cost += +curr.hours * +curr.clientRate.value
		}

		acc = acc + `<div style="border-bottom: 1px solid #ededed;">
			        <div style="display: inline-block; padding: 8px; width: 130px;">${ name }</div>
			        <div style="display: inline-block; padding: 8px; width: 135px;">${ curr.sourceLanguage === curr.targetLanguage ? curr.targetLanguage : curr.sourceLanguage + ' >> ' + curr.targetLanguage } </div>
			        <div style="display: inline-block; padding: 8px; width: 140px;">${ type } </div>
			        <div style="display: inline-block; padding: 8px; width: 70px;">${ +quantity.toFixed(2) }</div>
			        <div style="display: inline-block; padding: 8px; width: 70px;"> ${ isHideWhenMinimumCharge ? '-' : returnIconCurrencyByStringCode(project.projectCurrency) + curr.clientRate.value.toFixed(2) } </div>
			        <div style="display: inline-block; padding: 8px; width: 70px;"> ${ isHideWhenMinimumCharge ? '-' : returnIconCurrencyByStringCode(project.projectCurrency) + cost.toFixed(2) } </div>
				    </div>`
		return acc
	}, '')

	return `<div style="border: 1px solid #bfbfbf; width: max-content; margin-top: 25px;">
					    <div style="border-bottom: 1px solid #ededed; background: #f7f7f7;">
					        <div style="display: inline-block; padding: 8px; width: 130px;">Service</div>
					        <div style="display: inline-block; padding: 8px; width: 135px;">Language</div>
					        <div style="display: inline-block; padding: 8px; width: 140px;">Unit</div>
					        <div style="display: inline-block; padding: 8px; width: 70px;">Quantity</div>
					        <div style="display: inline-block; padding: 8px; width: 70px;">Unit Price</div>
					        <div style="display: inline-block; padding: 8px; width: 70px;">Cost</div>
					    </div>
					    ${ data }
					</div>`
}

function getProjectDetails(project) {
	const { projectName, projectId, industry, deadline } = project
	return `
			<div class="block" style="border: 1px solid #bfbfbf; width: max-content;">
			  <div class="row" style="border-bottom: 1px solid #ededed;">
			      <div class="key" style="display: inline-block; padding: 8px; min-width: 200px;">Name:</div>
			      <div class="value" style="display: inline-block; padding: 8px; min-width: 200px;">${ projectName }</div>
			  </div>
        <div class="row" style="border-bottom: 1px solid #ededed;">
			      <div class="key" style="display: inline-block; padding: 8px; min-width: 200px;">ID:</div>
			      <div class="value" style="display: inline-block; padding: 8px; min-width: 200px;">${ projectId }</div>
			  </div>
			  <div class="row" style="border-bottom: 1px solid #ededed;">
			      <div class="key" style="display: inline-block; padding: 8px; min-width: 200px;">Industry:</div>
			      <div class="value" style="display: inline-block; padding: 8px; min-width: 200px;">${ industry.name }</div>
			  </div>
			  <div class="row">
			      <div class="key" style="display: inline-block; padding: 8px; min-width: 200px;">Estimated delivery date:</div>
			      <div class="value" style="display: inline-block; padding: 8px; min-width: 200px;"> ${ moment(deadline).format('LLL') } </div>
			  </div>
		</div>`
}

function getStepsSubTotal(tasksIds, steps, allUnits) {
	let subTotal = 0
	let allSteps = steps
	if (tasksIds.length) allSteps = steps.filter(i => tasksIds.includes(i.taskId))

	for (let curStep of allSteps) {
		const { type } = allUnits.find(({ _id }) => _id.toString() === curStep.serviceStep.unit.toString())
		if (type === 'CAT Wordcount') {
			subTotal += +curStep.totalWords * +curStep.clientRate.value
		} else if (type === 'Packages') {
			subTotal += +curStep.quantity * +curStep.clientRate.value
		} else {
			subTotal += +curStep.hours * +curStep.clientRate.value
		}
	}
	return +subTotal.toFixed(2)
}

function getStepsTotal(tasksIds, steps, allUnits) {
	let total = 0
	let allSteps = steps
	if (tasksIds.length) allSteps = steps.filter(i => tasksIds.includes(i.taskId))

	for (let curStep of allSteps) {
		const { type } = allUnits.find(({ _id }) => _id.toString() === curStep.serviceStep.unit.toString())
		if (type === 'CAT Wordcount') {
			total += +curStep.finance.Wordcount.receivables * +curStep.clientRate.value
		} else if (type === 'Packages') {
			total += +curStep.quantity * +curStep.clientRate.value
		} else {
			total += +curStep.hours * +curStep.clientRate.value
		}
	}
	return +total.toFixed(2)
}

function getFinanceDetailsDiscounts(project, subTotal) {
	return project.discounts.reduce((acc, curr) => {
		const val = ((subTotal * curr.value) / 100).toFixed(2)
		acc += `<div class="row" style="border-bottom: 1px solid #ededed;">
							<div class="key" style="display: inline-block; padding: 8px; min-width: 200px;">${ curr.name }:</div>
							<div class="value" style="display: inline-block; padding: 8px; min-width: 200px;">${ returnIconCurrencyByStringCode(project.projectCurrency) } ${ val } </div>
            </div>`
		return acc
	}, '')
}

function getFinanceDetailsTMDiscounts(project, TMDiscount) {
	if (+TMDiscount < 0.05) return ''
	return `<div class="row" style="border-bottom: 1px solid #ededed;">
						<div class="key" style="display: inline-block; padding: 8px; min-width: 200px;">TM Discount:</div>
						<div class="value" style="display: inline-block; padding: 8px; min-width: 200px;">${ returnIconCurrencyByStringCode(project.projectCurrency) } -${ TMDiscount } </div>
        	</div>`
}

module.exports = {
	getFinanceDetailsTMDiscounts,
	getFinanceDetailsDiscounts,
	getStepsTotal,
	getStepsSubTotal,
	getProjectDetails,
	getJobsDetails,
	getAdditionsCosts
}
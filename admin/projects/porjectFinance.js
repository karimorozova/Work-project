const { updateProject, getProjectAfterUpdate } = require('./getProjects')
const { getProjectAfterUpdate: getMemoqProjectAfterUpdate } = require('../services/memoqs/otherProjects/getMemoqProject')
const { getPriceAfterApplyingDiscounts } = require('./helpers')
const { Projects } = require('../models')


async function getProjectAfterFinanceUpdated({ project, steps, tasks }) {
	// try {
	// 	let { finance, isPriceUpdated, status, paymentAdditions } = project
	// 	finance.Price = getProjectFinancePrice(tasks)
	// 	finance.Price.receivables += +paymentAdditions.reduce((acc, { value }) => acc += +value, 0)
	// 	const { receivables, payables } = finance.Price
	// 	const roi = payables ? ((receivables - payables) / payables).toFixed(2) : 0
	// 	const checkStatuses = [ 'Quote sent', 'Approved' ]
	// 	isPriceUpdated = checkStatuses.indexOf(status) !== -1
	// 	return await updateProject({ '_id': project.id }, { finance, steps, tasks, isPriceUpdated, roi })
	// } catch (err) {
	// 	console.log(err)
	// 	console.log("Error in getProjectAfterFinanceUpdated")
	// }
}

function getProjectFinancePrice(tasks) {
	// const notCancelledTasks = tasks.filter(item => item.status !== 'Cancelled')
	// let receivables = +(notCancelledTasks.reduce((prev, cur) => {
	// 	if (cur.status === 'Cancelled Halfway') {
	// 		return prev + cur.finance.Price.halfReceivables
	// 	}
	// 	return prev + cur.finance.Price.receivables
	// }, 0).toFixed(2))
	// const payables = +(notCancelledTasks.reduce((prev, cur) => {
	// 	if (cur.status === 'Cancelled Halfway') {
	// 		return prev + cur.finance.Price.halfPayables
	// 	}
	// 	return prev + cur.finance.Price.payables
	// }, 0).toFixed(2))
	//
	// return { receivables, payables }
}

function getUpdatedProjectFinanceToZero(tasks) {
	// let receivables = 0
	// let payables = 0
	// for (let task of tasks) {
	// 	if (task.status !== 'Cancelled') {
	// 		receivables += task.status === 'Cancelled Halfway' ? +task.finance.Price.halfReceivables : receivables
	// 		payables += task.status === 'Cancelled Halfway' ? +task.finance.Price.halfPayables : payables
	// 	}
	// }
	// return { receivables: +receivables.toFixed(2), payables: +payables.toFixed(2) }
}

const updateProjectFinanceOnDiscountsUpdate = async (_id, updatedDiscounts, tableName = Projects) => {
	// let project = await tableName.findOne({ _id })
	// let { finance, tasks, steps, paymentAdditions } = project
	// const {
	// 	steps: updatedSteps,
	// 	tasks: updatedTasks,
	// 	finance: updatedFinance,
	// 	roi
	// } = recalculateProjectFinance(finance, tasks, steps, updatedDiscounts, paymentAdditions)
	// const itemsToUpdate = {
	// 	finance: updatedFinance,
	// 	tasks: updatedTasks,
	// 	steps: updatedSteps,
	// 	discounts: updatedDiscounts,
	// 	roi
	// }
	// if (tableName === Projects) {
	// 	return await getProjectAfterUpdate({ _id }, { ...itemsToUpdate })
	// } else {
	// 	return await getMemoqProjectAfterUpdate({ _id }, { ...itemsToUpdate })
	// }
}

// const addPaymentAdditions = async (_id, paymentAddition) => {
// 	const { finance } = await Projects.findOne({ _id: _id })
//
// 	return await getProjectAfterUpdate({ _id }, {
// 		$push: { paymentAdditions: paymentAddition },
// 		"finance.Price.receivables": +finance.Price.receivables + +paymentAddition.value
// 	})
// }
//
// const deletePaymentAddition = async (_id, { _id: paymentAdditionId, value }) => {
// 	const { finance } = await Projects.findOne({ _id: _id })
//
// 	return await getProjectAfterUpdate({ _id }, {
// 		$pull: { "paymentAdditions": { _id: paymentAdditionId } },
// 		"finance.Price.receivables": +finance.Price.receivables - +value
// 	})
// }


const recalculateProjectFinance = (finance, tasks, steps, discounts = [], paymentAdditions) => {
	// //FIN53
	// steps = steps.filter(({ status }) => status !== 'Cancelled')
	// for (let step of steps) {
	// 	let { finance: { Price: { receivables } }, clientRate: { value } } = step
	// 	const multiplier = findStepMultiplier(step)
	// 	if (!value) value = 0
	// 	receivables = +multiplier * +value
	// 	if (discounts.length) {
	// 		step.finance.Price.receivables = getPriceAfterApplyingDiscounts(discounts, receivables)
	// 	} else {
	// 		step.finance.Price.receivables = receivables
	// 	}
	// }
	// for (let task of tasks) {
	// 	const { taskId } = task
	// 	const taskSteps = steps.filter(step => step.taskId === taskId)
	// 	task.finance.Price.receivables = sumReceivables(taskSteps)
	// }
	// finance.Price.receivables = sumReceivables(tasks)
	// finance.Price.receivables += +paymentAdditions.reduce((acc, { value }) => acc += +value, 0)
	// const roi = ((+finance.Price.receivables - +finance.Price.payables) / +finance.Price.payables).toFixed(2)
	// return { steps, tasks, finance, roi }
	//
	// function sumReceivables(arr) {
	// 	let value = 0
	// 	for (let { finance: { Price }, status } of arr) {
	// 		value += status !== 'Cancelled Halfway' ? Price.receivables : Price.halfReceivables
	// 	}
	// 	return value
	// }
}

const findStepMultiplier = (step) => {
	// //FIN53
	// if (step.finance.Wordcount.receivables === 0) {
	// 	if (step._doc.hasOwnProperty('quantity')) {
	// 		return +step.quantity
	// 	} else if (step._doc.hasOwnProperty('hours')) {
	// 		return +step.hours
	// 	}
	// } else {
	// 	return step.finance.Wordcount.receivables
	// }
}

module.exports = {
	getProjectAfterFinanceUpdated,
	getUpdatedProjectFinanceToZero,
	updateProjectFinanceOnDiscountsUpdate,
	getProjectFinancePrice,
	// addPaymentAdditions,
	// deletePaymentAddition
}

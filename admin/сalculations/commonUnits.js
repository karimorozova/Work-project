const { getStepFinanceData } = require('./finance')
const { updateProject } = require('../projects')

// async function getAfterHoursPayablesUpdated({ project, step }) {
// 	try {
// 		let { tasks, steps, customer, industry, discounts, _id: projectId } = project
// 		const _taskIdx = tasks.findIndex(item => item.taskId === step.taskId)
// 		const _stepIdx = steps.findIndex(item => item.taskId === step.taskId && item.stepId === step.stepId)
//
// 		const quantity = step.finance.Quantity
// 		const { finance, vendorRate, nativeFinance, nativeVendorRate } =
// 				await getStepFinanceData({ customer, industry, serviceStep: step.serviceStep, task: tasks[_taskIdx], vendorId: step.vendor._id, quantity, discounts, projectId })
//
// 		steps[_stepIdx].finance = finance
// 		steps[_stepIdx].vendorRate = vendorRate
//
// 		steps[_stepIdx].nativeFinance = nativeFinance
// 		steps[_stepIdx].nativeVendorRate = nativeVendorRate
//
// 		return await updateProject({ '_id': project._id }, { steps })
// 	} catch (err) {
// 		console.log(err)
// 		console.log('Error in getAfterPackagesPayablesUpdated')
// 	}
// }

// module.exports = { getAfterHoursPayablesUpdated }

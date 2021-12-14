const EventEmitter = require('events')
const emitter = new EventEmitter()
const { Projects, InvoicingReceivables } = require('../models')
const { notifyStepDecisionMade, setApprovedStepStatus } = require('../projects')
const { notifyManagerProjectStarts, sendQuoteToVendorsAfterProjectAccepted, notifyManagerProjectRejected } = require('../utils')
const { getAllSteps, createReports, createAndSendZohoInvoice } = require("../invoicingReceivables")
const { createDir } = require("../invoicingPayables/PayablesFilesAndDirecrory")
const DIR = './dist/clientReportsFiles/'


emitter.on('vendor-decide', async (prop, project, vendorId, stepId) => {
	let { steps } = project
	const _idx = steps.findIndex(item => item._id.toString() === stepId.toString())

	if (prop === 'accept') {
		steps	= setApprovedStepStatus({ project, step: steps[_idx]._doc, steps })
		await notifyStepDecisionMade({ project, step: steps[_idx], decision: 'accept' })
	}
	if (prop === 'reject') {
		steps[_idx].status = 'Rejected'
		await notifyStepDecisionMade({ project, step: steps[_idx], decision: 'rejected' })
	}
	steps[_idx].vendorsClickedOffer.push(vendorId)

	await Projects.updateOne({ "_id": project.id }, { steps })
})

emitter.on('client-decide', async (project, prop) => {
	if (prop === 'accept') {
		await notifyManagerProjectStarts(project)
		if(!project.inPause){
			const steps = await sendQuoteToVendorsAfterProjectAccepted(project.steps, project)
			await Projects.updateOne({ "_id": project._id }, { steps })
		}
	}
	if (prop === 'reject') {
		await notifyManagerProjectRejected(project)
	}
	// if(project.paymentProfile === 'PPP' && !project.isTest) {
	// 	const steps = await getAllSteps(0, 0, { _id: project._id })
	// 	await createReports({checkedSteps: steps, createdBy: null})
	// 	const report = await InvoicingReceivables.findOne({"stepsAndProjects.step": {"$in": steps.map(({steps}) => steps._id.toString())}  })
	// 	await createDir(DIR, report._id.toString())
	// 	await createAndSendZohoInvoice(report._id.toString())
	// }
})

emitter.on('client-decide-tasks', async (project, prop, neededSteps) => {
	if (prop === 'accept') {
		await notifyManagerProjectStarts(project)
		const steps = await sendQuoteToVendorsAfterProjectAccepted(neededSteps, project)
		for await (let step of steps) await Projects.updateOne({ "_id": project._id }, { $set: { "steps.$[i]": step } }, { arrayFilters: [ { 'i._id': step._id } ] })
	}
	if (prop === 'reject') {
		await notifyManagerProjectRejected(project)
	}
})


module.exports = { quoteEmitter: emitter }

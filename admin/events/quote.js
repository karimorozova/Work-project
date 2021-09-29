const EventEmitter = require('events')
const emitter = new EventEmitter()
const { Projects } = require('../models')
const { setStepsStatus, notifyStepDecisionMade } = require('../projects')
const { notifyManagerProjectStarts, sendQuoteToVendorsAfterProjectAccepted, notifyManagerProjectRejected } = require('../utils')


emitter.on('vendor-decide', async (prop, project, vendorId, stepId) => {
	let { steps, status } = project
	const _idx = steps.findIndex(item => item._id.toString() === stepId.toString())

	if (prop === 'accept') {
		const isProjectApproved = status === 'Approved' || status === 'In progress'
		steps[_idx].status = isProjectApproved ? "Ready to Start" : 'Approved'
		await notifyStepDecisionMade({ project, step: steps[_idx], decision: 'accept' })
	}
	if (prop === 'reject') {
		steps[_idx].status = 'Rejected'
		await notifyStepDecisionMade({ project, step: steps[_idx], decision: 'rejected' })
	}

	steps[_idx].vendorsClickedOffer.push(vendorId)
	steps = setStepsStatus({ steps: [ { ...steps[_idx]._doc } ], status: steps[_idx].status, project })
	await Projects.updateOne({ "_id": project.id }, { steps })
})

emitter.on('client-decide', async (project, prop) => {
	if (prop === 'accept') {
		await notifyManagerProjectStarts(project)
		const steps = await sendQuoteToVendorsAfterProjectAccepted(project.steps, project)
		await Projects.updateOne({ "_id": project._id }, { steps })
	}
	if (prop === 'reject') {
		await notifyManagerProjectRejected(project)
	}
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

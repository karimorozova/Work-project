const { getProject, updateProject } = require("../projects/getProjects")
const { getNewStepPayablesFinanceData } = require("./finance")
const { stepReassignedNotification } = require("../utils/projectMails")
const { Vendors } = require("../models")

async function assignVendorToStep({ projectId, stepsVendors }) {
	try {
		const { steps, industry, projectCurrency, crossRate, tasks } = await getProject({ '_id': projectId })

		for (const stepId in stepsVendors) {
			const vendorId = stepsVendors[stepId].toString()
			const _idxS = steps.findIndex(({ _id }) => `${ _id }` === `${ stepId }`)
			const _idxT = tasks.findIndex(({ taskId }) => taskId === steps[_idxS].taskId)

			if (!steps[_idxS].vendor || `${ steps[_idxS].vendor._id }` !== vendorId) {
				const vendor = await Vendors.findOne({ _id: vendorId })
				steps[_idxS].vendor = vendor

				const { task, step } = await getNewStepPayablesFinanceData({ step: steps[_idxS], vendor, industry, projectCurrency, crossRate, task: tasks[_idxT] })
				steps[_idxS] = step
				tasks[_idxT] = task
				await stepReassignedNotification(steps[_idxS])
			}
		}

		return await updateProject({ '_id': projectId }, { steps, tasks })

	} catch (err) {
		console.log(err)
		console.log('Error in assignVendorToStep')
	}
}

module.exports = { assignVendorToStep }

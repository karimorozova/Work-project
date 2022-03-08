const { Projects } = require("../models")

const unbindStepsFromReportByProjectMutation = async (stepId) => {
	const isClassic = await Projects.findOne({ "steps._id": stepId })
	const isExtra = await Projects.findOne({ "additionsSteps._id": stepId })

	if (isClassic)
		await Projects.updateOne(
				{ "steps._id": stepId },
				{ "steps.$[i].isInReportReceivables": false },
				{ arrayFilters: [ { "i._id": stepId } ] }
		)
	if (isExtra)
		await Projects.updateOne(
				{ "additionsSteps._id": stepId },
				{ "additionsSteps.$[i].isInReportReceivables": false },
				{ arrayFilters: [ { "i._id": stepId } ] }
		)
}

module.exports = {
	unbindStepsFromReportByProjectMutation
}

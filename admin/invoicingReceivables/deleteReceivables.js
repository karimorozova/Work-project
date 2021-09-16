const { InvoicingReceivables, Projects } = require("../models")
const { removeDir } = require("../invoicingPayables/PayablesFilesAndDirecrory")

const receivableDelete = async (reportId) => {
	const receivables = await InvoicingReceivables.findOne({ _id: reportId })
	const steps = receivables ? receivables.stepsAndProjects.map(({ step }) => step) : []
	await Projects.updateMany(
			{ 'steps._id': { $in: steps } },
			{ 'steps.$[i].isInReportReceivables': false },
			{ arrayFilters: [ { 'i._id': { $in: steps } } ] })

	await InvoicingReceivables.deleteOne({ _id: reportId })
	await removeDir(reportId)
}


const deleteStepFromReport = async (reportId, stepId) => {
	try {

		console.log('DELETE STEP FROM REPORT', reportId, stepId)

		// await InvoicingPayables.updateOne({ _id: reportId }, { $pull: { 'steps': stepId } })
		// const currentReport = (await getPayablesProjectsAndSteps(reportId)).pop()
		// const { firstPaymentDate, lastPaymentDate } = getPayablesDateRange(currentReport.steps)
		// await InvoicingPayables.updateOne({ _id: reportId },
		// 		{ $set: { firstPaymentDate, lastPaymentDate } })
		// await Projects.updateOne(
		// 		{ 'steps._id': stepId },
		// 		{ 'steps.$[i].isInReportPayables': false },
		// 		{ arrayFilters: [ { 'i._id': stepId } ] }
		// )

	} catch (e) {
		console.log(e)
	}
}

module.exports = {
	receivableDelete,
	deleteStepFromReport
}
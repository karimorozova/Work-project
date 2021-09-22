const { InvoicingPayables, Projects } = require("../models")
const { getPayablesProjectsAndSteps, getPayablesDateRange } = require("./getPayables")
const { removeDir } = require("./PayablesFilesAndDirecrory")


const payableDeleteStep = async (reportId, stepId) => {
	try {
		await InvoicingPayables.updateOne({_id: reportId },{$pull: {'steps': stepId} })
		const currentReport = (await getPayablesProjectsAndSteps(reportId)).pop()

		const { firstPaymentDate, lastPaymentDate } = getPayablesDateRange(currentReport.steps)

		await InvoicingPayables.updateOne({_id: reportId },
				{$set: {firstPaymentDate, lastPaymentDate}})

		await Projects.updateOne(
				{ 'steps._id': stepId  },
				{ 'steps.$[i].isInReportPayables': false },
				{ arrayFilters: [ { 'i._id': stepId } ] })

	} catch (e) {
		console.log(e)
	}
}

const payableDelete = async (reportId) => {
	const DIR = './dist/vendorReportsFiles/'
	const reporotInfo = await InvoicingPayables.findOne({ _id: reportId })
	const steps = reporotInfo ? reporotInfo.steps : []
	await Projects.updateMany(
			{ 'steps._id': {$in: steps}  },
			{ 'steps.$[i].isInReportPayables': false },
			{ arrayFilters: [ { 'i._id': {$in: steps} } ] })

	await InvoicingPayables.deleteOne({_id: reportId})
	await removeDir(DIR, reportId)

}
module.exports = {  payableDeleteStep, payableDelete }
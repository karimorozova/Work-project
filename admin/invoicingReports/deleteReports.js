const { InvoicingReports, Projects } = require("../models")
const { getReportProjectsAndSteps, getReportsDateRange } = require("./getReports")
const { removeDir } = require("./reportsFilesAndDirecrory")


const reportDeleteStep = async (reportId, stepId) => {
	try {
		await InvoicingReports.updateOne({_id: reportId },{$pull: {'steps': stepId} })
		const currentReport = (await getReportProjectsAndSteps(reportId)).pop()

		const { firstPaymentDate, lastPaymentDate } = getReportsDateRange(currentReport.steps)

		await InvoicingReports.updateOne({_id: reportId },
				{$set: {firstPaymentDate, lastPaymentDate}})

		await Projects.updateOne(
				{ 'steps._id': stepId  },
				{ 'steps.$[i].isInReportPayables': false },
				{ arrayFilters: [ { 'i._id': stepId } ] })

	} catch (e) {
		console.log(e)
	}
}

const reportDelete = async (reportId) => {
	const reporotInfo = await InvoicingReports.findOne({ _id: reportId })
	const steps = reporotInfo ? reporotInfo.steps : []
	await Projects.updateMany(
			{ 'steps._id': {$in: steps}  },
			{ 'steps.$[i].isInReportPayables': false },
			{ arrayFilters: [ { 'i._id': {$in: steps} } ] })

	await InvoicingReports.deleteOne({_id: reportId})
	await removeDir(reportId)

}
module.exports = {  reportDeleteStep, reportDelete }
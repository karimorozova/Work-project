const { InvoicingReports, Projects } = require("../models")
const { getReportProjectsAndSteps, getReportsDateRange } = require("./getReports")


const reportDeleteStep = async (reportId, stepId) => {
	try {
		await InvoicingReports.updateOne({_id: reportId },{$pull: {'steps': stepId} })
		const currentReport = (await getReportProjectsAndSteps(reportId)).pop()

		const { firstPaymentDate, lastPaymentDate } = getReportsDateRange(currentReport.steps)

		await InvoicingReports.updateOne({_id: reportId },
				{$set: {firstPaymentDate, lastPaymentDate}})

		await Projects.updateOne(
				{ 'steps._id': stepId  },
				{ 'steps.$[i].isInReports': false },
				{ arrayFilters: [ { 'i._id': stepId } ] })

	} catch (e) {
		console.log(e)
	}



}
module.exports = {  reportDeleteStep }
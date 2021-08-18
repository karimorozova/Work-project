const { InvoicingReports, Projects } = require("../models")

const reportDeleteStep = async (reportId, stepId) => {
	try {
		await InvoicingReports.updateOne({_id: reportId },
				{$pull: {'steps': stepId} })

		await Projects.updateOne(
				{ 'steps._id': stepId  },
				{ 'steps.$[i].isInReports': false },
				{ arrayFilters: [ { 'i._id': stepId } ] })

	} catch (e) {

	}
}
module.exports = {  reportDeleteStep }
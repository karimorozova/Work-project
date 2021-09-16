const { InvoicingReceivables, Projects } = require("../models")
const { removeDir } = require("../invoicingPayables/PayablesFilesAndDirecrory")

const receivableDelete = async (reportId) => {
	const receivables = await InvoicingReceivables.findOne({ _id: reportId })
	const steps = receivables ? receivables.stepsAndProjects.map(({step}) => step) : []
	await Projects.updateMany(
			{ 'steps._id': {$in: steps}  },
			{ 'steps.$[i].isInReportReceivables': false },
			{ arrayFilters: [ { 'i._id': {$in: steps} } ] })

	await InvoicingReceivables.deleteOne({_id: reportId})
	await removeDir(reportId)
}
module.exports = { receivableDelete }
const { InvoicingPayables, Projects } = require("../models")
const { getPayablesProjectsAndSteps, getPayablesDateRange } = require("./getPayables")
const { removeDir } = require("./PayablesFilesAndDirecrory")


const payableDeleteSteps = async (reportId, stepsId) => {
	try {
		for (const stepId of stepsId) {
			let { total, steps: reportSteps } = await InvoicingPayables.findOne({ _id: reportId })
			const { steps } = await Projects.findOne({ 'steps._id': stepId })
			const { nativeFinance: { Price: { payables } } } = steps.find(({ _id }) => `${ _id }` === `${ stepId }`)

			total = reportSteps.length === 1 ? 0 : +(total - payables).toFixed(2)
			await InvoicingPayables.updateOne({ _id: reportId }, { $set: { total }, $pull: { 'steps': stepId } })
		}

		const [ updatedPayableReport ] = await getPayablesProjectsAndSteps(reportId)
		const { firstPaymentDate, lastPaymentDate } = getPayablesDateRange(updatedPayableReport.steps)
		await InvoicingPayables.updateOne(
				{ _id: reportId },
				{ $set: { firstPaymentDate, lastPaymentDate } }
		)
		await Projects.updateOne(
				{ 'steps._id': { $in: stepsId } },
				{ 'steps.$[i].isInReportPayables': false },
				{ arrayFilters: [ { 'i._id': { $in: stepsId } } ] }
		)
	} catch (e) {
		console.log(e)
	}
}

const payableDelete = async (reportId) => {
	const DIR = './dist/vendorReportsFiles/'
	const reportInfo = await InvoicingPayables.findOne({ _id: reportId })
	const steps = reportInfo ? reportInfo.steps : []
	await Projects.updateMany(
			{ 'steps._id': { $in: steps } },
			{ 'steps.$[i].isInReportPayables': false },
			{ arrayFilters: [ { 'i._id': { $in: steps } } ] }
	)
	await InvoicingPayables.deleteOne({ _id: reportId })
	await removeDir(DIR, reportId)
}
module.exports = { payableDeleteSteps, payableDelete }
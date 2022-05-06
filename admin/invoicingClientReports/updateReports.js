const { InvoicingClientReports } = require("../models")

const { removeDir } = require("../invoicingPayables/PayablesFilesAndDirecrory")
const { bindingStepsInReportsByOptions, getStepFromProject, recalculateReportDatesRange, setInvoiceIdToSteps } = require("./helpers")

const deleteReport = async (reportId) => {
	try {
		const DIR = './dist/clientReportsFiles/'
		const receivables = await InvoicingClientReports.findOne({ _id: reportId })
		const steps = receivables
				? receivables.stepsAndProjects.map(({ step }) => step)
				: []

		for await (const stepId of steps) await bindingStepsInReportsByOptions(stepId, false, null)
		await setInvoiceIdToSteps([reportId], null)
		await InvoicingClientReports.deleteOne({ _id: reportId })
		await removeDir(DIR, reportId)
	} catch (e) {
		console.log(e)
	}
}

const deleteStepFromReport = async (reportId, stepsId) => {
	try {
		for (const stepId of stepsId) {
			let { total, stepsAndProjects } = await InvoicingClientReports.findOne({ _id: reportId })
			const { step } = await getStepFromProject(stepId)
			const { finance: { Price: { receivables } } } = step
			total = stepsAndProjects.length === 1 ? 0 : +(total - receivables).toFixed(2)
			await InvoicingClientReports.updateOne({ _id: reportId }, {
				$set: { total },
				$pull: { 'stepsAndProjects': { "step": stepId } }
			})
			await bindingStepsInReportsByOptions(stepId, false, null)
		}
		await setInvoiceIdToSteps([reportId], null)
		await recalculateReportDatesRange(reportId)
	} catch (e) {
		console.log(e)
	}
}

const addStepToReport = async (reportId, stepsId) => {
	try {
		for (const stepId of stepsId) {
			let { total } = await InvoicingClientReports.findOne({ _id: reportId })
			const { step, project: { _id: _projectId } } = await getStepFromProject(stepId)
			const { finance: { Price: { receivables } } } = step
			total = +(total + receivables).toFixed(2)
			await InvoicingClientReports.updateOne({ _id: reportId }, {
				$set: { total },
				$push: { 'stepsAndProjects': { step: stepId, project: _projectId, type: step.vendor ? 'Classic' : 'Extra' } }
			})
			await bindingStepsInReportsByOptions(stepId, true, reportId)
		}
		await recalculateReportDatesRange(reportId)
	} catch (e) {
		console.log(e)
	}
}

module.exports = {
	deleteReport,
	deleteStepFromReport,
	addStepToReport
}
const { InvoicingReceivables, Projects } = require("../models")
const { removeDir } = require("../invoicingPayables/PayablesFilesAndDirecrory")
const { getReportById } = require('../invoicingReceivables/getReceivables')
const { deleteZohoInvoice } = require('../invoicingReceivables/zoho')
const moment = require('moment')

const receivableDelete = async (reportId) => {
	const DIR = './dist/clientReportsFiles/'
	const receivables = await InvoicingReceivables.findOne({ _id: reportId })
	const steps = receivables ? receivables.stepsAndProjects.map(({ step }) => step) : []
	await Projects.updateMany(
			{ 'steps._id': { $in: steps } },
			{ 'steps.$[i].isInReportReceivables': false },
			{ arrayFilters: [ { 'i._id': { $in: steps } } ] })

	if (receivables.externalIntegration._id.length) {
		await deleteZohoInvoice(receivables.externalIntegration._id)
	}

	await InvoicingReceivables.deleteOne({ _id: reportId })

	await removeDir(DIR, reportId)
}


const deleteStepFromReport = async (reportId, stepId) => {
	try {
		await InvoicingReceivables.updateOne({ _id: reportId }, { $pull: { 'stepsAndProjects': {"step":stepId} } })

		const [ report ] = await getReportById(reportId)
		let { stepsWithProject } = report

		const { firstPaymentDate, lastPaymentDate } = stepsWithProject.reduce((acc, { deadline }) => {
			acc.firstPaymentDate = moment.min(moment(deadline.toString()), moment(acc.firstPaymentDate)).toISOString()
			acc.lastPaymentDate = moment.max(moment(deadline.toString()), moment(acc.lastPaymentDate)).toISOString()
			return acc
		}, { firstPaymentDate: moment().add(20, 'years').toISOString(), lastPaymentDate: moment().subtract(20, 'years') })

		await InvoicingReceivables.updateOne({ _id: reportId }, { $set: { firstPaymentDate, lastPaymentDate } })

		await Projects.updateOne(
				{ 'steps._id': stepId },
				{ 'steps.$[i].isInReportReceivables': false },
				{ arrayFilters: [ { 'i._id': stepId } ] }
		)

	} catch (e) {
		console.log(e)
	}
}

module.exports = {
	receivableDelete,
	deleteStepFromReport
}
const { InvoicingReceivables, Projects } = require("../models")
const { removeDir } = require("../invoicingPayables/PayablesFilesAndDirecrory")
const { deleteZohoInvoice } = require('../invoicingReceivables/zoho')
const moment = require('moment')
const { getAllReportsFromDb } = require("../invoicingReceivables/getReceivables")
const { ObjectID: ObjectId } = require("mongodb")

const receivableDelete = async (reportId) => {
	const DIR = './dist/clientReportsFiles/'
	const receivables = await InvoicingReceivables.findOne({ _id: reportId })
	const steps = receivables ? receivables.stepsAndProjects.map(({ step }) => step) : []

	for await (const stepId of steps) await unbindStepsFromReportByProjectMutation(stepId)

	if (receivables.externalIntegration._id.length) await deleteZohoInvoice(receivables.externalIntegration._id)

	await InvoicingReceivables.deleteOne({ _id: reportId })

	await removeDir(DIR, reportId)
}

const deleteStepFromReport = async (reportId, stepId) => {
	try {
		await InvoicingReceivables.updateOne({ _id: reportId }, { $pull: { 'stepsAndProjects': { "step": stepId } } })
		const [ report ] = await getAllReportsFromDb(0, 1, { _id: ObjectId(reportId) })
		let { stepsWithProject } = report

		const { firstPaymentDate, lastPaymentDate } = stepsWithProject.reduce((acc, { deadline }) => {
			acc.firstPaymentDate = moment.min(moment(deadline.toString()), moment(acc.firstPaymentDate)).toISOString()
			acc.lastPaymentDate = moment.max(moment(deadline.toString()), moment(acc.lastPaymentDate)).toISOString()
			return acc
		}, {
			firstPaymentDate: moment().add(20, 'years').toISOString(),
			lastPaymentDate: moment().subtract(20, 'years')
		})

		await InvoicingReceivables.updateOne({ _id: reportId }, { $set: { firstPaymentDate, lastPaymentDate } })

		await unbindStepsFromReportByProjectMutation(stepId)

	} catch (e) {
		console.log(e)
	}
}

const unbindStepsFromReportByProjectMutation = async (stepId) => {
	const isClassic = await Projects.findOne({ "steps._id": stepId })
	const isExtra = await Projects.findOne({ "additionsSteps._id": stepId })

	if (isClassic) await Projects.updateOne(
			{ 'steps._id': stepId },
			{ 'steps.$[i].isInReportReceivables': false },
			{ arrayFilters: [ { 'i._id': stepId } ] }
	)
	if (isExtra) await Projects.updateOne(
			{ 'additionsSteps._id': stepId },
			{ 'additionsSteps.$[i].isInReportReceivables': false },
			{ arrayFilters: [ { 'i._id': stepId } ] }
	)
}

module.exports = {
	receivableDelete,
	deleteStepFromReport
}
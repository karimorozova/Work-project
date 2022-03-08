const { InvoicingClientReports } = require("../models")
const { ObjectID: ObjectId } = require("mongodb")
const moment = require("moment")

const { removeDir } = require("../invoicingPayables/PayablesFilesAndDirecrory")
const { unbindStepsFromReportByProjectMutation } = require("./helpers")
const { getAllReportsFromDb } = require("./getReports")

const deleteReport = async (reportId) => {
	try {
		const DIR = './dist/clientReportsFiles/'
		const receivables = await InvoicingClientReports.findOne({ _id: reportId })
		const steps = receivables
				? receivables.stepsAndProjects.map(({ step }) => step)
				: []

		for await (const stepId of steps) await unbindStepsFromReportByProjectMutation(stepId)
		await InvoicingClientReports.deleteOne({ _id: reportId })
		await removeDir(DIR, reportId)
	} catch (e) {
		console.log(e)
	}
}

const deleteStepFromReport = async (reportId, stepId) => {
	try {
		await InvoicingClientReports.updateOne(
				{ _id: reportId },
				{ $pull: { 'stepsAndProjects': { "step": stepId } } }
		)
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

		await InvoicingClientReports.updateOne(
				{ _id: reportId },
				{ $set: { firstPaymentDate, lastPaymentDate } }
		)
		await unbindStepsFromReportByProjectMutation(stepId)
	} catch (e) {
		console.log(e)
	}
}


module.exports = {
	deleteReport,
	deleteStepFromReport
}
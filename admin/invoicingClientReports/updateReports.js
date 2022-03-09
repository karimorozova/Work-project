const { InvoicingClientReports, Projects } = require("../models")
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

const deleteStepFromReport = async (reportId, stepsId) => {
	try {
		for (const stepId of stepsId) {
			let { total, stepsAndProjects } = await InvoicingClientReports.findOne({ _id: reportId })
			const classicProject = await Projects.findOne({ "steps._id": stepId })
			const extraProject = await Projects.findOne({ "additionsSteps._id": stepId })

			let step = {}
			if (classicProject) step = classicProject.steps.find(({ _id }) => `${ _id }` === `${ stepId }`)
			if (extraProject) step = extraProject.additionsSteps.find(({ _id }) => `${ _id }` === `${ stepId }`)

			const { finance: { Price: { receivables } } } = step
			total = stepsAndProjects.length === 1 ? 0 : +(total - receivables).toFixed(2)
			await InvoicingClientReports.updateOne({ _id: reportId }, {
				$set: { total },
				$pull: { 'stepsAndProjects': { "step": stepId } }
			})
			await unbindStepsFromReportByProjectMutation(stepId)
		}

		const [ { stepsWithProject } ] = await getAllReportsFromDb(0, 1, { _id: ObjectId(reportId) })
		const { firstPaymentDate, lastPaymentDate } = stepsWithProject.reduce((acc, { deadline }) => {
			acc.firstPaymentDate = moment.min(moment(deadline.toString()), moment(acc.firstPaymentDate)).toISOString()
			acc.lastPaymentDate = moment.max(moment(deadline.toString()), moment(acc.lastPaymentDate)).toISOString()
			return acc
		}, {
			firstPaymentDate: moment().add(20, 'years').toISOString(),
			lastPaymentDate: moment().subtract(20, 'years')
		})
		await InvoicingClientReports.updateOne({ _id: reportId }, { $set: { firstPaymentDate, lastPaymentDate } })
	} catch (e) {
		console.log(e)
	}
}

const addStepToReport = async (reportId, checkedSteps) => {
	console.log(reportId, checkedSteps)
}

module.exports = {
	deleteReport,
	deleteStepFromReport,
	addStepToReport
}
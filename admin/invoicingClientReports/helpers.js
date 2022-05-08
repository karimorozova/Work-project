const { Projects, InvoicingClientReports } = require("../models")
const { getAllReportsFromDb } = require("./getReports")
const { ObjectID: ObjectId } = require("mongodb")
const moment = require("moment")

const bindingStepsInReportsByOptions = async (stepId, option, reportId = null) => {
	const isClassic = await Projects.findOne({ "steps._id": stepId })
	const isExtra = await Projects.findOne({ "additionsSteps._id": stepId })

	if (isClassic)
		await Projects.updateOne(
				{ "steps._id": stepId },
				{ "steps.$[i].isInReportReceivables": option, "steps.$[i].reportId": reportId   },
				{ arrayFilters: [ { "i._id": stepId } ] }
		)
	if (isExtra)
		await Projects.updateOne(
				{ "additionsSteps._id": stepId },
				{ "additionsSteps.$[i].isInReportReceivables": option, "steps.$[i].reportId": reportId  },
				{ arrayFilters: [ { "i._id": stepId } ] }
		)
}

const setInvoiceIdToSteps = async (reportIds, invoiceId) => {
	if (!reportIds.length || !invoiceId) return
	await Projects.updateMany({"steps.reportId": {$in: reportIds.map(id => ObjectId(id))}}, {$set: {"steps.$[i].invoiceId":  invoiceId}}, {arrayFilters: [{'i.reportId': {$in:reportIds}}]})
	await Projects.updateMany({"additionsSteps.reportId": {$in: reportIds.map(id => ObjectId(id))}}, {$set: {"additionsSteps.$[i].invoiceId":  invoiceId}}, {arrayFilters: [{'i.reportId': {$in:reportIds}}]})
}

const getStepFromProject = async stepId => {
	const classicProject = await Projects.findOne({ "steps._id": stepId })
	const extraProject = await Projects.findOne({ "additionsSteps._id": stepId })
	if (classicProject) return {
		project: classicProject,
		step: classicProject.steps.find(({ _id }) => `${ _id }` === `${ stepId }`)
	}
	if (extraProject) return {
		project: extraProject,
		step: extraProject.additionsSteps.find(({ _id }) => `${ _id }` === `${ stepId }`)
	}
}

const recalculateReportDatesRange = async reportId => {
	const [ { stepsWithProject } ] = await getAllReportsFromDb(0, 1, { _id: ObjectId(reportId) })
	const { firstPaymentDate, lastPaymentDate } = stepsWithProject.reduce((acc, { billingDate }) => {
		acc.firstPaymentDate = moment.min(
				moment(billingDate),
				moment(acc.firstPaymentDate)
		).toISOString()
		acc.lastPaymentDate = moment.max(
				moment(billingDate),
				moment(acc.lastPaymentDate)
		).toISOString()
		return acc
	}, {
		firstPaymentDate: moment().add(20, 'years').toISOString(),
		lastPaymentDate: moment().subtract(20, 'years')
	})
	await InvoicingClientReports.updateOne({ _id: reportId }, { $set: { firstPaymentDate, lastPaymentDate } })
}

module.exports = {
	recalculateReportDatesRange,
	bindingStepsInReportsByOptions,
	getStepFromProject,
	setInvoiceIdToSteps,
}

const { InvoicingPayables, Projects } = require("../models")
const moment = require("moment")
const { INVOICING_STATUSES } = require("./enum")
const { getPayablesProjectsAndSteps, getPayablesDateRange } = require("./getPayables")
const { createDir } = require("./PayablesFilesAndDirecrory")

const payablesAddSteps = async (reportId, stepsId) => {
	await InvoicingPayables.updateOne({_id: reportId }, {$push: {'steps': {$each: stepsId}} })

	const currentPayable = (await getPayablesProjectsAndSteps(reportId)).pop()

	const { firstPaymentDate, lastPaymentDate } = getPayablesDateRange(currentPayable.steps)

	await InvoicingPayables.updateOne({_id: reportId },
			{$set: {firstPaymentDate, lastPaymentDate}})

	await Projects.updateMany(
			{ 'steps._id': { $in: stepsId } },
			{ 'steps.$[i].isInReportPayables': true },
			{ arrayFilters: [ { 'i._id': { $in: stepsId } } ] })
}


const addStepsToPayables = async (projects, createdBy) => {
	let groupedProjectsByVendor = {}

	const stepsVendors = projects.map(({ currentVendor }) => currentVendor._id )
	const existsVendors = (await InvoicingPayables.find({vendor: {$in: stepsVendors}, $or: [{status: 'Created'}, {status: 'Sent'}]}, {vendor: 1, firstPaymentDate: 1, lastPaymentDate: 1}, {lean: 'toObject'}))



	const lastIndex = await InvoicingPayables.findOne().sort({ 'reportId': -1 })
	let lastIntIndex = lastIndex != null ? parseInt(lastIndex.reportId.split('_').pop()) : 100
	let allSteps = []
	for (const project of projects) {
		const projectVendorId = project.currentVendor._id
		allSteps.push(project.steps._id)
		if (groupedProjectsByVendor.hasOwnProperty(projectVendorId)) {
			const currentProject = groupedProjectsByVendor[projectVendorId]
			currentProject.steps.push(project.steps._id)
			currentProject.firstPaymentDate = moment.min(moment(currentProject.firstPaymentDate), moment(project.billingDate)).toISOString()
			currentProject.lastPaymentDate = moment.max(moment(currentProject.lastPaymentDate), moment(project.billingDate)).toISOString()
		} else {
			groupedProjectsByVendor[projectVendorId] = {
				vendor: projectVendorId,
				status: INVOICING_STATUSES.CREATED,
				steps: [ project.steps._id ],
				firstPaymentDate: project.billingDate,
				lastPaymentDate: project.billingDate,
				file: {},
				createdBy: createdBy,
				updatedBy: createdBy,
				createdAt: moment().toISOString(),
				updatedAt: moment().toISOString()
			}
		}
	}


	for await (const report of Object.values(groupedProjectsByVendor)) {
		const foundInDB = existsVendors.find(({vendor}) => vendor.toString() === report.vendor.toString())

		if ( foundInDB  && foundInDB.hasOwnProperty('_id')) {
			const firstPaymentDate =  moment.min(moment(foundInDB.firstPaymentDate), moment(report.firstPaymentDate)).toISOString()
			const lastPaymentDate =  moment.max(moment(foundInDB.lastPaymentDate), moment(report.lastPaymentDate)).toISOString()
			await  InvoicingPayables.updateOne({_id: foundInDB._id}, {$set: {lastPaymentDate, firstPaymentDate}, $push: {steps: {$each: report.steps}}} )
		} else {
			const { _id } = await InvoicingPayables.create({...report, reportId: 'RPT_' + (++lastIntIndex + '').padStart(6, "0")})
			await createDir(_id.toString())
		}

		await Projects.updateMany(
				{ 'steps._id': { $in: allSteps } },
				{ 'steps.$[i].isInReportPayables': true },
				{ arrayFilters: [ { 'i._id': { $in: allSteps } } ] })
	}
}

module.exports = { payablesAddSteps, addStepsToPayables}

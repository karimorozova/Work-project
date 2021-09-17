const { InvoicingReceivables, Projects } = require('../models')
const _ = require('lodash')
const moment = require("moment")

const createReports = async ({ checkedSteps, createdBy }) => {
	const reportsFromDB = await InvoicingReceivables.find({ status: 'Created' })
	const lastIndex = await InvoicingReceivables.findOne().sort({ 'reportId': -1 })

	let lastIntIndex = lastIndex != null
			? parseInt(lastIndex.reportId.split('_').pop())
			: 1

	await setUsedStatusToSteps(checkedSteps.map(({ steps }) => steps._id))

	const [ jobsPPP, jobsPrePayment, jobsMonthly, jobsCustom ] = [
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'PPP'),
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'Pre-Payment'),
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'Monthly'),
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'Custom')
	]

	const { temp: PPP, updatedReports: updatedReports1, lastIntIndex: lastIntIndex1 } = produceReportPerProject(jobsPPP, reportsFromDB, lastIntIndex, createdBy)
	const { temp: prePayment, updatedReports: updatedReports2, lastIntIndex: lastIntIndex2 } = produceReportPerProject(jobsPrePayment, updatedReports1, lastIntIndex1, createdBy)
	const { temp: monthly, updatedReports: updatedReports3, lastIntIndex: lastIntIndex3 } = produceReportManyProjects(jobsMonthly, updatedReports2, lastIntIndex2, createdBy)
	const { temp: custom, updatedReports: updatedReports4 } = produceReportManyProjects(jobsCustom, updatedReports3, lastIntIndex3, createdBy)

	await InvoicingReceivables.create(
			...PPP,
			...prePayment,
			...monthly,
			...custom,
			...updatedReports4
	)
}

const produceReportManyProjects = (jobs, reportsDB, lastIntIndex, createdBy) => {
	const temp = []
	const updatedReports = [ ...reportsDB ]
	const getIndex = (arr, clientBillingInfo) => arr.findIndex(({ clientBillingInfo: _clientBillingInfo }) => `${ clientBillingInfo }` === `${ _clientBillingInfo }`)

	jobs.forEach(element => {
		const { steps: { _id: nativeStepId }, _id: nativeProjectId, clientBillingInfo } = element

		const _dbIndex = getIndex(updatedReports, clientBillingInfo)
		if (_dbIndex === -1) {

			const _tmpIndex = getIndex(temp, clientBillingInfo, nativeProjectId)
			if (_tmpIndex === -1) {
				temp.push({
					...getFirstReportStructureFromElement(element),
					reportId: 'RPT_' + (++lastIntIndex + '').padStart(6, "0"),
					createdBy: createdBy,
					updatedBy: createdBy
				})
			} else {
				changePaymentRange(temp[_tmpIndex], element)
				refreshUpdatedInfo(temp[_tmpIndex], createdBy)

				temp[_tmpIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })
			}

		} else {
			changePaymentRange(updatedReports[_dbIndex], element)
			refreshUpdatedInfo(updatedReports[_dbIndex], createdBy)

			updatedReports[_dbIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })
		}
	})
	return {
		temp,
		updatedReports,
		lastIntIndex
	}
}

const produceReportPerProject = (jobs, reportsDB, lastIntIndex, createdBy) => {
	const temp = []
	const updatedReports = [ ...reportsDB ]

	jobs.forEach(element => {
		const { steps: { _id: nativeStepId }, _id: nativeProjectId, clientBillingInfo } = element

		const _dbIndex = getIndex(updatedReports, clientBillingInfo, nativeProjectId)
		if (_dbIndex === -1) {

			const _tmpIndex = getIndex(temp, clientBillingInfo, nativeProjectId)
			if (_tmpIndex === -1) {
				temp.push({
					...getFirstReportStructureFromElement(element),
					reportId: 'RPT_' + (++lastIntIndex + '').padStart(6, "0"),
					createdBy: createdBy,
					updatedBy: createdBy
				})
			} else {
				changePaymentRange(temp[_tmpIndex], element)
				refreshUpdatedInfo(temp[_tmpIndex], createdBy)

				temp[_tmpIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })
			}

		} else {
			changePaymentRange(updatedReports[_dbIndex], element)
			refreshUpdatedInfo(updatedReports[_dbIndex], createdBy)

			updatedReports[_dbIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })
		}
	})

	return {
		temp,
		updatedReports,
		lastIntIndex
	}

	function getIndex(arr, clientBillingInfo, nativeProjectId) {
		return arr.findIndex(({ clientBillingInfo: _clientBillingInfo, stepsAndProjects }) =>
				`${ clientBillingInfo }` === `${ _clientBillingInfo }` && stepsAndProjects.map(({ project }) => `${ project }`).includes(`${ nativeProjectId }`))
	}
}

const getFirstReportStructureFromElement = (element) => {
	const { customer: client, clientBillingInfo, steps, _id, startDate, deadline } = element
	return {
		client,
		status: 'Created',
		clientBillingInfo,
		stepsAndProjects: [ { step: steps._id, project: _id } ],
		firstPaymentDate: startDate,
		lastPaymentDate: deadline
	}
}
const setUsedStatusToSteps = async (allStepsIds) => {
	await Projects.updateMany(
			{ 'steps._id': { $in: allStepsIds } },
			{ 'steps.$[i].isInReportReceivables': true },
			{ arrayFilters: [ { 'i._id': { $in: allStepsIds } } ] })
}

function changePaymentRange(tempElement, element) {
	tempElement.firstPaymentDate = moment.min(moment(element.deadline.toString()), moment(tempElement.firstPaymentDate)).toISOString()
	tempElement.lastPaymentDate = moment.max(moment(element.deadline.toString()), moment(tempElement.lastPaymentDate)).toISOString()
}

function refreshUpdatedInfo(tempElement, createdBy) {
	tempElement.updatedBy = createdBy
	tempElement.updatedAt = new Date()
}


module.exports = { createReports }
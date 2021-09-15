const { InvoicingReceivables } = require('../models')
const _ = require('lodash')


const createReports = async ({ checkedSteps, createdBy }) => {
	const reportsFromDB = await InvoicingReceivables.find({ status: 'Created' })

	const [ jobsPPP, jobsPrePayment, jobsMonthly ] = [
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'PPP'),
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'Pre-Payment'),
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'Monthly')
	]

	const { temp: PPP, updatedReports: updatedReports1 } = await produceReportPerProject(jobsPPP, reportsFromDB)
	const { temp: prePayment, updatedReports: updatedReports2 } = await produceReportPerProject(jobsPrePayment, updatedReports1)
	const { temp: monthly, updatedReports: updatedReports3 } = await produceReportManyProjects(jobsMonthly, updatedReports2)
	const { temp: custom, updatedReports: updatedReports4 } = await produceReportManyProjects(jobsMonthly, updatedReports3)

	await InvoicingReceivables.create(
			...PPP,
			...prePayment,
			...monthly,
			...custom,
			...updatedReports4
	)
}

const produceReportManyProjects = (jobs, reportsDB) => {
	const temp = []
	const updatedReports = [ ...reportsDB ]
	const getIndex = (arr, clientBillingInfo) => arr.findIndex(({ clientBillingInfo: _clientBillingInfo }) => `${ clientBillingInfo }` === `${ _clientBillingInfo }`)

	jobs.forEach(element => {
		const { steps: { _id: nativeStepId }, _id: nativeProjectId, clientBillingInfo } = element

		const _dbIndex = getIndex(updatedReports, clientBillingInfo)
		if (_dbIndex === -1) {

			const _tmpIndex = getIndex(temp, clientBillingInfo, nativeProjectId)
			_tmpIndex === -1
					? temp.push(getFirstReportStructureFromElement(element))
					: temp[_tmpIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })

		} else {
			updatedReports[_dbIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })
		}
	})

	return {
		temp,
		updatedReports
	}
}

const produceReportPerProject = (jobs, reportsDB) => {
	const temp = []
	const updatedReports = [ ...reportsDB ]

	jobs.forEach(element => {
		const { steps: { _id: nativeStepId }, _id: nativeProjectId, clientBillingInfo } = element

		const _dbIndex = getIndex(updatedReports, clientBillingInfo, nativeProjectId)
		if (_dbIndex === -1) {

			const _tmpIndex = getIndex(temp, clientBillingInfo, nativeProjectId)
			_tmpIndex === -1
					? temp.push(getFirstReportStructureFromElement(element))
					: temp[_tmpIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })

		} else {
			updatedReports[_dbIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })
		}
	})

	return {
		temp,
		updatedReports
	}

	function getIndex(arr, clientBillingInfo, nativeProjectId) {
		return arr.findIndex(({ clientBillingInfo: _clientBillingInfo, stepsAndProjects }) =>
				`${ clientBillingInfo }` === `${ _clientBillingInfo }` && stepsAndProjects.map(({ project }) => `${ project }`).includes(`${ nativeProjectId }`))
	}
}

const getFirstReportStructureFromElement = (element) => {
	const { customer: client, clientBillingInfo, steps, _id } = element

	return {
		reportId: 'FOO',
		client,
		status: 'Created',
		clientBillingInfo,
		stepsAndProjects: [ { step: steps._id, project: _id } ],
		firstPaymentDate: null,
		lastPaymentDate: null,
		createdBy: null,
		updatedBy: null,
		createAt: null,
		updatedAt: null
	}
}

module.exports = { createReports }
const { InvoicingReceivables } = require('../models')
const _ = require('lodash')


const createReports = async ({ checkedSteps, createdBy }) => {
	// console.log(checkedSteps)

	const reportsFromDB = await InvoicingReceivables.find({})

	const [ reportsPPP, reportsPrePayment] = [
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'PPP'),
		checkedSteps.filter(({ paymentProfile }) => paymentProfile === 'Pre-Payment')
	]

	// const { temp, updatedReportsDB } = await produceReportPerProject(reportsPPP, reportsFromDB)
	// const { temp: temp2, updatedReportsDB: updatedReportsDB2 } = await produceReportPerProject(reportsPrePayment, reportsFromDB)

	console.log(
			await produceReportPerProject(reportsPPP, reportsFromDB),
			await produceReportPerProject(reportsPrePayment, reportsFromDB)
	)

	// console.log('TEMP', temp, updatedReportsDB)
	// await InvoicingReceivables.create(...temp, ...updatedReportsDB)
	// await InvoicingReceivables.create(reportsFromDB)
	// console.log(checkedProjects)
	// console.log( _.chain(checkedProjects).groupBy('clientBillingInfo').map((value, key) => ({ clientBillingInfo: key, rest: value })).value() )
}

const produceReportPerProject = (reportsPPP, reportsDB) => {
	const temp = []
	const updatedReportsDB = [ ...reportsDB ]

	reportsPPP.forEach(element => {
		const { steps: { _id: nativeStepId }, _id: nativeProjectId, clientBillingInfo } = element

		const _dbIndex = getIndex(updatedReportsDB, clientBillingInfo, nativeProjectId)
		if (_dbIndex === -1) {

			const _tmpIndex = getIndex(temp, clientBillingInfo, nativeProjectId)
			_tmpIndex === -1
					? temp.push(getFirstReportStructureFromElement(element))
					: temp[_tmpIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })

		} else {
			updatedReportsDB[_dbIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId })
		}
	})

	return {
		temp,
		updatedReportsDB
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
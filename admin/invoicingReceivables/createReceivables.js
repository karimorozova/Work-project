const { InvoicingReceivables } = require('../models')
const _ = require('lodash')


const createReports = async ({ checkedProjects, createdBy }) => {
	const reportsDB = await InvoicingReceivables.find({})

	const [ reportsPPP ] = [ checkedProjects.filter(({ paymentProfile }) => paymentProfile === 'PPP') ]

	const { temp, updatedReportsDB } = await producePPP(reportsPPP, reportsDB)

	await InvoicingReceivables.create(...temp, ...updatedReportsDB)

	// await InvoicingReceivables.create({
	// 	clientBillingInfo
	// })

	// console.log(checkedProjects)
	// console.log( _.chain(checkedProjects).groupBy('clientBillingInfo').map((value, key) => ({ clientBillingInfo: key, rest: value })).value() )
}

const producePPP = (reportsPPP, reportsDB) => {
	const temp = []
	const updatedReportsDB = [ ...reportsDB ]

	reportsPPP.forEach(element => {
		const { taskId, projectId } = element.tasks
		const _dbIndex = getIndex(updatedReportsDB, element)

		if (_dbIndex === -1) {
			const _tmpIndex = getIndex(temp, element)
			_tmpIndex === -1
					? temp.push(getReportSaveStructureFromElement(element))
					: temp[_tmpIndex].tasks.push({ taskId, projectId })
		} else {
			updatedReportsDB[_dbIndex].tasks.push({ taskId, projectId })
		}
	})

	return {
		temp,
		updatedReportsDB
	}

	function getIndex(arr, item) {
		return arr.findIndex(({ clientBillingInfo, tasks }) =>
				`${ clientBillingInfo }` === `${ item.clientBillingInfo }` && tasks.map(({ projectId }) => projectId).includes(item.projectId))
	}
}

const getReportSaveStructureFromElement = ({ customer, clientBillingInfo, tasks, projectId }) => {
	return {
		reportId: 'FOO',
		client: customer,
		status: 'Created',
		clientBillingInfo,
		tasks: [ { taskId: tasks.taskId, projectId } ],
		firstPaymentDate: null,
		lastPaymentDate: null,
		createdBy: null,
		updatedBy: null,
		createAt: null,
		updatedAt: null
	}
}

module.exports = { createReports }
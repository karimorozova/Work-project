const { InvoicingClientReports, Projects } = require("../models")
const moment = require("moment")

const createReports = async ({ checkedSteps, createdBy }) => {
	// const reportsFromDB = await InvoicingClientReports.find({ status: 'Created' })
	const lastIndex = await InvoicingClientReports.findOne().sort({ 'reportId': -1 })
	let lastIntIndex = lastIndex != null ? parseInt(lastIndex.reportId.split('_c').pop()) : 0

	await setUsedStatusToSteps(checkedSteps.filter(i => i.type === 'Classic'), checkedSteps.filter(i => i.type === 'Extra'))

	const [ jobsPPP, jobsPrePayment, jobsMonthly, jobsCustom ] = [
		checkedSteps.filter(({ selectedBillingInfo }) => selectedBillingInfo.paymentType === 'PPP'),
		checkedSteps.filter(({ selectedBillingInfo }) => selectedBillingInfo.paymentType === 'Pre-Payment'),
		checkedSteps.filter(({ selectedBillingInfo }) => selectedBillingInfo.paymentType === 'Monthly'),
		checkedSteps.filter(({ selectedBillingInfo }) => selectedBillingInfo.paymentType === 'Custom')
	]

	const {
		temp: reportsPPP,
		updatedReports: updatedReports1,
		lastIntIndex: lastIntIndex1
	} = produceReportPerProject(jobsPPP, [], lastIntIndex, createdBy)

	const {
		temp: reportsPrePayment,
		updatedReports: updatedReports2,
		lastIntIndex: lastIntIndex2
	} = produceReportPerProject(jobsPrePayment, updatedReports1, lastIntIndex1, createdBy)

	const {
		temp: reportsMonthly,
		updatedReports: updatedReports3,
		lastIntIndex: lastIntIndex3
	} = produceReportManyProjects(jobsMonthly, updatedReports2, lastIntIndex2, createdBy)

	const {
		temp: reportsCustom,
		updatedReports: finalUpdatedReports
	} = produceReportManyProjects(jobsCustom, updatedReports3, lastIntIndex3, createdBy)

	await InvoicingClientReports.create(
			...reportsPPP,
			...reportsPrePayment,
			...reportsMonthly,
			...reportsCustom,
			...finalUpdatedReports
	)

	function produceReportManyProjects(jobs, reportsDB, lastIntIndex, createdBy) {
		const temp = []
		const updatedReports = [ ...reportsDB ]
		const getIndex = (arr, clientBillingInfo) => arr.findIndex(({ clientBillingInfo: _clientBillingInfo }) => `${ clientBillingInfo }` === `${ _clientBillingInfo }`)

		jobs.forEach(element => {
			const { steps: { _id: nativeStepId }, _id: nativeProjectId, clientBillingInfo, type } = element
			const _dbIndex = getIndex(updatedReports, clientBillingInfo)
			if (_dbIndex === -1) {
				const _tmpIndex = getIndex(temp, clientBillingInfo)
				if (_tmpIndex === -1) {
					temp.push({
						...getFirstReportStructureFromElement(element),
						reportId: 'RPT_c' + (++lastIntIndex + '').padStart(6, "0"),
						createdBy: createdBy,
						updatedBy: createdBy
					})
				} else {
					changePaymentRange(temp[_tmpIndex], element)
					refreshUpdatedInfo(temp[_tmpIndex], createdBy)
					temp[_tmpIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId, type })
				}
			} else {
				changePaymentRange(updatedReports[_dbIndex], element)
				refreshUpdatedInfo(updatedReports[_dbIndex], createdBy)
				updatedReports[_dbIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId, type })
			}
		})
		return {
			temp,
			updatedReports,
			lastIntIndex
		}
	}

	function produceReportPerProject(jobs, reportsDB, lastIntIndex, createdBy) {
		const temp = []
		const updatedReports = [ ...reportsDB ]
		const getIndex = (arr, clientBillingInfo, nativeProjectId) => arr.findIndex(({ clientBillingInfo: _clientBillingInfo, stepsAndProjects }) =>
				`${ clientBillingInfo }` === `${ _clientBillingInfo }` && stepsAndProjects.map(({ project }) => `${ project }`).includes(`${ nativeProjectId }`))

		jobs.forEach(element => {
			const { steps: { _id: nativeStepId }, _id: nativeProjectId, clientBillingInfo, type } = element
			const _dbIndex = getIndex(updatedReports, clientBillingInfo, nativeProjectId)
			if (_dbIndex === -1) {
				const _tmpIndex = getIndex(temp, clientBillingInfo, nativeProjectId)
				if (_tmpIndex === -1) {
					temp.push({
						...getFirstReportStructureFromElement(element),
						reportId: 'RPT_c' + (++lastIntIndex + '').padStart(6, "0"),
						createdBy: createdBy,
						updatedBy: createdBy
					})
				} else {
					changePaymentRange(temp[_tmpIndex], element)
					refreshUpdatedInfo(temp[_tmpIndex], createdBy)
					temp[_tmpIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId, type })
				}
			} else {
				changePaymentRange(updatedReports[_dbIndex], element)
				refreshUpdatedInfo(updatedReports[_dbIndex], createdBy)
				updatedReports[_dbIndex].stepsAndProjects.push({ step: nativeStepId, project: nativeProjectId, type })
			}
		})

		return {
			temp,
			updatedReports,
			lastIntIndex
		}
	}

	async function setUsedStatusToSteps(classicSteps, extraSteps) {
		classicSteps = classicSteps.map(({ steps }) => steps._id)
		extraSteps = extraSteps.map(({ steps }) => steps._id)

		if (classicSteps.length) await updateProjects('steps', classicSteps)
		if (extraSteps.length) await updateProjects('additionsSteps', extraSteps)

		async function updateProjects(key, value) {
			const key1 = `${ key }._id`
			const key2 = `${ key }.$[i].isInReportReceivables`
			await Projects.updateMany(
					{ [key1]: { $in: value } },
					{ [key2]: true },
					{ arrayFilters: [ { 'i._id': { $in: value } } ] }
			)
		}
	}

	function getFirstReportStructureFromElement(element) {
		const { customer: client, clientBillingInfo, steps, _id, startDate, deadline, type } = element
		return {
			client,
			status: 'Created',
			clientBillingInfo,
			stepsAndProjects: [ { step: steps._id, project: _id, type } ],
			firstPaymentDate: startDate,
			lastPaymentDate: deadline
		}
	}

	function changePaymentRange(tempElement, element) {
		tempElement.firstPaymentDate = moment.min(moment(element.deadline.toString()), moment(tempElement.firstPaymentDate)).toISOString()
		tempElement.lastPaymentDate = moment.max(moment(element.deadline.toString()), moment(tempElement.lastPaymentDate)).toISOString()
	}

	function refreshUpdatedInfo(tempElement, createdBy) {
		tempElement.updatedBy = createdBy
		tempElement.updatedAt = new Date()
	}
}

module.exports = {
	createReports
}
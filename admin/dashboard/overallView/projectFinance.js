const { Projects, MemoqProject } = require('../../models')
const moment = require('moment')
const { rateExchangeVendorOntoProject } = require("../../helpers/commonFunctions")

async function getProjectsFinanceInfo(startDate, endDate) {

	const startTime = { hour: 0, minute: 0, second: 0 }
	const endTime = { hour: 23, minute: 59, second: 59 }

	const allData = await getData(moment(startDate).set(startTime), moment(endDate).set(endTime))

	return getFinalInfo(allData)

	async function getData(startDate, endDate) {
		const memoqprojectQueryMatch = {
			$match: {
				status: { $in: [ 'In progress', 'Closed' ] },
				finance: { $exists: true, $ne: [] },
				isTest: { $ne: true },
				creationTime: {
					$gte: new Date(startDate),
					$lte: new Date(endDate)
				}
			}
		}
		const projectQueryMatch = {
			$match: {
				status: { $in: [ 'In progress', 'Closed' ] },
				finance: { $exists: true, $ne: [] },
				isTest: { $ne: true },
				startDate: {
					$gte: new Date(startDate),
					$lte: new Date(endDate)
				}
			}
		}
		const querylookup = {
			$lookup: {
				from: "clients",
				localField: "customer",
				foreignField: "_id",
				as: "clients"
			}
		}
		const queryProject = {
			$project: {
				customerId: '$customer',
				clients: '$clients.name',
				crossRate: '$crossRate',
				projectCurrency: '$projectCurrency',
				receivables: '$finance.Price.receivables',
				payables: '$finance.Price.payables',
				margin: { $subtract: [ '$finance.Price.receivables', '$finance.Price.payables' ] }
			}
		}

		const allProjects = await Projects.aggregate([ projectQueryMatch, querylookup, queryProject ])
		const allMemoqProjects = await MemoqProject.aggregate([ memoqprojectQueryMatch, querylookup, queryProject ])
		return [ ...allProjects, ...allMemoqProjects ]
	}

	function getFinalInfo(allData) {
		let marginInfo = { receivables: 0, payables: 0, margin: 0 }
		const clientsInfo = allData.reduce((result, project) => {

			if (!project || !project.clients) return result

			if (project.projectCurrency && project.projectCurrency !== 'EUR') {
				project.receivables = rateExchangeVendorOntoProject('EUR', project.projectCurrency, project.receivables, project.crossRate)
				project.payables = rateExchangeVendorOntoProject('EUR', project.projectCurrency,  project.payables, project.crossRate)
				project.margin = rateExchangeVendorOntoProject('EUR', project.projectCurrency, project.margin, project.crossRate)
			}

			marginInfo.receivables += +project.receivables
			marginInfo.payables += +project.payables
			marginInfo.margin += project.margin

			const findClient = result.find(({ clients }) => clients === project.clients[0])
			if (!findClient) {
				result.push({ ...project, clients: project.clients[0] })
				return result
			}
			findClient.receivables += +project.receivables
			findClient.payables += +project.payables
			findClient.margin += +project.margin

			return result
		}, [])

		return { marginInfo, clientsInfo }
	}
}

module.exports = { getProjectsFinanceInfo }
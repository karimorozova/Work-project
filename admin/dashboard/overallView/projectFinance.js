const { Projects, MemoqProject } = require('../../models')
const moment = require('moment')

async function getProjectsFinanceInfo(startDateDay , endDateDay , startDateMonth  , endDateMonth ) {
	const startTime = {hour: 0, minute: 0, second: 0}
	const endTime = {hour: 23, minute: 59, second: 59}

	startDateDay =  startDateDay ? moment(startDateDay).set(startTime) : moment(startTime)
	startDateMonth =  startDateMonth ? moment(startDateMonth).set(startTime).subtract(30, 'days') : moment(startTime).subtract(30, 'days')
	endDateDay =  endDateDay ? moment(endDateDay).set(endTime) : moment(endTime)
	endDateMonth =  endDateMonth ? moment(endDateMonth).set(endTime) : moment(endTime)

	const allDataDay = await getData(startDateDay , endDateDay )
	const allDataMonth = await getData(startDateMonth , endDateMonth )
	const dayStats = getFinalInfo(allDataDay)
	const monthStats = getFinalInfo(allDataMonth)
	return {dayStats, monthStats}

	async function getData(startDate, endDate) {
		const memoqprojectQueryMatch = {
			$match: {
				status: { $in: [ 'In progress', 'Closed' ] },
				finance: { $exists: true, $ne: [] },
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
				creationTime: {
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
				receivables: { $toDouble: '$finance.Price.receivables' },
				payables: { $toDouble: '$finance.Price.payables' },
				margin: { $subtract: [ { $toDouble: '$finance.Price.receivables' }, { $toDouble: '$finance.Price.payables' } ] }
			}
		}

		const allProjects = await Projects.aggregate( [projectQueryMatch, querylookup, queryProject])
		const allMemoqProjects = await MemoqProject.aggregate([ memoqprojectQueryMatch, querylookup, queryProject ])
		return [ ...allProjects, ...allMemoqProjects ]
	}

	function getFinalInfo(allData) {
		let marginInfo = { receivables: 0, payables: 0, margin: 0 }
		const clientsInfo = allData.reduce((result, project) => {
			if (!project || !project.clients) return result

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
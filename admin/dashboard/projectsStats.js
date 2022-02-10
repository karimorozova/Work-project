const moment = require("moment")
const { Projects } = require("../models")

const getAllProjectFinanceStats = async () => {
	const today = moment().format('YYYY-MM-DD')
	const startMonth = moment().startOf('month').format('YYYY-MM-DD')
	const endMonth = moment().endOf('month').format('YYYY-MM-DD')

	const projectFinance = await getProjects({startDate: { $gte: new Date(today + 'T00:00:00.000Z'), $lt: new Date(today + 'T23:59:59.000Z') }})
	const statsDaily = getFinanceInfo(projectFinance)
	const statsDailyByClient = getFinanceInfoByClient(projectFinance)

	const projectFinanceMonth = await getProjects({billingDate: { $gte: new Date(startMonth + 'T00:00:00.000Z'), $lt: new Date(endMonth + 'T23:59:59.000Z') }})
	const statsMonth = getFinanceInfo(projectFinanceMonth)
	const statsMonthByClient = getFinanceInfoByClient(projectFinanceMonth)

	return {statsDaily, statsMonth, statsDailyByClient, statsMonthByClient}
}


function getFinanceInfo(projects) {
	return projects.reduce((acc, cur) => {
		if (!cur.finance.Price.receivables) return acc

		if (cur.projectCurrency === 'USD') {
			acc.dollarSum = +(+acc.dollarSum + +cur.finance.Price.receivables).toFixed(2)
			acc.totalSum = +( +acc.totalSum + +cur.finance.Price.receivables * +cur.crossRate.USD.EUR).toFixed(2)
		}else {
			acc.euroSum = +(+acc.euroSum + +cur.finance.Price.receivables).toFixed(2)
			acc.totalSum = +(+acc.totalSum +  +cur.finance.Price.receivables).toFixed(2)
		}

		return acc
	}, { dollarSum: 0, euroSum: 0, totalSum: 0 })
}

function getFinanceInfoByClient(projects) {
	return projects.reduce((acc, cur ) => {
		const amount = +cur.finance.Price.receivables
		if (!acc.hasOwnProperty(cur.customer.name)) {
			acc[cur.customer.name] = {
				name: cur.customer.name,
				currencyNormalized: cur.projectCurrency,
				amount: +amount.toFixed(2)
			}
		}else {
			acc[cur.customer.name].amount = +(+amount + +acc[cur.customer.name].amount).toFixed(2)
		}
		return acc
	}, {})
}

async function getProjects(additionalQuery) {
	return (await Projects.find({
		status: { $not: { $in: [ 'Created', 'Draft', 'Cost Quote', 'Quote sent', 'Cancelled', 'Rejected' ] } },
		isTest: false,
		...additionalQuery,
	}, { finance: 1, projectCurrency: 1, crossRate: 1, projectId: 1, customer: 1 }).populate('customer', {name:1}).lean())
}

module.exports = {getAllProjectFinanceStats}
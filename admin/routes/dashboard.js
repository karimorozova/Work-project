const router = require('express').Router()
const { getProjectsFinanceInfo } = require('../dashboard/overallView/projectFinance')
const { getProjectsForDashboard } = require('../dashboard/pmAmOrAdmin')
const { getClientsRequestsForDashboard } = require('../dashboard/incomingRequests')
const { sendRequest } = require("../projects/xtrfApi")
const axios = require("axios")
const { Projects, ClientsTasks, ClientsNotes} = require("../models")
const moment = require("moment")


router.post("/finance-view", async (req, res) => {
	const { startDate, endDate } = req.body
	try {
		const result = await getProjectsFinanceInfo(startDate, endDate)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on Finance getting')
	}
})

router.get("/all-projects", async (req, res) => {
	try {
		const result = await getProjectsForDashboard()
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on Finance getting')
	}
})
router.get("/all-client-requests", async (req, res) => {
	try {
		const result = await getClientsRequestsForDashboard()
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on Finance getting')
	}
})

router.get("/finance", async (req, res) => {
	try {
		const currencyNormalize = {
			'[&euro;]': 'EUR',
			'[$]': 'USD'
		}

		let sumEuro = 0
		let sumDolars = 0
		let sumEuroMonth = 0
		let sumDolarsMonth = 0
		let sumEuroTotal = 0
		let sumEuroMonthTotal = 0


		const reportsLink = await sendRequest('get', 'reports/132/result/printerFriendly')
		const xtrfPayments = (await axios({
			method: 'get',
			url: reportsLink.data.url
		}))

		const reportsLinkMonth = await sendRequest('get', 'reports/131/result/printerFriendly')
		const xtrfPaymentsMonth = (await axios({
			method: 'get',
			url: reportsLinkMonth.data.url
		}))

		const matchStrings = xtrfPayments.data.match(/(('xtrf\-financial\-report\-body')|(xtrf\-financial\-report\-footer\-main"))><td.+?>(.+?)<\/td>.+?>(.+?)<\/td/gm) || []

		for await (let matchString of matchStrings) {

			const xtrfFinanceToday = /<td.+?>(?<title>.+?)<\/td>.+?>(?<value>.+?)<\/td/gm.exec(matchString)
			const { title, value } = xtrfFinanceToday.groups

			if (currencyNormalize[title.split(' ').pop()] === 'EUR') {
				sumEuro = +value
			} else if (currencyNormalize[title.split(' ').pop()] === 'USD') {
				sumDolars = +value
			}else {
				sumEuroTotal = +value
			}

		}

		const matchStringsMonth = xtrfPaymentsMonth.data.match(/(('xtrf\-financial\-report\-body')|(xtrf\-financial\-report\-footer\-main"))><td.+?>(.+?)<\/td>.+?>(.+?)<\/td/gm) || []

		for await (let matchString of matchStringsMonth || []) {
			const xtrfFinanceToday = /<td.+?>(?<title>.+?)<\/td>.+?>(?<value>.+?)<\/td/gm.exec(matchString)
			const { title, value } = xtrfFinanceToday.groups

			if (currencyNormalize[(title.split(' ')).pop()] === 'EUR') {
				sumEuroMonth = +value
			} else if (currencyNormalize[title.split(' ').pop()] === 'USD') {
				sumDolarsMonth = +value
			}else {
				sumEuroMonthTotal = +value
			}
		}


		const today = moment().format('YYYY-MM-DD')
		const projectFinance = await Projects.find({
					status: { $not: { $in: [ 'Created', 'Draft', 'Cost Quote', 'Quote sent', 'Cancelled', 'Rejected' ] } },
					isTest: false, isSendToXtrf: false, startDate: { $gte: new Date(today + 'T00:00:00.000Z'), $lt: new Date(today + 'T23:00:00.000Z') }
				}, { finance: 1, projectCurrency: 1, crossRate: 1, projectId: 1 })
		const sum = projectFinance.reduce((acc, cur) => {
			if (!cur.finance.Price.receivables) return acc
			acc += cur.projectCurrency === 'EUR' ? +cur.finance.Price.receivables : +cur.finance.Price.receivables * +cur.crossRate.USD.EUR
			return acc
		}, 0)

		const startMonth = moment().startOf('month').format('YYYY-MM-DD')
		const endMonth = moment().endOf('month').format('YYYY-MM-DD')
		const projectFinanceMonth = await Projects.find({
			status: { $not: { $in: [ 'Created', 'Draft', 'Cost Quote', 'Quote sent', 'Cancelled', 'Rejected' ] } },
			isTest: false, isSendToXtrf: false, billingDate: { $gte: new Date(startMonth + 'T00:00:00.000Z'), $lt: new Date(endMonth + 'T23:00:00.000Z') }
		}, { finance: 1, projectCurrency: 1, crossRate: 1, projectId: 1 })

		const sumMonth = projectFinanceMonth.reduce((acc, cur) => {
			if (!cur.finance.Price.receivables) return acc
			acc += cur.projectCurrency === 'EUR' ? +cur.finance.Price.receivables : +cur.finance.Price.receivables * +cur.crossRate.USD.EUR
			return acc
		}, 0)


		const result = {
			today: [ { name: "XTRF", value: sumEuro }, { name: "XTRF", value: sumDolars }, { name: "Alfa [Not transferred]", value: sum }, { name: "Total", value: sum + sumEuroTotal } ],
			month: [ { name: "XTRF", value: sumEuroMonth }, { name: "XTRF", value: sumDolarsMonth }, { name: "Alfa [Not transferred]", value: sumMonth }, {
				name: "Total",
				value: sumMonth + sumEuroMonthTotal
			} ]
		}

		res.send(JSON.stringify(result))
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on Finance getting')
	}
})

router.get("/all-client-activity", async (req, res) => {
	try {
		const clientsTasks = await ClientsTasks.find({status: {$ne: 'Completed'}}, {"associatedTo.password": 0}).populate(  'assignedTo',  ['firstName', 'lastName']).populate( 'client', ['name'])

		res.send(clientsTasks)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on Finance getting')
	}
})

router.delete("/activity/task/:id/delete", async (req, res) => {
	try {
		const { id } = req.params
		await ClientsTasks.deleteOne({ _id: id })
		res.send('success')
	} catch (e) {
		res.status(500).send('Error on client delete')
	}

})


module.exports = router
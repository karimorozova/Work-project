const router = require('express').Router()
const { Languages } = require('../models')

const {
	getAllTasks,
	createReports,
	reportsFiltersQuery,
	getAllReports
} = require('../invoicingReceivables')

const  {
	stepsFiltersQuery
} = require('../invoicingPayables')

router.post("/reports", async (req, res) => {
	try {
		const { countToSkip, countToGet, filters } = req.body
		const query = reportsFiltersQuery(filters)
		const reports = await getAllReports(countToSkip, countToGet, query)
		res.send(reports)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/not-selected-steps-list", async (req, res) => {
	const { countToSkip, countToGet, filters } = req.body
	const allLanguages = await Languages.find()
	try {
		const query = stepsFiltersQuery(filters, allLanguages)
		const tasks = await getAllTasks(countToSkip, countToGet, query)
		res.send(tasks)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting Tasks!')
	}
})

router.post('/create-report', async (req, res) => {
	const { checkedSteps, createdBy } = req.body
	try {
		await createReports({ checkedSteps, createdBy })
		res.send('Done')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on /create-report!')
	}
})

module.exports = router
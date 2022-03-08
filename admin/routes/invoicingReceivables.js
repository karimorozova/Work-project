const router = require('express').Router()
const { Languages } = require("../models")
const { stepsFiltersQuery } = require("../invoicingPayables")
const {
	getAllSteps,
	createReports,
	reportsFiltersQuery,
	getAllReportsFromDb, deleteReport
} = require("../invoicingClientReports")


router.post("/not-selected-steps-list", async (req, res) => {
	const { countToSkip, countToGet, filters } = req.body
	const allLanguages = await Languages.find()
	try {
		const query = stepsFiltersQuery(filters, allLanguages)
		const steps = await getAllSteps(countToSkip, countToGet, { ...query })
		res.send(steps)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting Steps List!')
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
router.post("/list-of-reports", async (req, res) => {
	try {
		const { countToSkip, countToGet, filters } = req.body
		const query = reportsFiltersQuery(filters)
		const reports = await getAllReportsFromDb(countToSkip, countToGet, query)
		res.send(reports)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.delete("/delete-report/:id", async (req, res) => {
	const { id } = req.params
	try {
		const report = await deleteReport(id)
		res.send(report)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/delete-reports", async (req, res) => {
	const { reportsIds } = req.body
	try {
		// for await (const receivableId of receivableIds) await receivableDelete(receivableId)
		res.send("success")
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on deleting reports')
	}
})

module.exports = router
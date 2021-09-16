const router = require('express').Router()
const { Languages } = require('../models')
const ObjectId = require("mongodb").ObjectID

const {
	getAllSteps,
	createReports,
	reportsFiltersQuery,
	getAllReports,
	getReportById,
	receivableDelete,
	deleteStepFromReport
} = require('../invoicingReceivables')

const {
	stepsFiltersQuery
} = require('../invoicingPayables')

router.post("/report/:id", async (req, res) => {
	const { id } = req.params
	try {
		const [ report ] = await getReportById(id)
		res.send(report)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.get("/report/:id/delete", async (req, res) => {
	const { id } = req.params
	try {
		const report = await receivableDelete(id)
		res.send(report)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/delete-reports", async (req, res) => {
	const { receivableIds } = req.body
	try {
		for await (const receivableId of receivableIds) {
			await receivableDelete(receivableId)
		}

		res.send("success")
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on deleting reports')
	}
})

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
		const steps = await getAllSteps(countToSkip, countToGet, query)
		res.send(steps)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting Tasks!')
	}
})

router.post("/not-selected-steps-list-mono-project", async (req, res) => {
	const { projectId, clientBillingInfo } = req.body
	try {
		const query = { "_id": ObjectId(projectId), "clientBillingInfo": ObjectId(clientBillingInfo) }
		const steps = await getAllSteps(0, 0, query)
		res.send(steps)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/not-selected-steps-list-multi-project/", async (req, res) => {
	const { clientBillingInfo } = req.body
	try {
		const query = { "clientBillingInfo": ObjectId(clientBillingInfo) }
		const steps = await getAllSteps(0, 0, query)
		res.send(steps)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
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

router.post("/report/:reportId/delete/:stepId", async (req, res) => {
	const { reportId, stepId } = req.params
	try {
		await deleteStepFromReport(reportId, stepId)
		res.send('Done!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on deleting steps from report!')
	}
})

module.exports = router
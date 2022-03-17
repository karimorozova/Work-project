const router = require('express').Router()
const { Languages } = require("../models")
const { ObjectId } = require("mongodb")
const { stepsFiltersQuery } = require("../invoicingPayables")
const {
	getAllSteps,
	createReports,
	reportsFiltersQuery,
	getAllReportsFromDb,
	deleteReport,
	deleteStepFromReport,
	addStepToReport,
	getShortReportList
} = require("../invoicingClientReports")

router.get('/short-report-list', async (req, res) => {
	try {
		const reports = await getShortReportList()
		res.send(reports)
	} catch (err) {
		console.log(err)
		console.log('Error on getting Reports')
	}
})

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

router.post("/report/:reportId/delete", async (req, res) => {
	const { reportId } = req.params
	const { stepsId } = req.body
	try {
		await deleteStepFromReport(reportId, stepsId)
		res.send('Done!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on deleting steps from report!')
	}
})

router.post("/report/:reportId/add", async (req, res) => {
	const { reportId } = req.params
	const { checkedSteps } = req.body
	try {
		await addStepToReport(reportId, checkedSteps)
		res.send('Done!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/report-details/:id", async (req, res) => {
	const { id } = req.params
	try {
		const [ report ] = await getAllReportsFromDb(0, 1, { _id: ObjectId(id) })
		res.send(report)
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

router.post("/not-selected-steps-list-mono-project", async (req, res) => {
	const { projectId, clientBillingInfo } = req.body
	try {
		const steps = await getAllSteps(0, 1e6, { "_id": ObjectId(projectId), "clientBillingInfo": ObjectId(clientBillingInfo) })
		res.send(steps)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/not-selected-steps-list-multi-project/", async (req, res) => {
	const { clientBillingInfo } = req.body
	try {
		const steps = await getAllSteps(0, 1e6, { "clientBillingInfo": ObjectId(clientBillingInfo) })
		res.send(steps)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

module.exports = router
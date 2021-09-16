const router = require('express').Router()
const { Languages } = require('../models')

const {
	getAllTasks,
	createReports,
	reportsFiltersQuery,
	getAllReports,
	getReportById,
	receivableDelete
} = require('../invoicingReceivables')

const {
	stepsFiltersQuery
} = require('../invoicingPayables')

router.post("/report/:id", async (req, res) => {
	const { id } = req.params
	try {
		const [ report ] = await getReportById(id)
		console.log('ARARA-22', report)
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
		res.send(report);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on getting steps');
	}
});

router.post("/delete-reports", async (req, res) => {
	const { receivableIds } = req.body
	try {
		for await (const receivableId of receivableIds) {
			await receivableDelete(receivableId)
		}

		res.send("success");
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong on deleting reports');
	}
});

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
const router = require('express').Router()
const { Languages } = require("../models")
const { stepsFiltersQuery } = require("../invoicingPayables")
const {
	getAllSteps,
	createReports
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

module.exports = router
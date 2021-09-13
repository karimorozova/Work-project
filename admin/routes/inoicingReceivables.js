const router = require('express').Router()
const { Languages } = require('../models')
const { tasksFiltersQuery, getAllTasks } = require('../invoicingReceivables')

router.post("/not-selected-tasks-list", async (req, res) => {
	const { countToSkip, countToGet, filters } = req.body
	const allLanguages = await Languages.find()
	try {
		const query = tasksFiltersQuery(filters, allLanguages)
		const tasks = await getAllTasks(countToSkip, countToGet, query)
		res.send(tasks)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting Tasks!')
	}
})

module.exports = router
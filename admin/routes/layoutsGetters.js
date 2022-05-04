const express = require("express")
const router = express.Router()
const {
	getLayoutProjects
} = require("../layoutsGetters")

router.post('/project', async (req, res) => {
	// { query = {}, sort = { _id: -1 }, options = {}, project = {}, countToSkip = 0, countToGet = 50
	try {
		const { countToSkip, countToGet } = req.body
		const data = await getLayoutProjects({ countToSkip, countToGet })
		res.send(data)
	} catch (e) {
		res.status(500).send(e.message || e || 'Error to get a projects!')
	}
})


module.exports = router
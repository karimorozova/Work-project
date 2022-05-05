const express = require("express")
const router = express.Router()
const {
	getLayoutProjects
} = require("../layoutsGetters")

router.post('/project', async (req, res) => {
	try {
		const { countToSkip, countToGet, sort, query } = req.body
		const data = await getLayoutProjects({ countToSkip, countToGet, sort, query })
		res.send(data)
	} catch (e) {
		res.status(500).send(e.message || e || 'Error to get a projects!')
	}
})


module.exports = router
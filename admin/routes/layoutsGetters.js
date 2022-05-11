const express = require("express")
const router = express.Router()
const { User } = require("../models")

const {
	getLayoutProjects,
	getReceivablesSteps,
} = require("../layoutsGetters")


router.post('/update-user-layouts-setting', async (req, res) => {
	try {
		const { userId, prop, value } = req.body
		await User.updateOne({ _id: userId }, { layoutsSettings: { [prop]: value } })
		const updatedUser = await User.findOne({ _id: userId }).populate('groups')
		res.send(updatedUser)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message || err || 'Error on saving settings!')
	}
})

router.post('/project', async (req, res) => {
	try {
		const { countToSkip, countToGet, sort, query } = req.body
		const data = await getLayoutProjects({ countToSkip, countToGet, sort, query })
		res.send(data)
	} catch (e) {
		res.status(500).send(e.message || e || 'Error to get a projects!')
	}
})


router.post('/receivables-reports-steps', async (req, res) => {
	try {
		const { countToSkip, countToGet, sort, query } = req.body
		const data = await getReceivablesSteps({ countToSkip, countToGet, sort, query })
		res.send(data)
	} catch (e) {
		res.status(500).send(e.message || e || 'Error to get a projects!')
	}
})


module.exports = router
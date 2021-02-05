const router = require('express').Router()
const fs = require('fs')
const { upload } = require('../utils/')
const { updateLanguage, getTierInfo, updateTierInfo } = require('../settings')
const { Languages } = require('../models')

router.post('/languages', upload.fields([ { name: "flag" } ]), async (req, res) => {
	const flag = req.files["flag"]
	try {
		await updateLanguage({ ...req.body, flag })
		res.send('Updated')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something went wrong while Language saving')
	}
})

router.put('/language-setting', async (req, res) => {
	let { obj } = req.body
	try {
		await Languages.updateOne({ _id: obj._id }, obj)
		res.send('Updated')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on language setting saving')
	}
})

router.get('/tier-info', async (req, res) => {
	try {
		const tierInfo = await getTierInfo()
		res.send(tierInfo)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on language setting saving')
	}
})

router.put('/update-tier-info', async (req, res) => {
	let { updatedTierInfo } = req.body
	try {
		await updateTierInfo(updatedTierInfo)
		res.send('success')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on language setting saving')
	}
})

module.exports = router
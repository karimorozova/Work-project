const router = require('express').Router()
const fs = require('fs')
const { upload } = require('../utils/')
const { updateLanguage } = require('../settings')

router.post('/languages', upload.fields([{ name: "flag" }]), async (req, res) => {
	const flag = req.files["flag"]
	try {
		await updateLanguage({ ...req.body, flag })
		res.send('Updated')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something went wrong while Language saving')
	}
})

module.exports = router
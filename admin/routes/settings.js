const router = require('express').Router()
const fs = require('fs')
const { upload } = require('../utils/')
const { updateLanguage, getTierInfo, updateTierInfo, getIndustryTier, updateIndustryTier } = require('../settings')
const { getClients } = require('../clients')
const { Languages, ClientsApiSetting } = require('../models')

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

router.get('/industry-tier', async (req, res) => {
	try {
		const tierInfo = await getIndustryTier()
		res.send(tierInfo)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on language setting saving')
	}
})

router.put('/update-industry-tier', async (req, res) => {
	let { updatedIndustryTier } = req.body
	try {
		const tierInfo = await updateIndustryTier(updatedIndustryTier)
		res.send(tierInfo)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on language setting saving')
	}
})

router.get('/clients-api', async (req, res) => {
	try {
		const clients = await getClientsApi({})
		res.send(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/clients-api/new', async (req, res) => {
	let { clientApi } = req.body
	console.log(clientApi)
	try {
		await ClientsApiSetting.create( clientApi)
		const clients = await ClientsApiSetting.find()
		res.send(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/clients-api/:id', async (req, res) => {
	let { clientApi } = req.body
	console.log(clientApi)
	try {
		await ClientsApiSetting.updateOne({_id: id}, clientApi, { upsert: true })
		const clients = await ClientsApiSetting.find()
		res.send(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/all-clients', async (req, res) => {
	try {
		const clients = await getClients({})
		res.send(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

module.exports = router
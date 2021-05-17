const router = require('express').Router()
const fs = require('fs')
const { upload, moveFile } = require('../utils/')
const { updateLanguage, getTierInfo, updateTierInfo, getIndustryTier, updateIndustryTier, getClientsApi } = require('../settings')
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

router.post('/clients-api/new', upload.fields([{ name: 'logo' }]), async (req, res) => {
	let { affiliation,clientName,industry,isDisplay } = req.body
	const iconFile = req.files["logo"];

	try {
		let logoPath
		const date = new Date();
		const formattedDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
		if(iconFile) {
			const newIconPath = `./dist/apiSettingsLogo/${formattedDate}-${iconFile[0].filename}`;
			await moveFile(iconFile[0], newIconPath);
			logoPath = `/apiSettingsLogo/${formattedDate}-${iconFile[0].filename}`;
		}
		await ClientsApiSetting.create( { logo: logoPath, affiliation,clientName,industry: JSON.parse(industry),isDisplay })
		const clientsApi = await ClientsApiSetting.find()
		res.send('ok')
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/clients-api/:id', upload.fields([{ name: 'logo' }]), async (req, res) => {
	let { id } = req.params
	let { affiliation,clientName,industry,isDisplay } = req.body
	const iconFile = req.files["logo"];

	try {
		let logoPath
		let updateData = {  affiliation, clientName, industry: JSON.parse(industry), isDisplay }
		const date = new Date();
		const formattedDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
		if(iconFile) {
			const newIconPath = `./dist/apiSettingsLogo/${formattedDate}-${iconFile[0].filename}`;
			await moveFile(iconFile[0], newIconPath);
			logoPath = `/apiSettingsLogo/${formattedDate}-${iconFile[0].filename}`;
			updateData.logo =  logoPath
		}
		await ClientsApiSetting.updateOne({_id: id}, updateData)
		const clientsApi = await ClientsApiSetting.find()
		res.send('ok')
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/clients-api/:id/delete', async (req, res) => {
	let { id } = req.params
	try {
		await ClientsApiSetting.deleteOne({_id: id})
		const clientsApi = await ClientsApiSetting.find()
		res.send(clientsApi)
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
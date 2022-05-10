const router = require('express').Router()
const fs = require('fs')
const { upload, moveFile } = require('../utils/')

const {
	Languages,
	ClientsApiSetting,
	Vendors,
	Clients,
	User
} = require('../models')

const {
	updateLanguage,
	getTierInfo,
	updateTierInfo,
	getIndustryTier,
	updateIndustryTier,
	getClientsApi,
	getPaymentTerms,
	managePaymentTerms,
	deletePaymentTerms,
	getAllPaymentMethods,
	createPaymentMethod,
	getAllPaymentMethodsKeys,
	createPaymentMethodKeys,
	removePaymentMethodKeys,
	updatePaymentMethodKeys,
	removePaymentMethod,
	updatePaymentMethod,
	createCompany,
	deleteCompany,
	editCompanyDetails,
	addPaymentMethodToCompany,
	getCompanies,
	getCompany,
	editPaymentMethodInCompany,
	deletePaymentMethodInCompany, toggleDefaultPaymentMethod
} = require('../settings')

const {
	getSimpleClients
} = require('../clients')
const { editCompanyBase } = require("../settings/companies")


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

router.get('/payment-terms', async (req, res) => {
	try {
		const paymentTerms = await getPaymentTerms()
		const vendors = await Vendors.find({}, { firstName: 1, billingInfo: 1 })
		const clients = await Clients.find({}, { name: 1, billingInfo: 1 })
		res.send({ paymentTerms, vendors, clients })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on get /payment-terms')
	}
})

router.delete('/payment-terms/:_id', async (req, res) => {
	try {
		const { _id } = req.params
		const result = await deletePaymentTerms(_id)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on get /deleting | payment-terms')
	}
})

router.put('/manage-payment-terms', async (req, res) => {
	try {
		const result = await managePaymentTerms(req.body)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on get /manage-payment-terms')
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

router.post('/clients-api/new', upload.fields([ { name: 'logo' } ]), async (req, res) => {
	let { affiliation, clientName, industry, isDisplay } = req.body
	const iconFile = req.files["logo"]

	try {
		let logoPath
		const date = new Date()
		const formattedDate = `${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }`
		if (iconFile) {
			const newIconPath = `./dist/apiSettingsLogo/${ formattedDate }-${ iconFile[0].filename }`
			await moveFile(iconFile[0], newIconPath)
			logoPath = `/apiSettingsLogo/${ formattedDate }-${ iconFile[0].filename }`
		}
		await ClientsApiSetting.create({ logo: logoPath, affiliation, clientName, industry: JSON.parse(industry), isDisplay })
		const clientsApi = await ClientsApiSetting.find()
		res.send('ok')
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/clients-api/:id', upload.fields([ { name: 'logo' } ]), async (req, res) => {
	let { id } = req.params
	let { affiliation, clientName, industry, isDisplay } = req.body
	const iconFile = req.files["logo"]

	try {
		let logoPath
		let updateData = { affiliation, clientName, industry: JSON.parse(industry), isDisplay }
		const date = new Date()
		const formattedDate = `${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }`
		if (iconFile) {
			const newIconPath = `./dist/apiSettingsLogo/${ formattedDate }-${ iconFile[0].filename }`
			await moveFile(iconFile[0], newIconPath)
			logoPath = `/apiSettingsLogo/${ formattedDate }-${ iconFile[0].filename }`
			updateData.logo = logoPath
		}
		await ClientsApiSetting.updateOne({ _id: id }, updateData)
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
		await ClientsApiSetting.deleteOne({ _id: id })
		const clientsApi = await ClientsApiSetting.find()
		res.send(clientsApi)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/all-clients', async (req, res) => {
	try {
		const clients = await getSimpleClients({}, { 'name': 1, industry: 1 })
		res.send(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/all-clients-billing', async (req, res) => {
	try {
		const clients = await getSimpleClients({}, { 'name': 1, billingInfo: 1 })
		res.send(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.get('/payment-methods', async (req, res) => {
	try {
		const paymentsMethods = await getAllPaymentMethods()
		res.json(paymentsMethods)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.post('/payment-methods', async (req, res) => {
	const { name, minimumAmount, isActive, keys } = req.body
	try {
		const paymentsMethods = await createPaymentMethod({ name, minimumAmount, isActive, keys })
		res.json(paymentsMethods)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.put('/payment-methods/:id', async (req, res) => {
	const { id } = req.params
	const { name, minimumAmount, isActive, keys } = req.body
	try {
		const paymentsMethods = await updatePaymentMethod(id, { name, minimumAmount, isActive, keys })
		res.json(paymentsMethods)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.delete('/payment-methods/:id', async (req, res) => {
	const { id } = req.params
	try {
		const paymentsMethods = await removePaymentMethod(id)
		res.json(paymentsMethods)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.get('/payment-methods-keys', async (req, res) => {
	try {
		const paymentsMethods = await getAllPaymentMethodsKeys()
		res.json(paymentsMethods)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.post('/payment-methods-keys', async (req, res) => {
	const { key } = req.body
	try {
		const paymentsMethods = await createPaymentMethodKeys({ key })
		res.json(paymentsMethods)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.put('/payment-methods-keys/:id', async (req, res) => {
	const { id } = req.params
	const { key } = req.body
	try {
		const paymentsMethods = await updatePaymentMethodKeys(id, { key })
		res.json(paymentsMethods)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.delete('/payment-methods-keys/:id', async (req, res) => {
	const { id } = req.params
	try {
		const paymentsMethods = await removePaymentMethodKeys(id)
		res.json(paymentsMethods)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.get('/companies', async (req, res) => {
	try {
		const companies = await getCompanies()
		res.json(companies)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.get('/company/:id', async (req, res) => {
	const { id } = req.params
	try {
		console.log('gere', id)
		const companies = await getCompany(id)
		console.log(companies)
		res.json(companies)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.post('/company', async (req, res) => {
	const { companyName, officialCompanyName, isActive, isDefault } = req.body
	console.log({ test: req.body })
	try {
		const companies = await createCompany(companyName, officialCompanyName, isActive, isDefault)
		res.json(companies)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.post('/company/:id', upload.fields([ { name: 'photo' } ]), async (req, res) => {
	const { id } = req.params
	const editedCompany = JSON.parse(req.body.company)
	const photoFile = req.files["photo"]

	try {
		const company = await editCompanyDetails(id, editedCompany, photoFile)
		res.json(company)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.put('/company/:id', async (req, res) => {
	const { id } = req.params
	const { companyName, officialCompanyName, isActive, isDefault } = req.body
	try {
		const companies = await editCompanyBase(id, { companyName, officialCompanyName, isActive, isDefault })
		res.json(companies)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})


router.delete('/company/:id', async (req, res) => {
	const { id } = req.params
	try {
		const companies = await deleteCompany(id)
		res.json(companies)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.post('/company/:id/payment-method', async (req, res) => {
	const { id } = req.params
	const { name, paymentType, otherStatement, paymentMethodId } = req.body
	try {
		let companies
		if (!paymentMethodId) {
			companies = await addPaymentMethodToCompany(id, { name, paymentType, otherStatement })
		} else {
			companies = await editPaymentMethodInCompany(id, paymentMethodId, { _id: paymentMethodId, name, paymentType, otherStatement })
		}
		res.json(companies)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.put('/company/:id/payment-method/:paymentMethodId/is-default', async (req, res) => {
	const { id, paymentMethodId } = req.params
	const { status } = req.body
	try {
		const company = await toggleDefaultPaymentMethod(id, paymentMethodId, status)
		res.json(company)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})

router.delete('/company/:companyId/payment-method/:paymentId', async (req, res) => {
	const { companyId, paymentId } = req.params
	try {
		const companies = await deletePaymentMethodInCompany(companyId, paymentId)
		res.json(companies)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on vendor-payment-benchmark')
	}
})


module.exports = router

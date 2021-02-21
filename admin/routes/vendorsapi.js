const router = require('express').Router()
const { upload, stepEmailToVendor } = require('../utils')
const mv = require('mv')
const fse = require('fs-extra')
const { getRatePricelist, changeMainRatePricelist } = require('../pricelist')
const { updateProject, getProject } = require('../projects')
const {
	getVendor,
	getVendorAfterUpdate,
	getFilteredVendors,
	updateVendorEducation,
	saveVendorDocument,
	saveVendorDocumentDefault,
	removeVendorDoc,
	removeVendorEdu,
	updateVendorAssessment,
	notifyTestStatus,
	sendMessageToVendor,
	updateVendorCompetencies,
	deleteVendorCompetencies,
	updateVendorsRatePrices,
	syncVendorRatesCost,
	getVendorAssessmentsWordCount,
	createRateRowFromQualification,
	getVendorAfterCombinationsUpdated,
	updateVendorMatrix,
	syncVendorMatrix
} = require('../vendors')
const { createMemoqUser, deleteMemoqUser } = require('../services/memoqs/users')
const { Vendors, Projects, Pricelist } = require('../models')
const { getLangTests, updateLangTest, removeLangTest } = require('../langTests')
const { testSentMessage } = require("../emailMessages/candidateCommunication")

router.get('/vendor', async (req, res) => {
	const id = req.query.id
	try {
		const vendor = await getVendor({ "_id": id })
		res.send(vendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Vendor")
	}
})

router.post('/vendor-priceListTable-index', async (req, res) => {
	const { id, index } = req.body
	try {
		const vendor = await getVendor({ "_id": id })
		res.send(vendor.rates.pricelistTable[index])
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting priceListTable Vendor")
	}
})

router.post('/vendor-rate-by-key', async (req, res) => {
	const { id, key } = req.body
	try {
		const vendor = await getVendor({ "_id": id })
		res.send(vendor.rates[key])
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting priceListTable Vendor")
	}
})

function moveFile(oldFile, vendorId) {
	let newFile = './dist/vendorsDocs/' + vendorId + '/' + oldFile.filename
	mv(oldFile.path, newFile, {
		mkdirp: true
	}, function (err) {
	})
	return oldFile.filename
}

router.post('/vendor-document-default', async (req, res) => {
	const { vendorId, category } = req.body
	try {
		const updatedVendor = await saveVendorDocumentDefault({
			vendorId, category
		})
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on adding vendor document")
	}
})

router.post('/vendor-document', upload.fields([ { name: 'documentFile' } ]), async (req, res) => {
	const { vendorId, category, oldFilePath, oldName, oldCategory } = req.body
	const files = req.files["documentFile"] || []
	try {
		const updatedVendor = await saveVendorDocument({
			vendorId, file: files[0], category, oldFilePath, oldName, oldCategory
		})
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on adding vendor document")
	}
})

router.post('/remove-vendor-doc', async (req, res) => {
	const { vendorId, docFile } = req.body
	try {
		const updatedVendor = await removeVendorDoc({
			vendorId, ...docFile
		})
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on removing vendor document")
	}
})

router.post('/vendor-education', upload.fields([ { name: 'educationFile' } ]), async (req, res) => {
	let education = JSON.parse(req.body.education)
	const { vendorId, index } = req.body
	const files = req.files["educationFile"] || []
	try {
		const updatedVendor = await updateVendorEducation({
			vendorId, education, file: files[0], index
		})
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on updating")
	}
})

router.post('/remove-vendor-education', async (req, res) => {
	const { vendorId, index, doc } = req.body
	const path = doc ? doc.path : ""
	try {
		const updatedVendor = await removeVendorEdu({
			vendorId, index, path
		})
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on removing vendor document")
	}
})

router.post('/vendor-profExperience', async (req, res) => {
	const { vendorId, index, experience } = req.body
	try {
		const query = `profExperiences.${ index }`
		const updatedVendor = await getVendorAfterUpdate(
				{ _id: vendorId },
				{ [query]: experience }
		)
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on updating")
	}
})

router.post('/remove-vendor-experience', async (req, res) => {
	const { vendorId, index } = req.body
	try {
		const query = `profExperiences.${ index }`
		await Vendors.updateOne({ _id: vendorId }, { [query]: null })
		const updatedVendor = await getVendorAfterUpdate({ _id: vendorId }, { $pull: { "profExperiences": null } })
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on removing vendor document")
	}
})

router.post('/vendor-qualification', upload.fields([ { name: 'assessmentFile' } ]), async (req, res) => {
	const { vendorId, index, qualification } = req.body
	try {
		const query = `qualifications.${ index }`
		const updatedVendor = await getVendorAfterUpdate(
				{ _id: vendorId },
				{ [query]: qualification }
		)
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on updating")
	}
})

router.post('/remove-vendor-qualification', async (req, res) => {
	const { vendorId, index } = req.body
	try {
		const query = `qualifications.${ index }.status`
		await Vendors.updateOne({ _id: vendorId }, { [query]: "" })
		const updatedVendor = await getVendorAfterUpdate({ _id: vendorId }, { $pull: { qualifications: { status: "" } } })
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on removing vendor document")
	}
})

router.post('/vendor-assessment', upload.fields([ { name: 'assessmentFile' } ]), async (req, res) => {
	const assessment = JSON.parse(req.body.assessment)
	const { vendorId } = req.body
	const files = req.files["assessmentFile"]
	try {
		const updatedVendor = await updateVendorAssessment({
			vendorId,
			assessment,
			file: files[0]
		})
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on saving Vendor's assessment")
	}
})

router.post('/filtered-vendors', async (req, res) => {
	const { filters } = req.body
	try {
		const filteredVendors = await getFilteredVendors(filters)
		res.send(filteredVendors)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting filtered Vendors")
	}
})

router.post('/competencies', async (req, res) => {
	const { vendorId, currentData } = req.body
	try {
		const vendor = await updateVendorCompetencies(vendorId, currentData)
		res.send(vendor)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on saving Vendor Competencies')
	}
})

router.delete('/competencies/:vendorId/:competenceId', async (req, res) => {
	const { vendorId, competenceId } = req.params
	try {
		const vendor = await deleteVendorCompetencies(vendorId, competenceId)
		res.send(vendor)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on deleting Vendor Competencies')
	}
})

router.post('/step-email', async (req, res) => {
	const { projectId, step } = req.body
	try {
		const project = await getProject({ "_id": projectId })
		const stepsAfterMailSent = await stepEmailToVendor(project, step)
		await updateProject({ "_id": projectId }, { steps: stepsAfterMailSent })
		res.send('Email has been sent')
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on sending email to Vendor")
	}
})

router.post('/remove-rate', async (req, res) => {
	const { vendorId, rateId, prop } = req.body
	try {
		const updatedVendor = await getVendorAfterUpdate({ "_id": vendorId }, {
			$pull: { [prop]: { '_id': rateId } }
		})
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on deleting rate of Vendor")
	}
})

router.post('/remove-rates', async (req, res) => {
	const { vendorId, checkedIds, prop } = req.body
	try {
		const updatedVendor = await getVendorAfterUpdate({ "_id": vendorId }, {
			$pull: { [prop]: { '_id': { $in: checkedIds } } }
		})
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on deleting rate of Vendor")
	}
})

router.post('/combination', async (req, res) => {
	const { step, rate } = req.body
	try {
		const project = await getProject({ "steps._id": step._id })
		const updatedVendor = await getVendorAfterCombinationsUpdated({ project, step, rate })
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on adding combination for Vendor")
	}
})

router.post('/new-vendor', upload.fields([ { name: 'photo' } ]), async (req, res) => {
	let vendor = JSON.parse(req.body.vendor)
	const photoFile = req.files["photo"]
	try {
		const { discountChart } = await Pricelist.findOne({isVendorDefault: true})
		vendor.matrix = {...discountChart}
		const saveVendor = await Vendors.create(vendor)
		const id = saveVendor.id
		if (photoFile) {
			await moveFile(photoFile[0], id)
			vendor.photo = `/vendorsDocs/${ id }/${ photoFile[0].filename }`
		}
		const password = '$2y$10$BD5uiSRNnKwFo4fJYHDarub7qV8F/ZlaC8kHlEAW8cmyn7bIThKL6'
		const updatedVendor = await getVendorAfterUpdate({ "_id": id }, { photo: vendor.photo, password })
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on creating Vendor")
	}
})

router.post('/update-vendor', upload.fields([ { name: 'photo' } ]), async (req, res) => {
	let vendor = JSON.parse(req.body.vendor)
	const photoFile = req.files["photo"]
	try {
		if (photoFile) {
			await moveFile(photoFile[0], vendor._id)
			vendor.photo = `/vendorsDocs/${ vendor._id }/${ photoFile[0].filename }`
		}
		const updatedVendor = await getVendorAfterUpdate({ "_id": vendor._id }, vendor)
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on updating Vendor")
	}
})

router.get('/rates/:id', async (req, res) => {
	const { id: vendorId } = req.params
	try {
		const { rates } = await getVendor({ _id: vendorId })
		res.send(rates)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting vendor\'s rates')
	}
})

router.post('/rates/:id', async (req, res) => {
	const { id: vendorId } = req.params
	const { itemIdentifier, updatedItem } = req.body
	try {
		await updateVendorsRatePrices(vendorId, itemIdentifier, updatedItem)
		res.send('Saved')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating vendor\'s rates')
	}
})

router.post('/rates/change-pricelist/:id', async (req, res) => {
	const { id: vendorId } = req.params
	try {
		await changeMainRatePricelist(vendorId, req.body, true)
		res.send('Saved')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on changing pricelist')
	}
})

router.post('/rates/sync-cost/:id', async (req, res) => {
	const { id: vendorId } = req.params
	const { tableKey, row } = req.body
	try {
		await syncVendorRatesCost(vendorId, tableKey, row)
		res.send('Synced')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on syncing vendor\'s rates')
	}
})

router.post('/rates/rate-combinations/:id', async (req, res) => {
	const { id: vendorId } = req.params
	try {
		const ratePricelist = await getRatePricelist(vendorId, req.body, true)
		res.send(ratePricelist)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting vendor rate\'s combinations')
	}
})

router.post('/qualification-rates/:id', async (req, res) => {
	const { id: vendorId } = req.params
	try {
		const { qualification } = req.body
		await createRateRowFromQualification(vendorId, qualification)
		res.send('Saved')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on generating rates from passed qualification test')
	}
})

router.post('/update-vendor-status', async (req, res) => {
	const { id, isTest } = req.body
	try {
		await Vendors.updateOne({ "_id": id }, { "isTest": isTest })
		const vendor = await getVendor({ "_id": id })
		res.send(vendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on updating Vendor status")
	}
})

router.delete('/deletevendor/:id', async (req, res) => {
	const { id } = req.params
	try {
		await Vendors.deleteOne({ "_id": id })
		await fse.remove('./dist/vendorsDocs/' + id)
		res.send("Vendor deleted")
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on deleting Vendor")
	}
})

router.post('/update-matrix', async (req, res) => {
	const { _id, key, value } = req.body
	try {
		const updatedVendor = await updateVendorMatrix( _id, {key, value})
		res.send(updatedVendor)
	} catch (err) {
		res.status(500).send("Error on updating Vendor's matrix")
	}
})

router.post('/default-matrix', async (req, res) => {
	const { _id, key } = req.body
	try {
		const updatedVendor = await syncVendorMatrix( _id, key)
		res.send(updatedVendor)
	} catch (err) {
		res.status(500).send("Error on updating Vendor's matrix")
	}
})

router.get('/any-step', async (req, res) => {
	const { id } = req.query
	try {
		const project = await Projects.findOne({ 'steps.vendor': id })
		res.send(project)
	} catch (err) {
		res.status(500).send("Error on gettinf any step with current Vendor")
	}
})

router.get('/lang-tests', async (req, res) => {
	try {
		const tests = await getLangTests({})
		res.send(tests)
	} catch (err) {
		res.status(500).send("Error on getting lang tests for vendors")
	}
})

router.post('/lang-test', upload.fields([ { name: 'testFile' } ]), async (req, res) => {
	const stringifiedData = req.body
	const langTest = Object.keys(stringifiedData).reduce((acc, cur) => {
		acc[cur] = JSON.parse(stringifiedData[cur])
		return acc
	}, {})
	const { testFile } = req.files
	const file = testFile ? testFile[0] : ""
	try {
		await updateLangTest(langTest, file)
		res.send("saved")
	} catch (err) {
		res.status(500).send("Error on updating lang tests for vendors")
	}
})

router.post('/remove-lang-test', async (req, res) => {
	const { _id, path } = req.body
	try {
		await removeLangTest(_id, path)
		res.send("removed")
	} catch (err) {
		res.send(500).send("Error on removing lang tests for vendors")
	}
})

router.post('/test-emails', async (req, res) => {
	const { vendor, qualification, testPath, message } = req.body
	try {
		await notifyTestStatus({ vendor, qualification, testPath, template: message })
		res.send('email sent')
	} catch (err) {
		res.send(500).send('Error on sending test status email to vendor')
	}
})

router.post('/send-email', async (req, res) => {
	const { vendorId, message } = req.body
	try {
		await sendMessageToVendor(vendorId, message)
		res.send('Sent!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on sending message to vendor')
	}
})

router.post('/get-message', async (req, res) => {
	try {
		const message = await testSentMessage(req.body)
		res.send({ message })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting quote message')
	}
})

router.get('/get-vendor-wordcount-from-reports/:id', async (req, res) => {
	const { id } = req.params
	try {
		const result = await getVendorAssessmentsWordCount(id)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting quote message')
	}
})

router.get('/create-memoq-vendor/:id', async (req, res) => {
	const { id } = req.params
	const vendor = await Vendors.findOne({ _id: id })
	const guid = await createMemoqUser(vendor, true)
	if (guid) {
		await Vendors.updateOne({ _id: id }, { guid })
		res.status(200).send('Saved')
	} else {
		res.status(500).send('Error on creating vendor in memoQ')
	}
})

router.get("/delete-memoq-vendor/:id", async (req, res) => {
	const { id } = req.params
	const { guid } = await Vendors.findOne({ _id: id })
	if (guid) {
		await deleteMemoqUser(guid)
		await Vendors.updateOne({ _id: id }, { guid: null })
		res.status(200).send('Deleted')
	} else {
		res.status(500).send('Error on deleting vendor in memoQ')
	}
})

module.exports = router

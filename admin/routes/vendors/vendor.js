const router = require('express').Router()
const { checkVendor } = require('../../middleware')
const jwt = require("jsonwebtoken")
const { secretKey } = require('../../configs')
const { Vendors, PaymentTerms } = require('../../models')
const {
	getVendor,
	getVendorAfterUpdate,
	saveHashedPassword,
	getPhotoLink,
	removeOldVendorFile,
	getJobs,
	updateStepProp,
	hasVendorCompetenciesAndPending,
	managePaymentMethods,
	getVendorForPortal, getVendorExtraForPortal
} = require('../../vendors')
const { upload, sendEmail } = require('../../utils')
const { setVendorNewPassword } = require('../../users')
const { createMemoqUser } = require('../../services/memoqs/users')
const { sendMemoqCredentials } = require('../../emailMessages/vendorCommunication')
const { assignMemoqTranslator, getProject, updateProjectProgress, regainWorkFlowStatusByStepId } = require('../../projects')
const { getMemoqUsers } = require('../../services/memoqs/users')
const { setMemoqDocumentWorkFlowStatus } = require('../../services/memoqs/projects')
const { storeFiles, updateNonWordsTaskTargetFiles, downloadCompletedFiles, updateProject } = require('../../projects')
const {
	getPayableByVendorId,
	getPayablePaidByVendorId,
	setPayablesNextStatus,
	getPaidPayables,
	getPayable,
	clearPayablesStepsPrivateKeys,
	invoiceSubmission,
	invoiceReloadFile,
	createBill,
	updatePayable,
	addFile,
	removeFile
} = require('../../invoicingPayables')
const moment = require("moment")


router.get("/reports", checkVendor, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const reports = await getPayableByVendorId(verificationResult.vendorId)
		res.send(Buffer.from(JSON.stringify(reports)).toString('base64'))
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting reports info. Try later.")
	}
})

router.get("/paid-reports", checkVendor, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const reports = await getPayablePaidByVendorId(verificationResult.vendorId)
		res.send(Buffer.from(JSON.stringify(reports)).toString('base64'))
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting reports info. Try later.")
	}
})

router.get("/get-report", checkVendor, async (req, res) => {
	const { reportId } = req.query
	try {
		let reports = await getPayable(reportId)
		reports = await clearPayablesStepsPrivateKeys(reports)
		res.send(Buffer.from(JSON.stringify(reports)).toString('base64'))
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting report info. Try later.")
	}
})

router.get("/get-report-paid", checkVendor, async (req, res) => {
	const { reportId } = req.query
	try {
		let reports = await getPaidPayables(reportId)
		reports = await clearPayablesStepsPrivateKeys(reports)
		res.send(Buffer.from(JSON.stringify(reports)).toString('base64'))
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting report info. Try later.")
	}
})


router.post("/approve-report", checkVendor, async (req, res) => {
	try {
		const { reportsIds, nextStatus } = req.body
		await setPayablesNextStatus(reportsIds, nextStatus)
		let reports = await getPayable(reportsIds[0])
		reports = clearPayablesStepsPrivateKeys(reports)
		res.send(Buffer.from(JSON.stringify(reports)).toString('base64'))
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on approve-report.")
	}
})

router.post('/zoho-bill-creation', checkVendor, async (req, res) => {
	try {
		const { paymentMethod, reportsIds, notes } = req.body
		const [ report ] = await getPayable(reportsIds[0])
		let { _id, vendor, reportId, steps, paymentDetails, lastPaymentDate } = report
		const vendorName = vendor.firstName + ' ' + vendor.surname

		if (!vendor.billingInfo.hasOwnProperty('paymentTerm') || !vendor.billingInfo.paymentTerm._id) {
			const getPaymentTerms = await PaymentTerms.find()
			const { billingInfo } = vendor
			billingInfo.paymentTerm = getPaymentTerms.find(item => item.name === '30 Days') || getPaymentTerms[0]
			vendor = await getVendorAfterUpdate({ _id: vendor._id }, { billingInfo })
		}

		const rate = steps.reduce((acc, { nativeFinance }) => {
			acc += nativeFinance.Price.payables
			return acc
		}, 0)

		const monthAndYear = moment(lastPaymentDate).format("MMMM YYYY")

		const lineItems = [{
			"name": `TS ${monthAndYear}`,
			"account_id": "335260000002330131",
			"rate": rate,
			"quantity": 1

		}]

		const expectedPaymentDate = moment().add(vendor.billingInfo.paymentTerm.value, 'days').format('YYYY-MM-DD')
		paymentDetails.paymentMethod = paymentMethod
		paymentDetails.expectedPaymentDate = new Date(expectedPaymentDate)

		const { bill } = await createBill(expectedPaymentDate, vendorName, vendor.email, reportId, lineItems, notes)
		await updatePayable(_id, { zohoBillingId: bill.bill_id, paymentDetails })
		res.send('Done')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error / Cannot create bill file (invoice-submission)')
	}
})

router.post('/invoice-submission', checkVendor, upload.fields([ { name: 'invoiceFile' } ]), async (req, res) => {
	try {
		const { invoiceFile } = req.files
		const { reportId, zohoBillingId } = req.body
		const newPath = await invoiceSubmission({ reportId, invoiceFile })
		await addFile(zohoBillingId, newPath)
		res.send('Done')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error / Cannot add invoice file (invoice-submission)')
	}
})

router.post('/invoice-reload', checkVendor, upload.fields([ { name: 'invoiceFile' } ]), async (req, res) => {
	try {
		const { invoiceFile } = req.files
		const { reportId, expectedPaymentDate, oldPath, zohoBillingId } = req.body
		const newPath = await invoiceReloadFile({ reportId, expectedPaymentDate, invoiceFile, oldPath })
		await removeFile(zohoBillingId)
		await addFile(zohoBillingId, newPath)
		res.send('Done')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error / Cannot add invoice file (invoice-submission)')
	}
})

router.post("/login", async (req, res, next) => {
	if (req.body.logemail) {
		Vendors.authenticate(req.body.logemail, req.body.logpassword, async (error, vendor) => {
			if (error || !vendor) {
				let err = new Error('Wrong email or password.')
				err.status = 401
				res.status(401).send("Wrong email or password.")
			} else {
				try {
					const token = await jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: '12h' })
					res.statusCode = 200
					res.send(token)
				} catch (err) {
					console.log(err)
					res.status(500).send("Server Error. Try again later.")
				}
			}
		})
	} else {
		let err = new Error('All fields required.')
		err.status = 400
		res.status(400).send("All fields required.")
	}
})

router.post("/reset-pass", async (req, res) => {
	const { email } = req.body
	try {
		const vendor = await Vendors.findOne({ "email": email })
		if (!vendor) {
			return res.status(400).send("No such a user in the system. Please, contact vendor coordinator.")
		}
		await setVendorNewPassword(vendor, email)
		res.send("New password sent.")
	} catch (err) {
		console.log(err)
		res.status(500).send("Server error. Try again later.")
	}
})

router.get("/portal-vendor-info", checkVendor, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const vendor = await getVendorForPortal({ "_id": verificationResult.vendorId })
		res.send(vendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Vendor info. Try later.")
	}
})

router.get("/portal-vendor-extra-info", checkVendor, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const vendor = await getVendorExtraForPortal({ "_id": verificationResult.vendorId })
		res.send(vendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Vendor info. Try later.")
	}
})



router.get("/has-competencies", checkVendor, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const vendor = await hasVendorCompetenciesAndPending(verificationResult.vendorId)
		res.send({ check: vendor })
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Vendor info. Try later.")
	}
})

router.post("/info", checkVendor, upload.fields([ { name: 'photo' } ]), async (req, res) => {
	let info = JSON.parse(req.body.info)
	let { id, password } = req.body
	const photoFile = req.files["photo"]
	try {
		if (password) {
			await saveHashedPassword(id, password)
		}
		if (photoFile) {
			let oldPath = info.photo
			info.photo = await getPhotoLink(id, photoFile)
			await removeOldVendorFile(oldPath, info.photo)
		}
		const vendor = await getVendorAfterUpdate({ "_id": id }, { ...info })
		res.send(Buffer.from(JSON.stringify(vendor)).toString('base64'))
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on saving data. Try later.")
	}
})

router.get("/jobs", checkVendor, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const jobs = await getJobs(verificationResult.vendorId)
		res.send(Buffer.from(JSON.stringify(jobs)).toString('base64'))
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting jobs.")
	}
})

router.post("/job", checkVendor, async (req, res) => {
	const { jobId, status } = req.body
	try {
		await updateStepProp({ jobId, prop: 'status', value: status })
		res.send("Status updated")
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on changing job status")
	}
})

router.post("/selected-job", checkVendor, async (req, res) => {
	const { jobId, value } = req.body
	try {
		await updateProject({ "steps._id": jobId }, { $set: { "steps.$.isVendorRead": value } }, { arrayFilters: [ { 'i._id': jobId } ] })
		res.send("Terms agreement status changed")
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on checking job's terms agreement")
	}
})

router.post("/create-memoq-vendor", checkVendor, async (req, res) => {
	const { token } = req.body
	const { vendorId } = jwt.verify(token, secretKey)
	const vendor = await Vendors.findOne({ _id: vendorId })
	const guid = await createMemoqUser(vendor, true)
	if (guid) {
		const message = sendMemoqCredentials(vendor)
		const subject = `MemoQ account`
		await sendEmail({ to: vendor.email, subject }, message)
		await Vendors.updateOne({ _id: vendorId }, { guid })
		res.status(200).send('Saved')
	} else {
		res.status(500).send('Error on creating vendor in memoQ')
	}
})

router.post("/assign-translator", checkVendor, async (req, res) => {
	const { token, stepId, projectId, stepAction } = req.body
	try {
		const { vendorId } = jwt.verify(token, secretKey)

		await assignMemoqTranslator(vendorId, stepId, projectId)

		const { memoqProjectId: projectGuid, memoqDocIds, workFlowStatus } = await regainWorkFlowStatusByStepId(stepId, stepAction)
		for (let documentGuid of memoqDocIds) {
			await setMemoqDocumentWorkFlowStatus(projectGuid, documentGuid, workFlowStatus)
		}
		res.send('Assigned')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on assigning vendor as translator')
	}
})

router.post("/set-workFlowStatus", checkVendor, async (req, res) => {
	const { stepId, stepAction } = req.body
	const { memoqProjectId: projectGuid, memoqDocIds, workFlowStatus } = await regainWorkFlowStatusByStepId(stepId, stepAction)
	for (let documentGuid of memoqDocIds) {
		await setMemoqDocumentWorkFlowStatus(projectGuid, documentGuid, workFlowStatus)
	}
	try {
		res.status(200).send('Done')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on change work flow document status!')
	}
})

router.get('/get-memoq-users', checkVendor, async (req, res) => {
	try {
		const users = await getMemoqUsers()
		res.send(Buffer.from(JSON.stringify(users)).toString('base64'))
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting Memoq Users')
	}
})

router.post("/rewrite-quid-for-translator", checkVendor, async (req, res) => {
	const { token, memoqUsers } = req.body
	try {
		const { vendorId } = jwt.verify(token, secretKey)
		const vendor = await Vendors.findOne({ "_id": vendorId })
		const { id } = memoqUsers.find(item => item.email === vendor.email)
		vendor.guid = id
		await Vendors.updateOne({ _id: vendorId }, vendor)
		res.status(200).send('Updated!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on assigning vendor as translator')
	}
})

router.post("/reopen-task-workFlowStatus", checkVendor, async (req, res) => {
	const { projectGuid, documentGuid, workFlowStatus } = req.body
	try {
		await setMemoqDocumentWorkFlowStatus(projectGuid, documentGuid, workFlowStatus)
		res.status(200).send('Opened!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on change work flow document status!')
	}
})

router.post('/project', checkVendor, async (req, res) => {
	const { id } = req.body
	try {
		const project = await getProject({ '_id': id })
		res.send(Buffer.from(JSON.stringify(project)).toString('base64'))
	} catch (err) {
		console.log(err)
		console.log('Error on getting Project')
	}
})

router.post('/update-progress', checkVendor, async (req, res) => {
	const { projectId, isCatTool } = req.body
	try {
		const project = await getProject({ '_id': projectId })
		const result = await updateProjectProgress(project, isCatTool)
		res.send('updateProjectProgress')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting metrics ')
	}
})

router.post('/step-target-new-request', checkVendor, upload.fields([ { name: 'targetFile' } ]), async (req, res) => {
	const { jobId } = req.body
	try {
		const project = await getProject({ 'steps._id': jobId })
		const { targetFile } = req.files
		const paths = await storeFiles(targetFile, project.id)
		await updateNonWordsTaskTargetFiles({ project, paths, jobId })
		res.send(true)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error / Cannot add Target file to the Steps array of Project')
	}
})

router.post('/step-target', checkVendor, upload.fields([ { name: 'targetFile' } ]), async (req, res) => {
	const { jobId } = req.body
	try {
		const project = await getProject({ 'steps._id': jobId })
		const { targetFile } = req.files

		const paths = await storeFiles(targetFile, project.id)
		await updateNonWordsTaskTargetFiles({ project, paths, jobId })
		res.send(true)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error / Cannot add Target file to the Steps array of Project')
	}
})

router.post('/target-files', async (req, res) => {
	const { stepId } = req.body
	try {
		await downloadCompletedFiles(stepId)
		res.send("Files downloaded")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/pending-competencies", checkVendor, async (req, res) => {
	const { pendingCompetencies, token } = req.body
	try {
		const { vendorId } = jwt.verify(token, secretKey)
		await Vendors.updateOne({ "_id": vendorId }, { pendingCompetencies })
		res.send('done')
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get("/payment-terms", checkVendor, async (req, res) => {
	try {
		const getPaymentTerms = await PaymentTerms.find()
		res.send(getPaymentTerms)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post("/payment-terms/:id/update", checkVendor, async (req, res) => {
	const { id } = req.params
	const { billingInfo } = req.body
	try {
		const vendor = await Vendors.updateOne({ _id: id }, { billingInfo })
		res.send(vendor)
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.post('/manage-payment-methods', async (req, res) => {
	const { vendorId, paymentTypeObj, index } = req.body
	try {
		const updatedVendor = await managePaymentMethods({ vendorId, paymentTypeObj, index })
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on /manage-payment-methods")
	}
})

router.post('/manage-payment-methods/:_id/:index/delete', async (req, res) => {
	try {
		const { _id, index } = req.params
		await getVendorAfterUpdate({ _id }, { $unset: { [`billingInfo.paymentMethod.${ index }`]: 1 } })
		const updatedVendor = await getVendorAfterUpdate({ _id }, { $pull: { "billingInfo.paymentMethod": null } })
		res.send(updatedVendor)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on get /deleting | payment-terms')
	}
})


module.exports = router

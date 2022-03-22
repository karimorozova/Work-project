const router = require('express').Router()

const { Languages, Vendors, InvoicingPayables } = require('../models')
const {
	getAllPayables,
	getPayable,
	payablesAddSteps,
	payableDeleteSteps,
	getAllSteps,
	addStepsToPayables,
	stepsFiltersQuery,
	payablesFiltersQuery,
	setPayablesNextStatus,
	payableDelete,
	paidOrAddPaymentInfo,
	getAllPaidPayables,
	getPaidReport,
	createNewPayable,
	updatePayableFromZoho,
	updatePayablesFromZoho,
	getPayableByVendorId,
	notifyVendorReportsIsSent,
	notifyVendorReportsIsPaid,
	invoiceSubmission,
	rollBackFromPaidToDraft,
	getShortReportList,
	getPaidShortReportList, createBillZohoRequest
} = require('../invoicingPayables')

const { ObjectID: ObjectId } = require("mongodb")
const upload = require("../utils/uploads")
const moment = require("moment")

router.get('/short-report-list', async (req, res) => {
	try {
		const reports = await getShortReportList()
		res.send(reports)
	} catch (err) {
		console.log(err)
		console.log('Error on getting Reports')
	}
})

router.get('/short-paid-report-list', async (req, res) => {
	try {
		const reports = await getPaidShortReportList()
		res.send(reports)
	} catch (err) {
		console.log(err)
		console.log('Error on getting Reports')
	}
})

router.post("/manage-report-status", async (req, res) => {
	const { nextStatus } = req.body
	try {
		const { reportsIds } = req.body
		switch (nextStatus) {
			case "Sent":
				await setPayablesNextStatus(reportsIds, nextStatus)
				await notifyVendorReportsIsSent(reportsIds)
				break
			case "Approved":
			case "Created":
				await setPayablesNextStatus(reportsIds, nextStatus)
				break
		}
		res.send('Done!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on manage-report-status')
	}
})

router.post("/rollback-invoiceReport-from-paid", async (req, res) => {
	try {
		const { reportsIds } = req.body
		await rollBackFromPaidToDraft(reportsIds)
		res.send('Done!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on manage-report-status')
	}
})

router.post('/invoice-submission', upload.fields([ { name: 'invoiceFile' } ]), async (req, res) => {
	try {
		const { invoiceFile } = req.files
		const { reportId, paymentMethod, vendorId } = req.body
		await invoiceSubmission({ reportId, vendorId, invoiceFile, paymentMethod })
		res.send('Done!')
	} catch (err) {
		console.log(err)
		res.status(500).send('Error / Cannot add invoice file (invoice-submission)')
	}
})

router.post("/not-selected-steps-list", async (req, res) => {
	const { countToSkip, countToGet, filters } = req.body
	const allLanguages = await Languages.find()
	try {
		const query = stepsFiltersQuery(filters, allLanguages)
		const steps = await getAllSteps(countToSkip, countToGet, query)
		res.send(steps)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

// TODO Zoho (soon)
// router.get("/update-all-state-from-zoho", async (req, res) => {
// 	try {
// 		const statusAction = await updatePayablesFromZoho()
// 		res.send(statusAction)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on getting steps')
// 	}
// })

// router.get("/update-state-from-zoho/:id", async (req, res) => {
// 	const { id } = req.params
// 	try {
// 		const result = await updatePayableFromZoho(id)
// 		res.send(result)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on getting steps')
// 	}
// })

router.post("/not-selected-steps-list/:vendor", async (req, res) => {
	const { vendor } = req.params
	try {
		const query = { "steps.vendor": ObjectId(vendor) }
		const steps = await getAllSteps(0, 0, query)
		res.send(steps)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/reports", async (req, res) => {
	try {
		const { countToSkip, countToGet, filters } = req.body
		const allVendors = await Vendors.find({}, { billingInfo: 1 })
		const query = payablesFiltersQuery(filters, allVendors)
		const reports = await getAllPayables(countToSkip, countToGet, query)
		res.send(reports)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/paid-reports", async (req, res) => {
	try {
		const { countToSkip, countToGet, filters } = req.body
		const allVendors = await Vendors.find({}, { billingInfo: 1 })
		const query = payablesFiltersQuery(filters, allVendors)
		const reports = await getAllPaidPayables(countToSkip, countToGet, query)
		res.send(reports)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/reports-final-status", async (req, res) => {
	const data = req.body
	try {
		for await (let [ reportId, {
			paidAmount,
			unpaidAmount,
			paymentMethod,
			paymentDate,
			notes,
			vendorName,
			vendorEmail,
			zohoBillingId,
			reportTextId,
			dueDate
		} ] of Object.entries(data)) {

			let zohoPaymentId = ''
			paidAmount = paidAmount.toFixed(2)
			if (!zohoBillingId) {
				const paymentDateMonthAndYear = moment(paymentDate).format('MMMM YYYY')
				const dueDateFormatted = moment(dueDate).format('YYYY-MM-DD')
				const lineItems = [ {
					"name": `TS ${ paymentDateMonthAndYear }`,
					"account_id": "335260000002330131",
					"rate": paidAmount + unpaidAmount,
					"quantity": 1
				} ]
				const { bill } = await createBillZohoRequest(dueDateFormatted, '', vendorEmail, reportTextId, lineItems)
				zohoBillingId = bill?.bill_id || ''

				await InvoicingPayables.updateOne({ _id: reportId }, { zohoBillingId })
				if (zohoBillingId) zohoPaymentId = await createNewPayable(vendorName, vendorEmail, zohoBillingId, paidAmount)
			} else {
				zohoPaymentId = await createNewPayable(vendorName, vendorEmail, zohoBillingId, paidAmount)
			}
			await paidOrAddPaymentInfo(reportId, { paidAmount, unpaidAmount, paymentMethod, paymentDate, notes }, zohoPaymentId)
			await notifyVendorReportsIsPaid(true, { reportId })
		}
		res.send('success')
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/report-final-status/:reportId", async (req, res) => {
	const { reportId } = req.params
	const { paidAmount, unpaidAmount, paymentMethod, paymentDate, notes, vendorName, vendorEmail, reportTextId, dueDate } = req.body
	let { zohoBillingId } = req.body
	let zohoPaymentId = ''
	try {
		// TODO Zoho (soon)
		if (!zohoBillingId) {
			const paymentDateMonthAndYear = moment(paymentDate).format('MMMM YYYY')
			const dueDateFormatted = moment(dueDate).format('YYYY-MM-DD')
			const lineItems = [ {
				"name": `TS ${ paymentDateMonthAndYear }`,
				"account_id": "335260000002330131",
				"rate": paidAmount + unpaidAmount,
				"quantity": 1
			} ]
			const { bill = '' } = await createBillZohoRequest(dueDateFormatted, '', vendorEmail, reportTextId, lineItems)
			zohoBillingId = bill?.bill_id || ''

			await InvoicingPayables.updateOne({ _id: reportId }, { zohoBillingId })

			if (zohoBillingId) zohoPaymentId = await createNewPayable(vendorName, vendorEmail, zohoBillingId, paidAmount)
		} else {
			zohoPaymentId = await createNewPayable(vendorName, vendorEmail, zohoBillingId, paidAmount)
		}

		const result = await paidOrAddPaymentInfo(reportId, { paidAmount, unpaidAmount, paymentMethod, paymentDate, notes }, zohoPaymentId)
		result === 'Success'
				? await notifyVendorReportsIsPaid(false, { reportId })
				: await notifyVendorReportsIsPaid(true, { reportId })

		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/report/:id", async (req, res) => {
	const { id } = req.params
	try {
		const report = await getPayable(id)
		res.send(report)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/paid-report/:id", async (req, res) => {
	const { id } = req.params
	try {
		const report = await getPaidReport(id)
		res.send(report)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.get("/report/:id/delete", async (req, res) => {
	const { id } = req.params
	try {
		const report = await payableDelete(id)
		res.send(report)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/delete-reports", async (req, res) => {
	const { reportIds } = req.body
	try {
		for await (const reportId of reportIds) {
			await payableDelete(reportId)
		}

		res.send("success")
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on deleting reports')
	}
})

router.post("/report/:reportId/delete", async (req, res) => {
	const { reportId } = req.params
	const { stepsId } = req.body
	try {
		const report = await payableDeleteSteps(reportId, stepsId)
		res.send(report)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/report/:reportId/steps/add", async (req, res) => {
	const { reportId } = req.params
	const { checkedProjects } = req.body
	try {
		const report = await payablesAddSteps(reportId, checkedProjects)
		res.send(report)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.post("/create", async (req, res) => {
	const { checkedProjects, createdBy } = req.body
	try {
		await addStepsToPayables(checkedProjects, createdBy)
		res.send("success")
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on getting steps')
	}
})

router.get("/vendor-reports/:vendorId", async (req, res) => {
	const { vendorId } = req.params
	try {
		const reports = await getPayableByVendorId(vendorId)
		res.send(reports)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting reports info. Try later.")
	}
})

module.exports = router
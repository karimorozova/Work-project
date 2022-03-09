// const router = require('express').Router()
// const { Languages } = require('../models')
// const ObjectId = require("mongodb").ObjectID
// const { createDir } = require('../invoicingPayables/PayablesFilesAndDirecrory')
// const DIR = './dist/clientReportsFiles/'
//
// const {
// 	getAllSteps,
// 	createReports,
// 	reportsFiltersQuery,
// 	receivableDelete,
// 	deleteStepFromReport,
// 	createZohoInvoice,
// 	createAndSendZohoInvoice,
// 	sendInvoice,
// 	updateReportsStateFromZoho,
// 	updateReportStateFromZoho,
// 	getAllPaidReceivables,
// 	getPaidReceivables,
// 	paidOrAddPaymentInfo,
// 	setInvoiceStatus,
// 	createCustomerPayment,
// 	getAllReportsFromDb
// } = require('../invoicingReceivables-Old')
//
// const {
// 	stepsFiltersQuery
// } = require('../invoicingPayables')

// router.post("/zoho/createInvoice", async (req, res) => {
// 	const { _id } = req.body
// 	try {
// 		await createDir(DIR, _id)
// 		const messageAndType = await createZohoInvoice(_id)
// 		res.send(messageAndType)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on /zoho/createInvoice')
// 	}
// })
//
// router.post("/zoho/createAndSendInvoice", async (req, res) => {
// 	const { _id } = req.body
// 	try {
// 		await createDir(DIR, _id)
// 		const messageAndType = await createAndSendZohoInvoice(_id)
// 		res.send(messageAndType)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on /zoho/createAndSendInvoice')
// 	}
// })
//
// router.post("/sendInvoice", async (req, res) => {
// 	const { _id } = req.body
// 	try {
// 		const messageAndType = await sendInvoice(_id)
// 		res.send(messageAndType)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on /sendInvoice')
// 	}
// })
//
// router.get("/update-reports-state-from-zoho", async (req, res) => {
// 	try {
// 		const messageAndType = await updateReportsStateFromZoho()
// 		res.send(messageAndType)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on /sendInvoice')
// 	}
// })
//
// router.get("/update-report-state-from-zoho/:id", async (req, res) => {
// 	const { id } = req.params
// 	try {
// 		const messageAndType = await updateReportStateFromZoho(id)
// 		res.send(messageAndType)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on /sendInvoice')
// 	}
// })
//
// router.post("/paid-reports", async (req, res) => {
// 	try {
// 		const { countToSkip, countToGet, filters } = req.body
// 		const query = reportsFiltersQuery(filters)
// 		// const query = {}
// 		const reports = await getAllPaidReceivables(countToSkip, countToGet, query)
// 		res.send(reports)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on getting steps')
// 	}
// })
//
// router.post("/paid-report/:id", async (req, res) => {
// 	const { id } = req.params
// 	try {
// 		const report = await getPaidReceivables(id)
// 		res.send(report)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on getting steps')
// 	}
// })
//
// router.post("/report-final-status/:reportId", async (req, res) => {
// 	const { reportId } = req.params
// 	const { paidAmount, unpaidAmount, paymentMethod, paymentDate, notes } = req.body
//
// 	try {
// 		await createCustomerPayment(reportId, paidAmount)
// 		const result = await paidOrAddPaymentInfo(reportId, { paidAmount, unpaidAmount, paymentMethod, paymentDate, notes })
// 		res.send(result.status)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on getting steps')
// 	}
// })
//
//
// module.exports = router
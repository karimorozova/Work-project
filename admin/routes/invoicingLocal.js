const router = require('express').Router()
const {
	createInvoice,
	createInvoiceItem,
	createInvoiceFromReport,
	getInvoices,
	getInvoice,
	updateInvoice,
	updateInvoiceItem,
	deleteInvoiceItem,
	deleteInvoiceItemFromReport,
	getInvoicesForOptions
} = require('../invoicing')

router.post("/create-invoice", async (req, res) => {
	const { customerId, clientBillingInfoId } = req.body
	try {
		const invoice = await createInvoice(customerId, clientBillingInfoId)
		res.json({ id: invoice._id })
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

router.post("/invoices-list", async (req, res) => {
	try {
		const { page, limit } = req.query
		const { filters } = req.body
		const invoices = await getInvoices({}, page, limit, filters)
		res.json(invoices)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

router.post("/invoices-list-for-options", async (req, res) => {
	const { query } = req.body
	try {
		const invoices = await getInvoicesForOptions(query)
		res.json(invoices)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

router.get("/invoice/:id", async (req, res) => {
	try {
		const { id } = req.params
		const invoice = await getInvoice(id)
		res.json(invoice)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

router.post("/invoice/:id", async (req, res) => {
	try {
		const { id } = req.params
		await updateInvoice(id, req.body)
		res.json(await getInvoice(id))
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

// router.get("/invoice/:id/item", async (req, res) => {
// 	try {
// 		const { id } = req.params
// 		const invoice = await getInvoice(id)
// 		res.json(invoice)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong on invoicing')
// 	}
// })
//
router.post("/invoice/:id/create-item", async (req, res) => {
	try {
		const { id } = req.params
		const invoice = await createInvoiceItem(id, req.body)
		res.json(invoice)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})
router.put("/invoice/:id/item/:itemId", async (req, res) => {
	try {
		const { id, itemId } = req.params
		const invoice = await updateInvoiceItem(id, itemId, req.body)
		res.json(invoice)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

router.delete("/invoice/:id/item/:itemId", async (req, res) => {
	try {
		const { id, itemId } = req.params
		const invoice = await deleteInvoiceItem(id, itemId)
		res.json(invoice)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})
//========================================================================

router.post("/create-invoice-from-report", async (req, res) => {
	try {
		const { _reportId, _customerId, _clientBillingInfoId, item } = req.body
		await createInvoiceFromReport({ _reportId, _customerId, _clientBillingInfoId, item })
		res.send("Done!")
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on creating invoicing')
	}
})

router.delete("/invoice-from-report/:reportId/invoice/:invoiceId", async (req, res) => {
	const { invoiceId, reportId } = req.params
	try {
		await deleteInvoiceItemFromReport(invoiceId, reportId)
		res.send("Done!")
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

module.exports = router

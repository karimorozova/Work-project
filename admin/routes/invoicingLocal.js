const router = require('express').Router();
const { createInvoice } = require('../invoicing')

router.post("/create-invoice", async (req, res) => {
	const { customerId, clientBillingInfoId } = req.body
	try {
		const invoice = await createInvoice(customerId, clientBillingInfoId)
		res.json({id: invoice._id})
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})


module.exports = router
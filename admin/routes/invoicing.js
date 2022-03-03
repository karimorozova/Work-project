const router = require('express').Router();


router.get("/invoicing", async (req, res) => {
	const {  } = req.body
	try {

		res.json()
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

router.get("/invoicing/:invoiceId", async (req, res) => {
	const { invoiceId } = req.params
	try {

		res.json()
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})

router.post("/invoicing/:invoiceId", async (req, res) => {
	const { invoiceId } = req.body
	const {  } = req.body
	try {

		res.json()
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})


router.delete("/invoicing/:invoiceId/report/:reportId", async (req, res) => {
	const { invoiceId, reportId  } = req.params
	try {

		res.json()
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong on invoicing')
	}
})




module.exports = router
const router = require('express').Router()
const jwt = require("jsonwebtoken")
const { secretKey } = require('../configs')

router.post("/vendor", async (req, res, next) => {
	const { vendorId } = req.body

	const token = await jwt.sign({ vendorId: vendorId }, secretKey, { expiresIn: '12h' })
	res.statusCode = 200
	res.cookie("testt", 'value', {domain: 'localhost'}).send(token)


	// if (req.body.logemail) {
	// 	Vendors.authenticate(req.body.logemail, req.body.logpassword, async (error, vendor) => {
	// 		if (error || !vendor) {
	// 			let err = new Error('Wrong email or password.')
	// 			err.status = 401
	// 			res.status(401).send("Wrong email or password.")
	// 		} else {
	// 			try {
	// 				const token = await jwt.sign({ vendorId: vendor._id }, secretKey, { expiresIn: '2h' })
	// 				res.statusCode = 200
	// 				res.send(token)
	// 			} catch (err) {
	// 				console.log(err)
	// 				res.status(500).send("Server Error. Try again later.")
	// 			}
	// 		}
	// 	})
	// } else {

		// let err = new Error('All fields required.')
		// err.status = 400
		// res.status(400).send("All fields required.")

	// }
})

module.exports = router
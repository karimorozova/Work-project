const router = require('express').Router()
const { User, Requests, Reports } = require('../models')
const { getVendors } = require('../vendors')
const { gerFilteredClients, getClientsForNewProject } = require('../clients')
const { requiresLogin } = require('../middleware/index')
const jwt = require("jsonwebtoken")
const { secretKey } = require('../configs')
const { setNewPassword } = require('../users')
const { OAuth2Client } = require('google-auth-library')
const { sendResetToken, changePass } = require("../helpers/passwordReset")
const { googleOAuth } = require("../helpers/oAuth")

router.get('/logout', (req, res, next) => {
	// if (req.cookies.admin) {
	res.clearCookie("admin")
	return res.status(200).send()
	// }
})

router.post('/reset-pass', async (req, res) => {
	const { email } = req.body
	try {
		const user = await User.findOne({ "email": email })
		if (!user) {
			return res.status(400).send("No such user")
		}
		await setNewPassword(user)
		return res.send("new password sent")
	} catch (err) {
		console.log(err)
		res.status(500).send("Server error. Try again later.")
	}
})

router.post('/all-clients', requiresLogin, async (req, res) => {
	const { filters } = req.body
	try {
		const clients = await gerFilteredClients(filters)
		res.send(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.post('/check-jwt', async (req, res) => {
	const { admin } = req.cookies
	try {
		const date = Date.now()
		const jwtObj = jwt.verify(admin, secretKey)
		if (jwtObj) {
			if (date > new Date(jwtObj.timestamp)) return res.status(401).send()
			return res.status(200).json({ status: "Success" })
		}
		// res.clearCookie('admin')
		// return res.status(401).send()
	} catch (err) {
		res.status(500).send()
	}
})

router.get('/active-clients', requiresLogin, async (req, res) => {
	try {
		const clients = await getClientsForNewProject()
		res.send(clients)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Clients from DB ")
	}
})

router.get('/all-vendors', requiresLogin, async (req, res) => {
	try {
		const { filter } = req.query
		const query = filter ? { status: filter } : {}
		const vendors = await getVendors(query)
		res.send(vendors)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Vendors from DB ")
	}
})

router.get('/users', requiresLogin, async (req, res, next) => {
	try {
		const users = await User.find({}, {
			"_id": 1, firstName: 1, lastName: 1, email: 1
		}).populate('group')
		res.send(users)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Users from DB")
	}
})

router.get('/users-full', requiresLogin, async (req, res, next) => {
	try {
		const users = await User.find({}, { password: 0 }).populate('group')
		res.send(users)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Users from DB")
	}
})

router.get('/user', requiresLogin, async (req, res, next) => {
	try {
		const userFromJWT = jwt.verify(req.cookies.admin, secretKey)
		const result = await User.findOne({ _id: userFromJWT.user._id }, { password: 0 }).populate("group")
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting User from DB")
	}
})

router.post('/user', requiresLogin, async (req, res) => {
	const { user } = req.body
	const { _id, firstName, lastName, email, position, group, isActive } = user
	try {
		if (_id) {
			await User.updateOne({ "_id": user._id }, { firstName, lastName, email, position, group, isActive })
		} else {
			const password = "pangea1234"
			await User.create({ password, firstName, lastName, email, position, group, isActive })
		}
		res.send("User info saved")
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on saving user info")
	}
})

router.delete("/user/:id", requiresLogin, async (req, res) => {
	const { id } = req.params
	try {
		await User.deleteOne({ "_id": id })
		const tokenValue = req.cookies.admin
		const result = jwt.verify(tokenValue, secretKey)
		if (result.user._id === id) {
			return res.send('logout')
		}
		res.send("User removed")
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on deleting user")
	}
})

router.get('/requests', requiresLogin, async (req, res, next) => {
	try {
		// const requests = await Requests.find()
		res.send('')
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Requests from DB ")
	}
})

router.get('/reps', requiresLogin, (req, res) => {
	Reports.find()
			.then(requests => {
				res.send(requests)
			})
			.catch(err => {
				console.log(err)
			})
})

router.post('/login', (req, res, next) => {
	let {email, password} = req.body
	if (email && password) {
		User.authenticate(email, password, async (error, user) => {
			if (error || (!user || (user?.isActive === undefined ? false : !user.isActive))) {
				const err = new Error('Wrong email or password.')
				err.status = 401
				return next(err)
			} else {
				try {
					const token = await jwt.sign({ user }, secretKey, { expiresIn: '12h' })
					res.statusCode = 200
					res.cookie('admin', token, { maxAge: 12 * 60 * 60 * 1000, httpOnly: true })
					res.status(200).send()
				} catch (err) {
					console.log(err)
					return next(err)
				}
			}
		})
	} else {
		let err = new Error('All fields required.')
		err.status = 400
		return next(err)
	}
})

router.post('/login-with-google', async (req, res, next) => {
	const { idToken, portal} = req.body
	try {
		const { status, token } = await googleOAuth(idToken, portal)
		res.cookie(portal, token, { maxAge: 12 * 60 * 60 * 1000 })
		res.status(200).send({status: "success", token})
	} catch (err) {
		res.send({ status: "error" })
	}
})

router.post('/pass-reset', async (req, res, next) => {
	const { pass, passRepeat, token } = req.body
	try {
		const result = await changePass(token, pass, passRepeat)
		res.status(200).send(result)
	} catch (err) {
		res.status(200).send({ status: "error", message: 'Something went wrong'})
	}
})

router.post('/pass-generate-mail', async (req, res, next) => {
	const { email, portal } = req.body
	try {
		sendResetToken(email, portal)
		res.send('success')
	} catch (err) {
		res.send({ status: "error" })
	}
})


module.exports = router

const jwt = require('jsonwebtoken')
const path = require("path")
const { User, Vendors, Clients } = require('../models')
const { secretKey } = require('../configs')

const middleware = {
	requiresLogin(req, res, next) {
		if (req.headers['token-header']) {
			try {
				const token = JSON.parse(req.headers['token-header']).value
				jwt.verify(token, secretKey, async (err, decoded) => {
					if (err) {
						return res.status(403).send(err)
					}
					const user = await User.findOne({ "_id": decoded.user._id })
					if (user) {
						return next()
					} else {
						return res.status(403).send("No such user")
					}
				})
			} catch (err) {
				res.status(401).send(err.message)
			}
		} else {
			const err = new Error('You must be logged in to view this page.')
			err.status = 401
			res.status(401)
			res.send(err.message)
		}
	},

	checkClientContact(req, res, next) {
		if (req.headers['token-header']) {
			try {
				const token = req.headers['token-header']
				jwt.verify(token, secretKey, async (err, decoded) => {
					if (err) {
						return res.status(403).send(err.message)
					}
					const client = await Clients.findOne({ "_id": decoded.clientId })
					if (client) {
						return next()
					} else {
						return res.status(403).send("No such user")
					}
				})
			} catch (err) {
				res.status(401).send(err.message)
			}
		} else {
			const err = new Error('You must be logged in to view this page.')
			err.status = 401
			res.status(401)
			res.send(err.message)
		}
	},

	checkVendor(req, res, next) {
		if (req.headers['token-header']) {
			try {
				const token = req.headers['token-header']
				jwt.verify(token, secretKey, async (err, decoded) => {
					if (err) {
						return res.status(403).send(err.message)
					}
					const vendor = await Vendors.findOne({ "_id": decoded.vendorId })
					if (vendor) {
						return next()
					} else {
						return res.status(403).send("No such user")
					}
				})
			} catch (err) {
				res.status(401).send(err.message)
			}
		} else {
			const err = new Error('You must be logged in to view this page.')
			err.status = 401
			res.status(401)
			res.send(err.message)
		}
	},

	getProjectManageToken(req, res, next) {
		if (req.query['t']) {
			try {
				const token = req.query['t']
				jwt.verify(token, secretKey, async (err, decoded) => {
					if (err) return res.status(403).send(err)
					return next()
				})
			} catch (err) {
				res.status(401).send(err.message)
			}
		} else {
			const err = new Error('Seems like you using wrong link.')
			err.status = 401
			res.status(401)
			res.send(err.message)
		}
	},

	checkRoutes(req, res, next) {
		let routesArray = [
			"^\/login(\\?.*)?$",
			"^\/forgot(\\?.*)?$",
			"^\/account\/settings(\\?.*)?$",
			"^\/pangea-dashboard\/overall-view(\\?.*)?$",
			"^\/pangea-dashboard\/sales-perfomance(\\?.*)?$",
			"^\/pangea-dashboard(\\?.*)?$",
			"^\/settings\/discounts(\\?.*)?$",
			"^\/settings\/api-customers(\\?.*)?$",
			"^\/settings\/leadsources(\\?.*)?$",
			"^\/settings\/groups(\\?.*)?$",
			"^\/settings\/languages(\\?.*)?$",
			"^\/settings\/services(\\?.*)?$",
			"^\/settings\/industries(\\?.*)?$",
			"^\/settings\/pricelists(\\?.*)?$",
			"^\/settings\/pricelists\/.*$",
			"^\/settings\/instructions(\\?.*)?$",
			"^\/settings\/cancel-reasons(\\?.*)?$",
			"^\/settings\/tiers-lqas(\\?.*)?$",
			"^\/settings\/industry-lqas(\\?.*)?$",
			"^\/settings\/users(\\?.*)?$",
			"^\/settings\/units(\\?.*)?$",
			"^\/settings(\\?.*)?$",
			"^\/vendors\/all(\\?.*)?$",
			"^\/vendors\/all\/details\/.*$",
			"^\/vendors\/active(\\?.*)?$",
			"^\/vendors\/active\/details\/.*$",
			"^\/vendors\/inactive(\\?.*)?$",
			"^\/vendors\/inactive\/details\/.*$",
			"^\/vendors\/candidates\/potential(\\?.*)?$",
			"^\/vendors\/candidates\/potential\/details\/.*$",
			"^\/vendors\/candidates\/tests(\\?.*)?$",
			"^\/vendors\/report\/pending-competencies-vendors(\\?.*)?$",
			"^\/vendors\/new-vendor(\\?.*)?$",
			"^\/vendors(\\?.*)?$",
			"^\/clients\/all(\\?.*)?$",
			"^\/clients\/all\/details\/.*\/$",
			"^\/clients\/all\/details\/.*\/new-contact(\\?.*)?$",
			"^\/clients\/all\/details\/.*\/contact\/.*$",
			"^\/clients\/all\/details\/.*$",
			"^\/clients\/active(\\?.*)?$",
			"^\/clients\/active\/details\/.*\/$",
			"^\/clients\/active\/details\/.*\/new-contact(\\?.*)?$",
			"^\/clients\/active\/details\/.*\/contact\/.*$",
			"^\/clients\/active\/details\/.*$",
			"^\/clients\/inactive(\\?.*)?$",
			"^\/clients\/inactive\/details\/.*\/$",
			"^\/clients\/inactive\/details\/.*\/new-contact(\\?.*)?$",
			"^\/clients\/inactive\/details\/.*\/contact\/.*$",
			"^\/clients\/inactive\/details\/.*$",
			"^\/clients\/potential$(\\?.*)?",
			"^\/clients\/potential\/details\/.*\/$",
			"^\/clients\/potential\/details\/.*\/new-contact$",
			"^\/clients\/potential\/details\/.*\/contact\/.*$",
			"^\/clients\/potential\/details\/.*$",
			"^\/clients\/new-client\/(\\?.*)?$",
			"^\/clients\/new-client\/new_contact(\\?.*)?$",
			"^\/clients\/new-client\/_contact\/.*$",
			"^\/clients\/new-client(\\?.*)?$",
			"^\/clients(\\?.*)?$",
			"^\/projects\/open-projects(\\?.*)?$",
			"^\/projects\/open-projects\/details\/.*$",
			"^\/projects\/quote-projects(\\?.*)?$",
			"^\/projects\/quote-projects\/details\/.*$",
			"^\/projects\/requests(\\?.*)?$",
			"^\/projects\/requests\/details\/.*$",
			"^\/projects\/closed-projects(\\?.*)?$",
			"^\/projects\/closed-projects\/details\/.*$",
			"^\/projects\/xtrf\/open-other-projects(\\?.*)?$",
			"^\/projects\/xtrf\/open-other-projects\/details\/.*$",
			"^\/projects\/xtrf\/closed-other-projects(\\?.*)?$",
			"^\/projects\/xtrf\/closed-other-projects\/details\/.*$",
			"^\/projects\/xtrf\/quote-other-projects(\\?.*)?$",
			"^\/projects\/xtrf\/quote-other-projects\/details\/.*$",
			"^\/projects\/xtrf(\\?.*)?$",
			"^\/projects\/create-project(\\?.*)?$",
			"^\/projects(\\?.*)?$",
			"^\/finance(\\?.*)?$",
			"^\/reports\/lang-pair-tier(\\?.*)?$",
			"^\/reports\/lqa(\\?.*)?$",
			"^\/reports\/upcoming-lqa(\\?.*)?$",
			"^\/reports\/benchmark(\\?.*)?$",
			"^\/reports\/pending-competencies(\\?.*)?$",
			"^\/reports(\\?.*)?"
		]

		for (let route of routesArray) {
			const regex = new RegExp(route, 'm')
			if (regex.test(req.originalUrl)) {
				res.sendFile(path.resolve('./dist/index.html'))
				return
			}
		}
		next()
	}
}

module.exports = middleware

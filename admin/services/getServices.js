const { Services, Units } = require('../models/')

async function getServices(obj) {
	let services = await Services.find(obj)
			.populate('steps.step').lean()
	return services
}

async function getService(obj) {
	const service = await Services.findOne(obj)
			.populate('steps.step')
	return service
}

module.exports = { getService, getServices }
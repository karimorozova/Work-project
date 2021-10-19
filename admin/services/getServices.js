const { Services, Units } = require('../models/')

async function getServices(obj) {
	const allUnits = await Units.find({}).lean()
	let services = await Services.find(obj).populate('steps.step').lean()

	return services.map(i => {
		i.steps.map(j => {
			j.step.calculationUnit = j.step.calculationUnit.map(k => {
				k = allUnits.find(({ _id }) => `${ _id }` === `${ k }`)
				return k
			})
			return j
		})
		return i
	})
}

async function getService(obj) {
	const service = await Services.findOne(obj)
			.populate('steps.step')
	return service
}

module.exports = { getService, getServices }
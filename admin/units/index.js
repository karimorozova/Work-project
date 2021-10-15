const { Units, Step, Pricelist } = require('../models')

async function insertUnitIntoStep(unit, unitId) {
	const { type, active, steps } = unit
	try {
		for (let { _id } of steps) {
			const step = await Step.findOne({ _id })
			step.calculationUnit.push({
				_id: unitId.toString(),
				steps,
				type,
				active,
				editable: true
			})
			await Step.updateOne({ _id }, step, { upsert: true })
		}
	} catch (err) {
		console.log(err)
		console.log('Error in insertUnitIntoStep')
	}
}

async function deleteUnitFromStep(unitId) {
	try {
		const steps = await Step.find()
		const pricelists = await Pricelist.find()
		for (let step of steps) {
			const { calculationUnit } = step
			step.calculationUnit = calculationUnit.filter(currentUnitId => currentUnitId.toString() !== unitId.toString())
			await Step.updateOne({ _id: step._id }, step, { upsert: true })
			for (let { _id, stepMultipliersTable } of pricelists) {
				stepMultipliersTable = stepMultipliersTable.filter(item => item.unit.toString() !== unitId.toString())
				await Pricelist.updateOne({ _id }, { stepMultipliersTable })
			}
		}
	} catch (err) {
		console.log(err)
		console.log('Error in deleteUnitFromStep')
	}
}

async function changeUnitsInSteps(unitToUpdate) {
	const { _id, ...unit } = unitToUpdate
	try {
		const steps = await Step.find({ 'calculationUnit': _id })

		if (!unit.steps.length) {
			await deleteUnitFromStep(_id)
		}
		for (let { _id: id } of unit.steps) {
			const redundantSteps = steps.filter(item => item._id.toString() !== id.toString())
			if (redundantSteps.length) {
				for (let step of redundantSteps) {
					step.calculationUnit = step.calculationUnit.filter(unitId => unitId.toString() !== _id.toString())
					await Step.updateOne({ _id: step._id }, step)
				}
			}
		}
		if (unit.steps.length) {
			for (let { _id: id } of unit.steps) {
				const step = await Step.findOne({ _id: id })
				const isExists = step.calculationUnit.find(unitId => unitId.toString() === _id.toString())
				if (!isExists) {
					step.calculationUnit.push({
						_id,
						steps: unit.steps,
						type: unit.type,
						active: unit.active,
						editable: true
					})
				}
				await Step.updateOne({ _id: id }, step)
			}
		}

		return await Units.updateOne({ _id }, unit, { upsert: true })

	} catch (err) {
		console.log(err)
		console.log('Error in changeUnitsInSteps')
	}
}

module.exports = { insertUnitIntoStep, deleteUnitFromStep, changeUnitsInSteps }

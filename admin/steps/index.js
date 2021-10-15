const { Units, Step, Pricelist } = require('../models')

async function insertStepsIntoUnits(step, stepId) {
	const { calculationUnit, ...stepData } = step
	try {
		for (let { _id } of calculationUnit) {
			const unit = await Units.findOne({ _id })
			unit.steps.push({
				_id: stepId.toString(),
				...stepData,
				calculationUnit
			})
			await Units.updateOne({ _id }, unit, { upsert: true })
		}
	} catch (err) {
		console.log(err)
		console.log('Error in insertStepsIntoUnits')
	}
}

async function deleteStepsFromUnits(stepId) {
	try {
		const units = await Units.find()
		const pricelists = await Pricelist.find()
		for (let unit of units) {
			const { steps } = unit
			unit.steps = steps.filter(currentStepId => currentStepId.toString() !== stepId.toString())
			await Units.updateOne({ _id: unit._id }, unit, { upsert: true })
			for (let { _id, stepMultipliersTable } of pricelists) {
				stepMultipliersTable = stepMultipliersTable.filter(item => item.step.toString() === stepId.toString())
				await Pricelist.updateOne({ _id }, { stepMultipliersTable })
			}
		}
	} catch (err) {
		console.log(err)
		console.log('Error in deleteStepsFromUnits')
	}
}

async function changeStepsInUnits(stepToUpdate) {
	const { _id, ...step } = stepToUpdate
	try {
		const units = await Units.find({ 'steps': _id })
		if (!step.calculationUnit.length) {
			await deleteStepsFromUnits(_id)
		}
		for (let { _id: id } of step.calculationUnit) {
			const redundantUnits = units.filter(item => item._id.toString() !== id.toString())
			if (redundantUnits.length) {
				for (let unit of redundantUnits) {
					unit.steps = unit.steps.filter(stepId => stepId.toString() !== _id.toString())
					await Units.updateOne({ _id: unit._id }, unit)
				}
			}
		}
		if (step.calculationUnit.length) {
			for (let { _id: id } of step.calculationUnit) {
				const unit = await Units.findOne({ _id: id })
				const isExists = unit.steps.find(stepId => stepId.toString() === _id.toString())
				if (!isExists) {
					unit.steps.push({
						_id,
						calculationUnit: step.calculationUnit,
						title: step.title
					})
				}
				await Units.updateOne({ _id: id }, unit)
			}
		}
		return await Step.updateOne({ _id }, step, { upsert: true })
	} catch (err) {
		console.log(err)
		console.log('Error in changeStepsInUnits')
	}
}

module.exports = { insertStepsIntoUnits, deleteStepsFromUnits, changeStepsInUnits }

const { Units, Clients, Step } = require('../models')
const { getArrayDifference } = require('../multipliers/pricelist')

const { differenceOperationType } = require('../enums/differenceOperationType')

const updateRates = async (key, oldMultiplier) => {
	switch (key) {
		default:
		case 'Step':
			const oldStep = oldMultiplier
			const updatedStep = await Step.findOne({ _id: oldStep._id }).populate('calculationUnit')
			const unitDifferences = getArrayDifference(oldStep.calculationUnit, updatedStep.calculationUnit, 'type')
			if (unitDifferences) {
				await checkStepDifference(unitDifferences, oldStep._id)
			}
			break
		case 'Unit':
			const oldUnit = oldMultiplier
			const updatedUnit = await Units.findOne({ _id: oldUnit._id }).populate('steps')
			const stepDifferences = getArrayDifference(oldUnit.steps, updatedUnit.steps, 'title')
			if (stepDifferences) {
				await checkUnitDifference(stepDifferences, oldUnit)
			}
			break
	}
}


const checkStepDifference = async ({ difference, itemsToAdd, itemsToDelete }, oldStep) => {
	const clients = await Clients.find()
	switch (difference) {
		default:
		case differenceOperationType.DeleteAndReplace || differenceOperationType.JustReplace || differenceOperationType.AddAndReplace:
			for (let { _id: clientId, rates } of clients) {
				let { stepMultipliersTable } = rates
				for (let unitToReplace of itemsToAdd) {
					const { _id } = await Units.findOne({ _id: unitToReplace._id })
					unitToReplace = {
						step: oldStep,
						unit: _id
					}
					stepMultipliersTable.push(unitToReplace)
				}
				for (let unitToDelete of itemsToDelete) {
					stepMultipliersTable = stepMultipliersTable.filter(item => `${ item.step } ${ item.unit }` !== `${ oldStep } ${ unitToDelete._id }`)
				}
				rates.stepMultipliersTable = stepMultipliersTable
				await Clients.updateOne({ _id: clientId }, { rates })
			}
			break
		case differenceOperationType.JustDelete:
			for (let { _id: clientId, rates } of clients) {
				let { stepMultipliersTable } = rates
				for (let unitToDelete of itemsToDelete) {
					stepMultipliersTable = stepMultipliersTable.filter(item => `${ item.step } ${ item.unit }` !== `${ oldStep } ${ unitToDelete._id }`)
				}
				rates.stepMultipliersTable = stepMultipliersTable
				await Clients.updateOne({ _id: clientId }, { rates })
			}
			break
		case differenceOperationType.JustAdd:
			const newMultiplierCombinations = []
			for (let unitToReplace of itemsToAdd) {
				const { _id: unitId } = unitToReplace
				newMultiplierCombinations.push({
					step: oldStep,
					unit: unitId
				})
				for (let { _id: clientId, rates } of clients) {
					let { stepMultipliersTable } = rates
					rates.stepMultipliersTable = [ ...stepMultipliersTable, newMultiplierCombinations ]
					await Clients.updateOne({ _id: clientId }, { rates })
				}
			}
			break
	}
}

const checkUnitDifference = async ({ difference, itemsToAdd, itemsToDelete }, oldUnit) => {
	const clients = await Clients.find()
	switch (difference) {
		default:

		case differenceOperationType.AddAndReplace || differenceOperationType.JustReplace || differenceOperationType.DeleteAndReplace:
			for (let { _id: clientId, rates } of clients) {
				let { stepMultipliersTable } = rates
				for (let stepToReplace of itemsToAdd) {
					const stepId = stepToReplace
					const { calculationUnit } = await Step.findOne({ _id: stepId })
					if (calculationUnit.length) {
						for (let unitId of calculationUnit) {
							stepToReplace = {
								step: stepId,
								unit: unitId
							}
							stepMultipliersTable.push(stepToReplace)
						}
					}
					for (let stepToDelete of itemsToDelete) {
						stepMultipliersTable = stepMultipliersTable.filter(item => `${ item.step } ${ item.unit }` !== `${ stepToDelete._id } ${ oldUnit._id }`)
					}
				}
				rates.stepMultipliersTable = stepMultipliersTable
				await Clients.updateOne({ _id: clientId }, { rates })
			}
			break

		case differenceOperationType.JustDelete:
			for (let { _id: clientId, rates } of clients) {
				let { stepMultipliersTable } = rates
				for (let stepToDelete of itemsToDelete) {
					stepMultipliersTable = stepMultipliersTable.filter(item => `${ item.step } ${ item.unit }` !== `${ stepToDelete._id } ${ oldUnit._id }`)
				}
				rates.stepMultipliersTable = stepMultipliersTable
				await Clients.updateOne({ _id: clientId }, { rates })
			}
			break

		case differenceOperationType.JustAdd:
			const newMultiplierCombinations = []
			for (let stepToReplace of itemsToAdd) {
				const { _id } = stepToReplace
				const { calculationUnit } = await Step.findOne({ _id })
				const neededUnit = calculationUnit.find(unit => unit.toString() === oldUnit._id.toString())
				let sameCombination
				for (let { rates } of clients) {
					const { stepMultipliersTable } = rates
					sameCombination = stepMultipliersTable.find(item => (`${ item.step } ${ item.unit }` === `${ _id } ${ oldUnit._id }`))
					if (!sameCombination) {
						newMultiplierCombinations.push({
							step: _id,
							unit: neededUnit,
							defaultSize: true
						})
					}
				}
				for (let { _id: clientId, rates } of clients) {
					let { stepMultipliersTable } = rates
					rates.stepMultipliersTable = [ ...stepMultipliersTable, ...newMultiplierCombinations ]
					await Clients.updateOne({ _id: clientId }, { rates })
				}
			}
			break
	}
}

module.exports = { updateRates }

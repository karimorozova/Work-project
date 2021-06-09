const { Pricelist, Step, Units } = require('../models')
const { tableKeys } = require('../enums')
const { postNotifications } = require('./relatedUsersNotifications')


const getFilteredStepMultipliers = async (stepMultipliersTable, filters, needToSplice) => {
	const { countFilter } = filters
	if (filters.stepFilter) {
		const steps = await Step.find({ title: filters.stepFilter })
		if (steps.length > 1) {
			const neededSteps = []
			for (let key of steps) {
				neededSteps.push(stepMultipliersTable.find(({ step }) => step._id.toString() === key._id.toString()))
				stepMultipliersTable = neededSteps
			}
		} else {
			stepMultipliersTable = stepMultipliersTable.filter(({ step }) => steps[0]._id.toString() === step._id.toString())
		}
	}
	if (filters.unitFilter) {
		const units = await Units.find({ type: filters.unitFilter })
		if (units.length > 1) {
			const neededUnits = []
			for (let key of units) {
				neededUnits.push(stepMultipliersTable.find(({ unit }) => unit._id.toString() === key._id.toString()))
				stepMultipliersTable = neededUnits
			}
		} else {
			stepMultipliersTable = stepMultipliersTable.filter(({ unit }) => units[0]._id.toString() === unit._id.toString())
		}
	}
	if (filters.sizeFilter) {
		stepMultipliersTable = stepMultipliersTable.filter(({ size }) => size === +filters.sizeFilter)
	}
	if (needToSplice) stepMultipliersTable = stepMultipliersTable.splice(countFilter, 25)
	return stepMultipliersTable
}

const getFilteredStepMultiplier = async (filters, priceListId, needToSplice = true) => {
	try {
		let { stepMultipliersTable } = await Pricelist.findOne({ _id: priceListId }, { _id: 0, stepMultipliersTable: 1 })
				.populate('stepMultipliersTable.step').populate('stepMultipliersTable.unit')
		stepMultipliersTable = stepMultipliersTable.filter(row => row.isActive === true)
		return await getFilteredStepMultipliers(stepMultipliersTable, filters, needToSplice)
	} catch (err) {
		console.log(err)
		console.log('Error in getFilteredStepMultiplier')
		throw new Error(err.message)
	}
}

const updateStepMultipliers = async (stepToUpdate, priceListId) => {
	try {
		let { stepMultipliersTable } = await Pricelist.findOne({ _id: priceListId }, {
			_id: 0,
			stepMultipliersTable: 1
		}).populate('stepMultipliersTable.step').populate('stepMultipliersTable.unit')

		const stepToUpdateIndex = stepMultipliersTable.findIndex(step => step._id.toString() === stepToUpdate._id)
		stepToUpdate.altered = true
		fixedPrice4()
		console.log(stepToUpdate)
		stepMultipliersTable.splice(stepToUpdateIndex, 1, stepToUpdate)
		await postNotifications(priceListId, stepToUpdate, tableKeys.stepMultipliersTable)
		await Pricelist.updateOne({ _id: priceListId }, { stepMultipliersTable })
	} catch (err) {
		console.log(err)
		console.log('Error in updateStepMultipliers')
	}
	function fixedPrice4() {
		stepToUpdate.usdMinPrice = +parseFloat(stepToUpdate.usdMinPrice).toFixed(4)
		stepToUpdate.euroMinPrice = +parseFloat(stepToUpdate.euroMinPrice ).toFixed(4)
		stepToUpdate.gbpMinPrice = +parseFloat(stepToUpdate.gbpMinPrice).toFixed(4)
	}
}

const updateStepPriceValue = async ({ USD, GBP }) => {
	try {
		const pricelists = await Pricelist.find()
		for (let { stepMultipliersTable, _id } of pricelists) {
			let updatedStepPrices = []
			for (let { euroMinPrice, usdMinPrice, gbpMinPrice, _id: stepMultipliersId, step, unit, size } of stepMultipliersTable) {
				usdMinPrice = euroMinPrice * Number(USD)
				gbpMinPrice = euroMinPrice * Number(GBP)
				updatedStepPrices.push({
					euroMinPrice,
					usdMinPrice,
					gbpMinPrice,
					_id: stepMultipliersId,
					step,
					unit,
					size
				})
			}
			await Pricelist.updateOne({ _id }, { stepMultipliersTable: updatedStepPrices })
		}
	} catch (err) {
		console.log(err)
		console.log('Error in updateStepPriceValue')
	}
}

module.exports = { getFilteredStepMultiplier, updateStepMultipliers, updateStepPriceValue }

const { Vendors } = require('../models')
const { getVendor, getVendorAfterUpdate } = require('./getVendors')
const ObjectId = require('mongodb').ObjectID
const { saveQualifications, saveQualificationsAfterUpdateCompetencies } = require('./qualifications')
const { deleteVendorRates, filterExtraCombinationsForPriceListTable } = require('./deleteVendorRates')
const { setRatePriceAfterApprovalPC } = require('./pendingCompetencies')
const { uniqBy } = require('lodash')


const updateVendorCompetencies = async (vendorId, dataToUpdate) => {
	try {
		let { competencies } = await getVendor({ _id: vendorId })
		if (dataToUpdate._id) {
			const neededServiceIndex = competencies.findIndex(item => item._id.toString() === dataToUpdate._id)
			const oldCompetence = competencies[neededServiceIndex]

			competencies.splice(neededServiceIndex, 1, generateCompetenceForSave(dataToUpdate))
			await Vendors.updateOne({ _id: vendorId }, { competencies })

			let { rates, qualifications } = await saveQualificationsAfterUpdateCompetencies(dataToUpdate, vendorId, oldCompetence)
			await Vendors.updateOne({ _id: vendorId }, { qualifications })

			rates = await filterRatesAfterUpdate(rates, vendorId)
			rates.pricelistTable = getPriceListTableUnique(rates.pricelistTable)
			await Vendors.updateOne({ _id: vendorId }, { rates })

			return await getVendorAfterUpdate({ _id: vendorId }, { rates, qualifications })
		} else {
			const combinationsWithoutRepetitions = generateCompetenciesCombinations(dataToUpdate)
					.filter(x => competencies.every(y => `${ x.sourceLanguage }/${ x.targetLanguage }/${ x.industry }/${ x.step }` !== `${ y.sourceLanguage._id }/${ y.targetLanguage._id }/${ y.industry._id }/${ y.step._id }`))
			competencies.push(...combinationsWithoutRepetitions)

			let { rates, qualifications } = await saveQualifications(combinationsWithoutRepetitions, vendorId)
			await Vendors.updateOne({ _id: vendorId }, { competencies, qualifications })

			rates = await filterRatesAfterUpdate(rates, vendorId)
			rates.pricelistTable = getPriceListTableUnique(rates.pricelistTable)
			await Vendors.updateOne({ _id: vendorId }, { rates })

			await setRatePriceAfterApprovalPC(vendorId)

			return await getVendor({ _id: vendorId })
		}
	} catch (err) {
		console.log(err)
		console.log('Error in updateVendorCompetencies')
	}

	function generateCompetenceForSave(dataToUpdate) {
		return {
			_id: ObjectId(dataToUpdate._id),
			sourceLanguage: ObjectId(dataToUpdate.sourceLanguage._id),
			targetLanguage: ObjectId(dataToUpdate.targetLanguage._id),
			step: ObjectId(dataToUpdate.step._id),
			industry: ObjectId(dataToUpdate.industry._id)
		}
	}
}

const generateCompetenciesCombinations = (dataToUpdate) => {
	const competenciesCombinations = []
	const competenciesDataIds = {
		sourceLanguage: [ ObjectId(dataToUpdate.sourceLanguage._id) ],
		targetLanguage: dataToUpdate.targetLanguage.map(item => ObjectId(item._id)),
		step: dataToUpdate.step.map(item => ObjectId(item._id)),
		industry: dataToUpdate.industry.map(item => ObjectId(item._id))
	}
	competenciesDataIds.sourceLanguage.forEach(sourceLanguage => {
		competenciesDataIds.targetLanguage.forEach(targetLanguage => {
			competenciesDataIds.step.forEach(step => {
				competenciesDataIds.industry.forEach(industry => {
					competenciesCombinations.push({ sourceLanguage, targetLanguage, step, industry })
				})
			})
		})
	})
	return competenciesCombinations
}

const deleteVendorCompetencies = async (vendorId, competenceId) => {
	try {
		const { competencies } = await Vendors.findOne({ _id: vendorId })
		const neededIndex = competencies.findIndex(item => item._id.toString() === competenceId)
		const { rates } = await deleteVendorRates(vendorId, competencies[neededIndex])
		competencies.splice(neededIndex, 1)
		await Vendors.updateOne({ _id: vendorId }, { competencies, rates })
		return await getVendor({ _id: vendorId })
	} catch (err) {
		console.log(err)
		console.log('Error in deleteVendorCompetencies')
	}
}

async function filterRatesAfterUpdate(rates, vendorId) {
	let { competencies, qualifications } = await Vendors.findOne({ _id: vendorId })
	return {
		...rates,
		pricelistTable: filterExtraCombinationsForPriceListTable(
				rates.pricelistTable,
				competencies,
				null,
				qualifications
		)
	}
}

function getPriceListTableUnique(pricelistTable) {
	return uniqBy(pricelistTable, ({ sourceLanguage, targetLanguage, step, unit, size, industry }) => (
			sourceLanguage.toString() + targetLanguage.toString() + step.toString() + unit.toString() + size + industry.toString()
	))
}

module.exports = { updateVendorCompetencies, deleteVendorCompetencies, generateCompetenciesCombinations }

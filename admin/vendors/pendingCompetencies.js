const { Vendors, Languages, Industries, Step, Pricelist, Units } = require('../models')
const ObjectId = require('mongodb').ObjectID

const getFilteredVendorsPendingCompetencies = async (filters) => {
	const languages = await Languages.find()
	const industries = await Industries.find()
	const steps = await Step.find()

	let query = {}
	const { sourceFilter, targetFilter, vendorStatusFilter, industryFilter, stepFilter, urgencyFilter } = filters
	const [ sourceQ, targetQ, industryQ, stepQ ] = [ 'pendingCompetencies.sourceLanguage', 'pendingCompetencies.targetLanguage', 'pendingCompetencies.industry', 'pendingCompetencies.step' ]

	if (!liveAll(sourceFilter)) query[sourceQ] = queryPart(sourceFilter, languages, 'lang')
	if (!liveAll(targetFilter)) query[targetQ] = queryPart(targetFilter, languages, 'lang')
	if (!liveAll(industryFilter)) query[industryQ] = queryPart(industryFilter, industries, 'name')
	if (!liveAll(stepFilter)) query[stepQ] = queryPart(stepFilter, steps, 'title')
	if (!liveAll(vendorStatusFilter)) query['status'] = { $in: vendorStatusFilter }

	const match = Object.keys(query).length ? { ...query } : {}
	let result = await Vendors.populate(
			await Vendors.aggregate([
				{ $match: match }
			]), [
				{ path: 'native', select: [ 'lang' ] },
				{ path: sourceQ, select: [ 'lang' ] },
				{ path: targetQ, select: [ 'lang' ] },
				{ path: industryQ, select: [ 'name' ] },
				{ path: stepQ, select: [ 'title' ] }
			])

	result = result.reduce((acc, curr) => {
		const { _id, pendingCompetencies, firstName, surname, native } = curr
		if (pendingCompetencies != null && pendingCompetencies.length) {

			let filteredCompetencies = filterCompetencies(pendingCompetencies)

			filteredCompetencies = filteredCompetencies.reduce((acc2, curr2) => {
				curr2 = { ...curr2, vendorName: `${ firstName } ${ surname }`, link: _id, native }
				acc2.push(curr2)
				return acc2
			}, [])

			acc.push(...filteredCompetencies)
		}
		return acc
	}, [])

	return result

	function liveAll(arr) {
		return arr.includes('All')
	}

	function getIds(arr, idsArr, key) {
		return arr.map(i => idsArr.find(j => j[key] === i)._id)
	}

	function queryPart(...arguments) {
		return { $in: getIds(...arguments).map(item => ObjectId(item)) }
	}

	function filterCompetencies(arr) {
		return arr
				.filter(item => !liveAll(sourceFilter) ?
						sourceFilter.includes(item.sourceLanguage.lang) :
						item
				)
				.filter(item => !liveAll(targetFilter) ?
						targetFilter.includes(item.targetLanguage.lang) :
						item
				)
				.filter(item => !liveAll(industryFilter) ?
						industryFilter.includes(item.industry.name) :
						item
				)
				.filter(item => !liveAll(stepFilter) ?
						stepFilter.includes(item.step.title) :
						item
				)
	}
}

const extendVendorsPendingCompetencies = async (pendingCompetencies) => {
	const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = await Pricelist.findOne({ isVendorDefault: true })
	const allUnits = await Units.find()
	const { _id: catId } = allUnits.find(({ type }) => type === 'CAT Wordcount')
	const { _id: swId } = allUnits.find(({ type }) => type === 'Source Word')


	pendingCompetencies = pendingCompetencies.map(item => {
		console.log(item.sourceLanguage)
		// const euroBasicPrice = basicPricesTable.find(({ sourceLanguage, targetLanguage }) => )
		// const { multiplier: stepMultiplier } = stepMultipliersTable.find(({ step, unit, size }) => )
		// const { multiplier: industryMultiplier } = stepMultipliersTable.find(({ industry }) => )

		// console.log(euroBasicPrice)

		return item
	})
	// console.log(pendingCompetencies.length)

	// const { multiplier: stepMultiplier } = stepMultipliersTable.find(({step, unit, size}))
	// const { multiplier: stepMultiplier } = stepMultipliersTable.find(({industry}))
	// const { multiplier: stepMultiplier } = stepMultipliersTable.find(({sourceLanguage,targetLanguage}))

	// console.log(stepMultipliersTable)

	// console.log({ basicPricesTable, stepMultipliersTable, industryMultipliersTable })
	// console.log(pendingCompetencies)

	return pendingCompetencies
}

module.exports = {
	getFilteredVendorsPendingCompetencies,
	extendVendorsPendingCompetencies
}
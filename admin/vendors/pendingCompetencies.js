const { Vendors, Languages, Industries, Step } = require('../models')
const ObjectId = require('mongodb').ObjectID

const getFilteredVendorsPendingCompetencies = async (filters) => {
	console.log(filters)
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
				{ path: sourceQ, select: [ 'lang' ] },
				{ path: targetQ, select: [ 'lang' ] },
				{ path: industryQ, select: [ 'name' ] },
				{ path: stepQ, select: [ 'title' ] }
			])

	result = result.reduce((acc, curr) => {
		const { _id, pendingCompetencies, firstName, surname } = curr
		if (pendingCompetencies != null && pendingCompetencies.length) {

			let filteredCompetencies = filterCompetencies(pendingCompetencies)

			filteredCompetencies = filteredCompetencies.reduce((acc2, curr2) => {
				curr2 = { ...curr2, vendorName: `${ firstName } ${ surname }`,  link: _id}
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

module.exports = {
	getFilteredVendorsPendingCompetencies
}
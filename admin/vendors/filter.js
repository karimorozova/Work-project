const ObjectId = require('mongodb').ObjectID
const moment = require('moment')
const { Languages } = require("../models");

async function getFilteringQuery(filters) {
	const { status, industries, sourceFilter, targetFilter, nameFilter } = getFilters(filters)
	let query = {
		status
	}
	if (filters.lastId) {
		query["_id"] = { $gt: ObjectId(filters.lastId) }
	}
	if (industries) {
		query.industries = ObjectId(industries)
	}
	if (sourceFilter !== 'All') {
		const languages = await Languages.find({}, { lang: 1 })
		query["competencies.sourceLanguage"] = { $in: [ ObjectId(returnLanguageIdByLang(languages, sourceFilter)) ] }
	}
	if (targetFilter !== 'All') {
		const languages = await Languages.find({}, { lang: 1 })
		query["competencies.targetLanguage"] = { $in: [ ObjectId(returnLanguageIdByLang(languages, targetFilter)) ] }
	}

	if (nameFilter) {
		query["firstName"] = { "$regex": new RegExp(`${ nameFilter }`, 'i') }
	}
	return query

	function returnLanguageIdByLang(languages, option) {
		return languages.find(({ lang }) => lang === option)._id
	}
}

function getFilteringQueryPotential(filters) {

	const { status, industries, nameFilter, dateRange } = getFiltersPotential(filters)

	let query = {
		status
	}
	if (filters.lastId) {
		query["_id"] = { $gt: ObjectId(filters.lastId) }
	}
	if (!!filters.pendingFilter) {
		query['status'] = "Potential"
		query["$or"] = [
			{ pendingCompetencies: { $exists: true, $not: { $size: 0 } } },
			{ competencies: { $exists: true, $not: { $size: 0 } } }
		]
	}
	if (industries) {
		query["pendingCompetencies.industry"] = ObjectId(industries)
	}
	if (nameFilter) {
		query["firstName"] = { "$regex": new RegExp(`${ nameFilter }`, 'i') }
	}
	if (!!dateRange) {
		const { from, to } = dateRange
		query["dateInfo.createdAt"] = { $gte: moment(from).format("YYYY MM DD"), $lte: moment(to).format("YYYY MM DD") }
	}
	return query

	function getFiltersPotential(filters) {
		const status = filters.statusFilter !== 'All' ? filters.statusFilter : { $ne: "" }
		const nameFilter = filters.nameFilter
		const industries = filters.industryFilter.name !== 'All' ? filters.industryFilter._id : ""
		return { dateRange: filters.dateRange, status, nameFilter, industries }
	}
}


function getFilters(filters) {
	const status = filters.statusFilter !== 'All' ? filters.statusFilter : { $ne: "" }
	const industries = filters.industryFilter.name !== 'All' ? filters.industryFilter._id : ""
	const sourceFilter = filters.sourceFilter
	const targetFilter = filters.targetFilter
	const nameFilter = filters.nameFilter
	return {
		status,
		industries,
		sourceFilter,
		targetFilter,
		nameFilter
	}
}

module.exports = { getFilteringQuery, getFilteringQueryPotential }

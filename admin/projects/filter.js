const ObjectId = require('mongodb').ObjectID

function getFilterdProjectsQuery(filters) {
	const reg = /[.*+?^${}()|[\]\\]/g
	let query = {}

	if (filters.statusFilter !== 'All') {
		query["status"] = filters.statusFilter
	}

	if (filters.projectIdFilter) {
		const filter = filters.projectIdFilter.replace(reg, '\\$&')
		query.projectId = { "$regex": new RegExp(filter, 'i') }
	}

	if (filters.projectNameFilter) {
		const filter = filters.projectNameFilter.replace(reg, '\\$&')
		query.projectName = { "$regex": new RegExp(filter, 'i') }
	}

	// if(filters.lastDate) {
	// 	query.startDate = { $lt: new Date(filters.lastDate) };
	// }


	//
	// if(filters.startFilter) {
	// 	query.startDate = filters.lastDate ? { $lt: new Date(filters.lastDate), $gte: new Date(filters.startFilter) } : { $gte: new Date(filters.startFilter) };
	// }
	// if(filters.deadlineFilter) {
	// 	query.deadline = { $lte: new Date(filters.deadlineFilter) };
	// }
	// if(filters.clientFilter) {
	// 	query["customer.name"] = { "$regex": new RegExp(`${ filters.clientFilter }`, 'i') };
	// }
	// if(filters.sourceFilter && filters.sourceFilter.length) {
	// 	query["tasks.sourceLanguage"] = { $in: filters.sourceFilter };
	// }
	// if(filters.targetFilter && filters.targetFilter.length) {
	// 	query["tasks.targetLanguage"] = { $in: filters.targetFilter };
	// }
	// if(filters.pmIds) {
	// 	const managerFilter = filters.pmIds.map(item => ObjectId(item._id));
	// 	query.projectManager = { $in: managerFilter };
	// }
	return query
}

module.exports = { getFilterdProjectsQuery }
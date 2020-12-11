const ObjectId = require('mongodb').ObjectID;

function getFilterdProjectsQuery(filters) {

	let status;
	if(filters.projectType === 'Open') {
		status = !filters.statusFilter || filters.statusFilter === 'All' ? { $nin: ["Closed", "Draft", "Quote sent", "Cost Quote"] } : filters.statusFilter;
	} else if(filters.projectType === 'Quote') {
		status = !filters.statusFilter || filters.statusFilter === 'All' ? { $nin: ["Approved", "Cancelled", "Closed", "Cancelled", "Cancelled Halfway", "In progress", "Rejected"] } : filters.statusFilter;
	} else if(filters.projectType === 'Closed') {
		status = !filters.statusFilter || filters.statusFilter === 'All' ? "Closed" : filters.statusFilter;
	}

	let query = { status };

	if(filters.lastDate) {
		query.startDate = { $lt: new Date(filters.lastDate) };
	}
	if(filters.startFilter) {
		query.startDate = filters.lastDate ? { $lt: new Date(filters.lastDate), $gte: new Date(filters.startFilter) } : { $gte: new Date(filters.startFilter) };
	}
	if(filters.deadlineFilter) {
		query.deadline = { $lte: new Date(filters.deadlineFilter) };
	}
	if(filters.clientFilter) {
		query["customer.name"] = { "$regex": new RegExp(`${ filters.clientFilter }`, 'i') };
	}
	if(filters.sourceFilter && filters.sourceFilter.length) {
		query["tasks.sourceLanguage"] = { $in: filters.sourceFilter };
	}
	if(filters.targetFilter && filters.targetFilter.length) {
		query["tasks.targetLanguage"] = { $in: filters.targetFilter };
	}
	if(filters.pmIds) {
		const managerFilter = filters.pmIds.map(item => ObjectId(item._id));
		query.projectManager = { $in: managerFilter };
	}
	return query;
}

module.exports = { getFilterdProjectsQuery }
const {ClientRequest} = require("../../models")


function getRequestsQuery (filters) {
	let query = {};
	if (filters.lastDate) {
		query.startDate = { $lt: new Date(filters.lastDate) };
	}
	if (filters.startFilter) {
		query.startDate = filters.lastDate ? {
			$lt: new Date(filters.lastDate),
			$gte: new Date(filters.startFilter)
		} : { $gte: new Date(filters.startFilter) };
	}
	if (filters.deadlineFilter) {
		query.deadline = { $lte: new Date(filters.deadlineFilter) };
	}
	if(filters.clientFilter) {
		query["customer.name"] = {"$regex": new RegExp(`${filters.clientFilter}`, 'i')};
	}
	if(filters.sourceFilter && filters.sourceFilter.length) {
		query["sourceLanguage.symbol"] = {$in: filters.sourceFilter};
	}
	if(filters.targetFilter && filters.targetFilter.length) {
		query["targetLanguages.symbol"] = {$in: filters.targetFilter};
	}
	if(filters.pmIds) {
		const managerFilter = filters.pmIds.map(item => ObjectId(item._id));
		query.projectManager = { $in: managerFilter };
	}
	if (filters.salesIds) {
		const managerFilter = filters.salesIds.map(item => ObjectId(item._id));
		query.salesManager = { $in: managerFilter };
	}
	return query;
}



async function getClientsRequests(filters) {
	const query = getRequestsQuery(filters);
	try {
		const requests = await ClientRequest.aggregate([
			{
				$lookup: {
					from: "clients",
					localField: "customer",
					foreignField: "_id",
					as: "customer"
				}
			},
			{
				$match: {
					...query
				}
			},
			{$unwind: "$customer"}
		]).sort({startDate: -1}).limit(25)
		return await ClientRequest.populate(requests, [
			'industry',
			'service',
			'projectManager',
			'accountManager'
		])
	} catch(err) {
		console.log(err);
		console.log("Error on getting filtered client requests");
	}
}

async function getClientRequestById(id) {
	try {
		const requests = await ClientRequest.findOne({_id: id})
		return requests
	} catch(err) {
		console.log(err);
		console.log("Error on getting filtered client requests");
	}
}

async function updateClientRequestProps(id, key, value) {
	try {
		const requests = await ClientRequest.updateOne({_id: id}, {$set: {[key]: value} })
		return requests
	} catch(err) {
		console.log(err);
		console.log("Error on getting filtered client requests");
	}
}



module.exports = {
	getClientsRequests,
	getClientRequestById,
	updateClientRequestProps,
}

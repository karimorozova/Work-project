const {ClientRequest} = require("../models")
const ObjectId = require('mongodb').ObjectID


function getRequestsQuery (filters) {
	let query = {};
	if (filters.lastDate) {
		query.startDate = { $lt: new Date(filters.lastDate) };
	}
  if (filters.clientIdFilter) {
    query["customer._id"] =  ObjectId(filters.clientIdFilter)
  }
	if (filters.statusFilter && filters.statusFilter !== "All") {
		query.status = { $eq: filters.statusFilter };
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
		query["requestForm.sourceLanguage"] = {$in: filters.sourceFilter.map(({_id}) => ObjectId(_id))};
	}
	if(filters.targetFilter && filters.targetFilter.length) {
		query["requestForm.targetLanguages"] = {$in: filters.targetFilter.map(({_id}) => ObjectId(_id))};
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
      "requestForm.sourceLanguage",
      "requestForm.targetLanguages",
      "requestForm.service",
      "industry",
      "accountManager",
      "projectManager",
		])
	} catch(err) {
		console.log(err);
		console.log("Error on getting filtered client requests");
	}
}


async function getClientRequestById(id) {
	try {
		const requests = await ClientRequest.findOne({_id: id})
      .populate([
        "requestForm.sourceLanguage",
        "requestForm.targetLanguages",
        "requestForm.service",
        "industry",
        "customer",
      ])
      .populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
      .populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ])
		return requests
	} catch(err) {
		console.log(err);
		console.log("Error on getting filtered client requests");
	}
}

async function getClientRequestAfterUpdate(query, update) {
	return await (ClientRequest.findOneAndUpdate(query, update, { new: true })
			.populate([
        "requestForm.sourceLanguage",
        "requestForm.targetLanguages",
        "requestForm.service",
        "industry",
        "customer",
      ])
			.populate('projectManager', [ 'firstName', 'lastName', 'photo', 'email' ])
			.populate('accountManager', [ 'firstName', 'lastName', 'photo', 'email' ]))
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
}

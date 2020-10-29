const { ClientRequest } = require('../models/');
const { getFilteredRequestsQuery } = require('./filter');

async function getClientRequest(obj) {
  return await ClientRequest.findOne(obj)
    .populate('industry')
    .populate('service')
    .populate('accountManager')
    .populate('projectManager')
    .populate('customer');
}

async function getClientRequests(obj) {
  return await ClientRequest.find(obj)
    .populate('industry')
    .populate('service')
    .populate('accountManager')
    .populate('projectManager')
    .populate('customer');
}

async function updateClientRequest(query, update) {
    return await ClientRequest.findOneAndUpdate(query, update, {new: true})
        .populate('industry')
        .populate('service')
        .populate('accountManager')
        .populate('projectManager')
        .populate('customer');
}

async function getFilteredClientRequests(filters) {
  const query = getFilteredRequestsQuery(filters);
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
        return ClientRequest.populate(requests, [
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

module.exports = { getClientRequest, getClientRequests, updateClientRequest, getFilteredClientRequests };

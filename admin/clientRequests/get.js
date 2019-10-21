const { ClientRequest } = require('../models/');
const { getFilterdRequestsQuery } = require('./filter');

async function getClientRequest(obj) {
    const clientRequest = await ClientRequest.findOne(obj)
        .populate('industry')
        .populate('service')
        .populate('accountManager')
        .populate('projectManager')
        .populate('customer');
    return clientRequest;
}

async function getClientRequests(obj) {
    const clientRequests = await ClientRequest.find(obj)
        .populate('industry')
        .populate('service')
        .populate('accountManager')
        .populate('projectManager')
        .populate('customer');
    return clientRequests;
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
    const query = getFilterdRequestsQuery(filters);
    const requests = await ClientRequest.find(query).sort({startDate: -1}).limit(25)
    try {
        return ClientRequest.populate(requests, [
            'industry',
            'customer',
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
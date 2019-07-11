const { ClientRequest } = require('../models/');

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

module.exports = { getClientRequest, getClientRequests, updateClientRequest };
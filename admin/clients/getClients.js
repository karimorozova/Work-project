const { Clients } = require('../models/');

async function getClient(obj) {
    const client = await Clients.findOne(obj)
            .populate('industries')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.service')
            .populate('languageCombinations.industries.industry');
    return client;
}

async function getClients(obj) {
    const clients = await Clients.find(obj)
            .populate('industries')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.service')
            .populate('languageCombinations.industries.industry');
    return clients;
}

async function getAfterUpdate(query, update) {
    return await Clients.findOneAndUpdate(query, update, {new: true})
            .populate('industries')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.service')
            .populate('languageCombinations.industries.industry');
}

module.exports = { getClient, getClients, getAfterUpdate };
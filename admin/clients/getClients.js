const { Clients } = require('../models/');

async function getClient(obj) {
    const client = await Clients.findOne(obj)
            .populate('industry')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.service')
            .populate('languageCombinations.industry.industry');
    return client;
}

async function getClients(obj) {
    const clients = await Clients.find(obj)
            .populate('industry')
            .populate('languageCombinations.source')
            .populate('languageCombinations.target')
            .populate('languageCombinations.service')
            .populate('languageCombinations.industry.industry');
    return clients;
}

module.exports = { getClient, getClients };
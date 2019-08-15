const { Clients } = require('../models/');

async function getClient(obj) {
    const client = await Clients.findOne(obj)
            .populate('industries')
            .populate("wordsRates.source")
            .populate("wordsRates.target")
            .populate("wordsRates.industries")
            .populate("hoursRates.source")
            .populate("hoursRates.target")
            .populate("hoursRates.industries")
            .populate("monoRates.target")
            .populate("monoRates.industries");
    return client;
}

async function getClients(obj) {
    const clients = await Clients.find(obj)
            .populate('industries')
            .populate("wordsRates.source")
            .populate("wordsRates.target")
            .populate("wordsRates.industries")
            .populate("hoursRates.source")
            .populate("hoursRates.target")
            .populate("hoursRates.industries")
            .populate("monoRates.target")
            .populate("monoRates.industries");
    return clients;
}

async function getClientAfterUpdate(query, update) {
    return await Clients.findOneAndUpdate(query, update, {new: true})
            .populate('industries')
            .populate("wordsRates.source")
            .populate("wordsRates.target")
            .populate("wordsRates.industries")
            .populate("hoursRates.source")
            .populate("hoursRates.target")
            .populate("hoursRates.industries")
            .populate("monoRates.target")
            .populate("monoRates.industries");
}

module.exports = { getClient, getClients, getClientAfterUpdate };
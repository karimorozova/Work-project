const { getClient, getClients, getAfterUpdate } = require('./getClients');
const { getClientRates, updateClientRates, deleteRate, updateClientCombinations } = require('./clientRates');

const clients = {
    getClient,
    getClients,
    getClientRates,
    updateClientRates,
    getAfterUpdate,
    deleteRate,
    updateClientCombinations
}

module.exports = clients;
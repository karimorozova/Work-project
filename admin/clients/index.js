const { getClient, getClients, getAfterUpdate } = require('./getClients');
const { getClientRates, updateClientRates, deleteRate, addSeveralCombinations } = require('./clientRates');

const clients = {
    getClient,
    getClients,
    getClientRates,
    updateClientRates,
    getAfterUpdate,
    deleteRate,
    addSeveralCombinations
}

module.exports = clients;
const { getClient, getClients, getAfterUpdate } = require('./getClients');
const { getClientRates, updateClientRates, deleteRate, addSeveralCombinations } = require('./clientRates');
const { updateClientInfo } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');

const clients = {
    getClient,
    getClients,
    getClientRates,
    updateClientRates,
    getAfterUpdate,
    deleteRate,
    addSeveralCombinations,
    updateClientInfo,
    getAfterTaskStatusUpdate
}

module.exports = clients;
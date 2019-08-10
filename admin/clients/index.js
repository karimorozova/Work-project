const { getClient, getClients, getClientAfterUpdate } = require('./getClients');
const { updateClientRates, deleteRate, addSeveralCombinations, getClientAfterCombinationsUpdated } = require('./clientRates');
const { updateClientInfo } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');

const clients = {
    getClient,
    getClients,
    updateClientRates,
    getClientAfterUpdate,
    deleteRate,
    addSeveralCombinations,
    updateClientInfo,
    getAfterTaskStatusUpdate,
    getClientAfterCombinationsUpdated
}

module.exports = clients;
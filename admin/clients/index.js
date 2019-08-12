const { getClient, getClients, getClientAfterUpdate } = require('./getClients');
const { updateClientRates, addSeveralCombinations, getClientAfterCombinationsUpdated } = require('./clientRates');
const { updateClientInfo } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');

const clients = {
    getClient,
    getClients,
    updateClientRates,
    getClientAfterUpdate,
    addSeveralCombinations,
    updateClientInfo,
    getAfterTaskStatusUpdate,
    getClientAfterCombinationsUpdated
}

module.exports = clients;
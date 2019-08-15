const { getClient, getClients, getClientAfterUpdate } = require('./getClients');
const { updateClientRates, importRates, getClientAfterCombinationsUpdated } = require('./clientRates');
const { updateClientInfo } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');

const clients = {
    getClient,
    getClients,
    updateClientRates,
    getClientAfterUpdate,
    importRates,
    updateClientInfo,
    getAfterTaskStatusUpdate,
    getClientAfterCombinationsUpdated
}

module.exports = clients;
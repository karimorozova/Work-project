const { getClient, getClients, getAfterUpdate } = require('./getClients');
const { getClientRates, updateClientRates, deleteRate, addClientsSeveralLangs } = require('./clientRates');

const clients = {
    getClient,
    getClients,
    getClientRates,
    updateClientRates,
    getAfterUpdate,
    deleteRate,
    addClientsSeveralLangs
}

module.exports = clients;
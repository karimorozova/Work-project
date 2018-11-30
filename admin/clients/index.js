const { getClient, getClients, getAfterUpdate } = require('./getClients');
const { getClientRates, updateClientRates, checkRatesMatch, deleteRate, addClientsSeveralLangs } = require('./clientRates');

const clients = {
    getClient,
    getClients,
    getClientRates,
    updateClientRates,
    getAfterUpdate,
    checkRatesMatch,
    deleteRate,
    addClientsSeveralLangs
}

module.exports = clients;
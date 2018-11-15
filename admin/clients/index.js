const { getClient, getClients, getAfterUpdate } = require('./getClients');
const { checkRatesMatch, deleteRate, addClientsSeveralLangs } = require('./clientRates');

const clients = {
    getClient,
    getClients,
    getAfterUpdate,
    checkRatesMatch,
    deleteRate,
    addClientsSeveralLangs
}

module.exports = clients;
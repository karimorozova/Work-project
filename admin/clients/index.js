const { getClient, getClients } = require('./getClients');
const { checkRatesMatch, deleteRate } = require('./clientRates');

const clients = {
    getClient,
    getClients,
    checkRatesMatch,
    deleteRate
}

module.exports = clients;
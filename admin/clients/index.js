const { getClient, getClients } = require('./getClients');
const { checkRates, deleteRate } = require('./clientRates');

const clients = {
    getClient,
    getClients,
    checkRates,
    deleteRate
}

module.exports = clients;
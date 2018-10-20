const { getClient, getClients } = require('./getClients');
const { checkRatesMatch, deleteRate, addClientsSeveralLangs } = require('./clientRates');

const clients = {
    getClient,
    getClients,
    checkRatesMatch,
    deleteRate,
    addClientsSeveralLangs
}

module.exports = clients;
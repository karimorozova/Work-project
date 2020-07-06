const { getClient, getClients, getClientAfterUpdate, gerFilteredClients } = require('./getClients');
const { updateClientRates, importRates, getClientAfterCombinationsUpdated } = require('./clientRates');
const { updateClientInfo } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');
const { updateClientService, deleteClientService } = require('./clientService');

const clients = {
  getClient,
  getClients,
  gerFilteredClients,
  updateClientRates,
  getClientAfterUpdate,
  importRates,
  updateClientInfo,
  getAfterTaskStatusUpdate,
  getClientAfterCombinationsUpdated,
  updateClientService,
  deleteClientService
};

module.exports = clients;

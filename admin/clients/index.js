const { getClient, getClients, getClientAfterUpdate, gerFilteredClients } = require('./getClients');
const { updateClientRates, deleteClientRates } = require('./clientRates');
const { updateClientInfo } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');
const { updateClientService, deleteClientService } = require('./clientService');
const { updateRates } = require('./updateClientRates');

const clients = {
  getClient,
  getClients,
  gerFilteredClients,
  updateClientRates,
  getClientAfterUpdate,
  updateClientInfo,
  getAfterTaskStatusUpdate,
  updateClientService,
  deleteClientService,
  updateRates
};

module.exports = clients;

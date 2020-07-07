const { getClient, getClients, getClientAfterUpdate, gerFilteredClients } = require('./getClients');
const { updateClientRates } = require('./clientRates');
const { updateClientInfo } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');
const { updateClientService, deleteClientService } = require('./clientService');

const clients = {
  getClient,
  getClients,
  gerFilteredClients,
  updateClientRates,
  getClientAfterUpdate,
  updateClientInfo,
  getAfterTaskStatusUpdate,
  updateClientService,
  deleteClientService
};

module.exports = clients;

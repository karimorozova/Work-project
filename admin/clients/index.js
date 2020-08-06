const { getClient, getClients, getClientAfterUpdate, gerFilteredClients } = require('./getClients');
const { updateClientRates, deleteClientRates } = require('./clientRates');
const { updateClientInfo, saveClientDocumentDefault, saveClientDocument, removeClientDoc } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');
const { updateClientService, deleteClientService } = require('./clientService');
const { updateRates } = require('./updateClientRates');
const { syncClientRatesCost } = require('./syncClientRatesCost');

const clients = {
  getClient,
  getClients,
  gerFilteredClients,
  updateClientRates,
  deleteClientRates,
  getClientAfterUpdate,
  updateClientInfo,
  getAfterTaskStatusUpdate,
  saveClientDocument,
  updateClientService,
  deleteClientService,
  updateRates,
  removeClientDoc,
  saveClientDocumentDefault,
  syncClientRatesCost
};

module.exports = clients;

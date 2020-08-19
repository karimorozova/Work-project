const { getClient, getClients, getClientAfterUpdate, gerFilteredClients } = require('./getClients');
const {
  updateClientRates,
  deleteClientRates,
  getNeededLangPair,
  getNeededStepRow,
  getNeededCurrency,
  getStepMultipliersCombinations,
  getPricelistCombinations,
  replaceOldItem,
  changePricelistTable,
  generateNewPricelistCombinations
} = require('./clientRates');
const { updateClientInfo, saveClientDocumentDefault, saveClientDocument, removeClientDoc } = require('./info');
const { getAfterTaskStatusUpdate } = require('./projects');
const { updateClientService, deleteClientService } = require('./clientService');
const { updateRates } = require('./updateClientRates');
const {
  syncClientRatesCost,
  synchronizeBasicPrice,
  synchronizeStepMultiplier,
  synchronizeIndustryMultiplier,
  synchronizePricelistTable
} = require('./syncClientRatesCost');

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
  syncClientRatesCost,
  getNeededLangPair,
  getNeededStepRow,
  getNeededCurrency,
  getStepMultipliersCombinations,
  getPricelistCombinations,
  replaceOldItem,
  changePricelistTable,
  synchronizeBasicPrice,
  synchronizeStepMultiplier,
  synchronizeIndustryMultiplier,
  synchronizePricelistTable,
  generateNewPricelistCombinations
};

module.exports = clients;

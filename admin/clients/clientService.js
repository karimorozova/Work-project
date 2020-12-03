const { Clients } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const { getClientAfterUpdate } = require('./getClients');
const {
  addNewRateComponents,
  updateClientRatesFromServices,
  clearClientRates,
  generateServiceCombinations,
  getUniqueServiceCombinations
} = require('./clientRates');

/**
 *
 * @param {ObjectId} clientId
 * @param {Object} dataToUpdate
 * @param {Object} oldData
 * @returns {Object} returns an updated client
 */
const updateClientService = async (clientId, dataToUpdate, oldData) => {
  try {
    let client = await Clients.findOne({ _id: clientId }).populate('defaultPricelist');
    const { services } = client;
    const dataForSave = {
      sourceLanguage: ObjectId(dataToUpdate.sourceLanguage._id),
      targetLanguages: dataToUpdate.targetLanguages.map(item => ObjectId(item._id)),
      services: dataToUpdate.services.map(item => ObjectId(item._id)),
      industries: dataToUpdate.industries.map(item => ObjectId(item._id)),
    };
    if (dataToUpdate._id) {
      const neededServiceIndex = services.findIndex(service => service._id.toString() === dataToUpdate._id);
      await updateClientRatesFromServices(client, dataForSave, oldData, dataToUpdate);
      services.splice(neededServiceIndex, 1, dataForSave);
    } else {
      let generatedServiceCombinations = [...await generateServiceCombinations(dataToUpdate, services)];
      generatedServiceCombinations = getUniqueServiceCombinations(generatedServiceCombinations, services);
      services.push(...generatedServiceCombinations);
      await addNewRateComponents(clientId, generatedServiceCombinations);
    }
    return await getClientAfterUpdate({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in updateClientService');
  }
};

/**
 *
 * @param {ObjectId} clientId
 * @param {ObjectId} serviceId
 * @returns {Object} returns an updated client
 */
const deleteClientService = async (clientId, serviceId) => {
  try {
    const client = await Clients.findOne({ _id: clientId })
      .populate('services.services')
      .populate('services.industries');
    const { services } = client;
    const neededServiceIndex = services.findIndex(service => service._id.toString() === serviceId);
    const rates = clearClientRates(client, services[neededServiceIndex]);
    services.splice(neededServiceIndex, 1);
    return await getClientAfterUpdate({ _id: clientId }, { services, rates });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteClientService');
  }
};

module.exports = {
  updateClientService,
  deleteClientService,
  generateServiceCombinations,
  getUniqueServiceCombinations
};

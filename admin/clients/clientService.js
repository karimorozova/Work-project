const { Clients } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const {
  addNewRateComponents,
  getServiceDifferences,
  deleteClientRates,
} = require('./clientRates');

const updateClientService = async (clientId, dataToUpdate, oldData) => {
  try {
    let { services } = await Clients.findOne({ _id: clientId });
    const dataForSave = {
      sourceLanguage: ObjectId(dataToUpdate.sourceLanguage._id),
      targetLanguages: dataToUpdate.targetLanguages.map(item => ObjectId(item._id)),
      services: dataToUpdate.services.map(item => ObjectId(item._id)),
      industries: dataToUpdate.industries.map(item => ObjectId(item._id)),
    };
    if (dataToUpdate._id) {
      const neededServiceIndex = services.findIndex(service => service._id.toString() === dataToUpdate._id);
      await getServiceDifferences(clientId, dataToUpdate, oldData);
      services.splice(neededServiceIndex, 1, dataForSave);
    } else {

      services.push(...generateServiceCombinations(dataToUpdate));
      await Clients.updateOne({ _id: clientId }, { services });
      await addNewRateComponents(clientId, dataToUpdate);
    }

    await Clients.updateOne({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in updateClientService');
  }
};

const generateServiceCombinations = (dataToUpdate) => {
  const servicesCombinations = [];

  const serviceDataIds = {
    sourceLanguage: [ObjectId(dataToUpdate.sourceLanguage._id)],
    targetLanguages: dataToUpdate.targetLanguages.map(item => ObjectId(item._id)),
    services: dataToUpdate.services.map(item => ObjectId(item._id)),
    industries: dataToUpdate.industries.map(item => ObjectId(item._id)),
  };

  serviceDataIds.sourceLanguage.forEach(sourceLanguage => {
    serviceDataIds.targetLanguages.forEach(targetLanguages => {
      serviceDataIds.services.forEach(services => {
        serviceDataIds.industries.forEach(industries => {
          servicesCombinations.push({ sourceLanguage, targetLanguages, services, industries });
        });
      });
    });
  });
  return servicesCombinations;
}

const deleteClientService = async (clientId, serviceId) => {
  try {
    const { services } = await Clients.findOne({ _id: clientId });
    const neededServiceIndex = services.findIndex(service => service._id.toString() === serviceId);
    await deleteClientRates(clientId, services[neededServiceIndex]);
    services.splice(neededServiceIndex, 1);
    await Clients.updateOne({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteClientService');
  }
};

module.exports = { updateClientService, deleteClientService };

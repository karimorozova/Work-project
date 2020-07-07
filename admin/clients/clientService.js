const { Clients } = require('../models');
const { addNewRateComponents } = require('./clientRates');

const updateClientService = async (clientId, dataToUpdate) => {
  try {
    let { services } = await Clients.findOne({ _id: clientId });
    if (dataToUpdate._id) {
      const neededServiceIndex = services.findIndex(service => service._id === dataToUpdate._id);
      services.splice(neededServiceIndex, 1, dataToUpdate);
    } else {
      const sameObject = findSameObject(dataToUpdate, services);
      if (!sameObject) {
        await addNewRateComponents(clientId, dataToUpdate);
      }
      services.push(dataToUpdate);
    }
    await Clients.updateOne({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in updateClientService');
  }
};

const deleteClientService = async (clientId, serviceId) => {
  try {
    const { services } = await Clients.findOne({ _id: clientId });
    const neededServiceIndex = services.findIndex(service => service._id === serviceId);
    services.splice(neededServiceIndex, 1);
    await Clients.updateOne({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteClientService');
  }
};

// TODO: Add alternative search without source language
const findSameObject = (newObject, arrOfOldObjects) => {
  return arrOfOldObjects.find(item => (
    item.sourceLanguage.toString() === newObject.sourceLanguage._id &&
    item.targetLanguage.toString() === newObject.targetLanguage._id &&
    item.service.toString() === newObject.service._id &&
    item.industry.toString() === newObject.industry._id
  ));
};

module.exports = { updateClientService, deleteClientService };

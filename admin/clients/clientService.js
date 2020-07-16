const { Clients } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const { addNewRateComponents, syncClientRatesAndServices, deleteClientRates } = require('./clientRates');

const updateClientService = async (clientId, dataToUpdate) => {
  try {
    let { services, servicesForRates } = await Clients.findOne({ _id: clientId });
    if (dataToUpdate._id) {
      const neededServiceIndex = services.findIndex(service => service._id.toString() === dataToUpdate._id);
      // await syncClientRatesAndServices(clientId, dataToUpdate, services[neededServiceIndex]);
      services.splice(neededServiceIndex, 1, dataToUpdate);
      await Clients.updateOne({ _id: clientId }, { services });
    } else {
      services.push(dataToUpdate);
      servicesForRates.langPairs.push({
        source: ObjectId(dataToUpdate.sourceLanguage._id),
        target: ObjectId(dataToUpdate.targetLanguage._id)
      });
      servicesForRates.services.push(ObjectId(dataToUpdate.service._id));
      servicesForRates.industries.push(ObjectId(dataToUpdate.industry._id));
      await Clients.updateOne({ _id: clientId }, { services, servicesForRates });
      // const updatedClient = await Clients.findOne({ _id: clientId });
      // const { _id } = updatedClient.services[services.length - 1];
      // await addNewRateComponents(clientId, dataToUpdate, _id);
    }
  } catch (err) {
    console.log(err);
    console.log('Error in updateClientService');
  }
};

const deleteClientService = async (clientId, serviceId) => {
  try {
    const { services, servicesForRates } = await Clients.findOne({ _id: clientId });
    const neededServiceIndex = services.findIndex(service => service._id.toString() === serviceId);
    const langPairIndex = servicesForRates.langPairs.findIndex(item => (
      item.source.toString() === services[neededServiceIndex].sourceLanguage.toString() &&
      item.target.toString() === services[neededServiceIndex].targetLanguage.toString()
    ));
    const serviceIndex = servicesForRates.services.findIndex(service => (
      service.toString() === services[neededServiceIndex].service.toString()
    ));
    const industryIndex = servicesForRates.industries.findIndex(industry => (
      industry.toString() === services[neededServiceIndex].industry.toString()
    ));
    servicesForRates.langPairs.splice(langPairIndex, 1);
    servicesForRates.services.splice(serviceIndex, 1);
    servicesForRates.industries.splice(industryIndex, 1);
    services.splice(neededServiceIndex, 1);
    await deleteClientRates(clientId, serviceId);
    await Clients.updateOne({ _id: clientId }, { services, servicesForRates });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteClientService');
  }
};

module.exports = { updateClientService, deleteClientService };

const { Clients } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const {
  addNewRateComponents,
  syncClientRatesAndServices,
  deleteClientRates,
  unifyServiceItems,
  syncUnifiedServiceItems
} = require('./clientRates');

const updateClientService = async (clientId, dataToUpdate) => {
  try {
    let { services, servicesForUnification } = await Clients.findOne({ _id: clientId });
    if (dataToUpdate._id) {
      const neededServiceIndex = services.findIndex(service => service._id.toString() === dataToUpdate._id);
      servicesForUnification = syncUnifiedServiceItems(syncUnifiedServiceItems, dataToUpdate);
      // await syncClientRatesAndServices(clientId, dataToUpdate, services[neededServiceIndex]);
      services.splice(neededServiceIndex, 1, dataToUpdate);
      await Clients.updateOne({ _id: clientId }, { services });
    } else {
      services.push(dataToUpdate);
      await Clients.updateOne({ _id: clientId }, { services });
      const updatedClient = await Clients.findOne({ _id: clientId });
      const { _id } = updatedClient.services[services.length - 1];
      await addNewRateComponents(clientId, _id);
      servicesForUnification = unifyServiceItems(servicesForUnification, dataToUpdate);
      await Clients.updateOne({ _id: clientId }, { servicesForUnification });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in updateClientService');
  }
};

const deleteClientService = async (clientId, serviceId) => {
  try {
    const { services, servicesForUnification } = await Clients.findOne({ _id: clientId });
    const neededServiceIndex = services.findIndex(service => service._id.toString() === serviceId);
    const langPairIndex = servicesForUnification.langPairs.findIndex(item => (
      item.source.toString() === services[neededServiceIndex].sourceLanguage.toString() &&
      item.target.toString() === services[neededServiceIndex].targetLanguage.toString()
    ));
    const serviceIndex = servicesForUnification.services.findIndex(service => (
      service.toString() === services[neededServiceIndex].service.toString()
    ));
    const industryIndex = servicesForUnification.industries.findIndex(industry => (
      industry.toString() === services[neededServiceIndex].industry.toString()
    ));
    servicesForUnification.langPairs.splice(langPairIndex, 1);
    servicesForUnification.services.splice(serviceIndex, 1);
    servicesForUnification.industries.splice(industryIndex, 1);
    services.splice(neededServiceIndex, 1);
    await deleteClientRates(clientId, serviceId);
    await Clients.updateOne({ _id: clientId }, { services, servicesForUnification });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteClientService');
  }
};

module.exports = { updateClientService, deleteClientService };

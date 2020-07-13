const { Clients } = require('../models');
const { addNewRateComponents, syncClientRatesAndServices, deleteClientRates } = require('./clientRates');

const updateClientService = async (clientId, dataToUpdate) => {
  try {
    let { services } = await Clients.findOne({ _id: clientId });
    if (dataToUpdate._id) {
      const neededServiceIndex = services.findIndex(service => service._id.toString() === dataToUpdate._id);
      await syncClientRatesAndServices(clientId, dataToUpdate, services[neededServiceIndex]);
      services.splice(neededServiceIndex, 1, dataToUpdate);
      await Clients.updateOne({ _id: clientId }, { services });
    } else {
      services.push(dataToUpdate);
      await Clients.updateOne({ _id: clientId }, { services });
      const updatedClient = await Clients.findOne({ _id: clientId });
      const { _id } = updatedClient.services[services.length - 1];
      await addNewRateComponents(clientId, dataToUpdate, _id);
    }
  } catch (err) {
    console.log(err);
    console.log('Error in updateClientService');
  }
};

const deleteClientService = async (clientId, serviceId) => {
  try {
    const { services } = await Clients.findOne({ _id: clientId });
    const neededServiceIndex = services.findIndex(service => service._id.toString() === serviceId);
    services.splice(neededServiceIndex, 1);
    await deleteClientRates(clientId, serviceId);
    await Clients.updateOne({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteClientService');
  }
};

module.exports = { updateClientService, deleteClientService };

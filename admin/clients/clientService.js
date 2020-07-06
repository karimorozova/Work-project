const { Clients } = require('../models');

const updateClientService = async (clientId, dataToUpdate) => {
  try {
    let { services } = await Clients.findOne({ _id: clientId });
    const neededServiceIndex = services.findIndex(service => service._id === dataToUpdate._id);
    services.splice(neededServiceIndex, 1, dataToUpdate);
    await Clients.updateOne({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in updateClientService');
  }
}

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
}

module.exports = { updateClientService, deleteClientService };

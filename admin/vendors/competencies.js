const { Vendors } = require('../models');
const ObjectId = require('mongodb').ObjectID;

const updateVendorCompetencies = async (vendorId, dataToUpdate) => {
  try {
    let { competencies } = await Vendors.findOne({ _id: vendorId });

    const dataForSave = {
      sourceLanguage: ObjectId(dataToUpdate.sourceLanguage._id),
      targetLanguages: dataToUpdate.targetLanguages.map(item => ObjectId(item._id)),
      services: dataToUpdate.services.map(item => ObjectId(item._id)),
      industries: dataToUpdate.industries.map(item => ObjectId(item._id)),
    }

    if (dataToUpdate._id) {
      const neededServiceIndex = competencies.findIndex(item => item._id.toString() === dataToUpdate._id);
      competencies.splice(neededServiceIndex, 1, dataForSave);
      await Vendors.updateOne({ _id: vendorId }, { competencies });
    } else {
      competencies.push(dataForSave);
      await Vendors.updateOne({ _id: vendorId }, { competencies });
    }
  } catch (err) {
    console.log(err);
    console.log('Error in updateVendorCompetencies');
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

module.exports = { updateVendorCompetencies, deleteClientService };

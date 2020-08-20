const { Clients } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const { getClientAfterUpdate } = require('./getClients');
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
      const generatedServiceCombinations = [...await generateServiceCombinations(dataToUpdate, services)];
      services.push(...generatedServiceCombinations);
      await addNewRateComponents(clientId, generatedServiceCombinations);
    }
    return await getClientAfterUpdate({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in updateClientService');
  }
};

const generateServiceCombinations = async (dataToUpdate, oldServices) => {
  const servicesCombinations = [];
  const { services: arrServices } = dataToUpdate;
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
          const isMono = arrServices.find(item => item._id === services.toString()).languageForm;
          if (isMono === 'Mono') {
            const isSame = checkForDuplicateRow(oldServices, sourceLanguage, targetLanguages, services, industries);
            if (!isSame) {
              servicesCombinations.push({ sourceLanguage: targetLanguages, targetLanguages, services, industries });
            }
          } else {
            servicesCombinations.push({ sourceLanguage, targetLanguages, services, industries });
          }
        });
      });
    });
  });
  return servicesCombinations;
};

const checkForDuplicateRow = (oldServices, newSourceLang, newTargetLang, newService, newIndustry) => {
  let isIdentical = false;
  for (let { sourceLanguage, targetLanguages, services, industries } of oldServices) {
    const isSameSource = sourceLanguage.toString() === newSourceLang.toString();
    const isSameTarget = targetLanguages.find(item => item.toString() === newTargetLang.toString());
    const isSameService = services.find(item => item.toString() === newService.toString());
    const isSameIndustry = industries.find(item => item.toString() === newIndustry.toString());
    isIdentical = isSameSource && !!isSameTarget && isSameService && !!isSameIndustry;
  }
  return isIdentical;
};

const deleteClientService = async (clientId, serviceId) => {
  try {
    const { services } = await Clients.findOne({ _id: clientId });
    const neededServiceIndex = services.findIndex(service => service._id.toString() === serviceId);
    await deleteClientRates(clientId, services[neededServiceIndex]);
    services.splice(neededServiceIndex, 1);
    return await getClientAfterUpdate({ _id: clientId }, { services });
  } catch (err) {
    console.log(err);
    console.log('Error in deleteClientService');
  }
};

module.exports = { updateClientService, deleteClientService };

const { Clients } = require('../models/');
const { getClientsFilteringQuery } = require('./filter');

async function getClient (obj) {
  return await Clients.findOne(obj)
    .populate('industries', ['name', 'icon'])
    .populate('nativeLanguage', ['lang'])
    .populate('services.sourceLanguage', ['lang'])
    .populate('services.targetLanguages', ['lang'])
    .populate('services.industries', ['name'])
    .populate('sourceLanguages', ['lang'])
    .populate('targetLanguages', ['lang'])
    .populate('rates.industryMultipliersTable.industry', ['icon'])
    .populate('rates.stepMultipliersTable.step', ['title'])
    .populate('rates.stepMultipliersTable.unit', ['type'])
    .populate('rates.basicPricesTable.sourceLanguage', ['lang', 'iso1'])
    .populate('rates.basicPricesTable.targetLanguage', ['lang', 'iso1'])
    .populate('timeZone')
    .populate('defaultPricelist', ['name'])
    .populate('services.services', ['title', 'steps']);
}

async function getClients (obj) {
  return await Clients.find(obj)
    .populate('industries')
    .populate('nativeLanguage')
    .populate('services.sourceLanguage')
    .populate('services.targetLanguages')
    .populate('services.industries')
    .populate('sourceLanguages')
    .populate('targetLanguages')
    .populate('rates.industryMultipliersTable.industry')
    .populate('rates.stepMultipliersTable.step')
    .populate('rates.stepMultipliersTable.unit')
    .populate('rates.basicPricesTable.sourceLanguage')
    .populate('rates.basicPricesTable.targetLanguage')
    .populate('timeZone')
    .populate('defaultPricelist')
    .populate('services.services');
}

async function getClientAfterUpdate (query, update) {
  return await Clients.findOneAndUpdate(query, update, { new: true })
    .populate('industries')
    .populate('nativeLanguage')
    .populate('services.sourceLanguage')
    .populate('services.targetLanguages')
    .populate('services.industries')
    .populate('sourceLanguages')
    .populate('targetLanguages')
    .populate('rates.industryMultipliersTable.industry')
    .populate('rates.stepMultipliersTable.step')
    .populate('rates.stepMultipliersTable.unit')
    .populate('rates.basicPricesTable.sourceLanguage')
    .populate('rates.basicPricesTable.targetLanguage')
    .populate('defaultPricelist')
    .populate('timeZone')
    .populate('services.services');
}

async function gerFilteredClients (filters) {
  try {
    const query = getClientsFilteringQuery(filters);
    const clients = await Clients.find(query).sort({ _id: 1 }).limit(25);
    return Clients.populate(clients, [
      "industries",
      'rates.industryMultipliersTable.industry',
      'rates.stepMultipliersTable.step',
      'rates.stepMultipliersTable.unit',
      'rates.basicPricesTable.sourceLanguage',
      'rates.basicPricesTable.targetLanguage'
    ]);
  } catch (err) {
    console.log(err);
    console.log("Error on filtering clients");
  }
}

const getClientRates = async (obj) => {
  return Clients.findOne(obj)
    .populate('rates.industryMultipliersTable.industry')
    .populate('rates.stepMultipliersTable.step')
    .populate('rates.stepMultipliersTable.unit')
    .populate('rates.basicPricesTable.sourceLanguage')
    .populate('rates.basicPricesTable.targetLanguage')
    .populate('rates.pricelistTable.sourceLanguage')
    .populate('rates.pricelistTable.targetLanguage')
    .populate('rates.pricelistTable.step')
    .populate('rates.pricelistTable.unit')
    .populate('rates.pricelistTable.industry');
};

const getClientsForNewProject = (obj) => {
  return Clients.find(obj, { _id: 1, name: 1, industries: 1 })
    .populate('industries');
};

module.exports = {
  getClient,
  getClients,
  getClientAfterUpdate,
  gerFilteredClients,
  getClientsForNewProject,
  getClientRates
};

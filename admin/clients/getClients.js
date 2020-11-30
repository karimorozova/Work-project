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
    .populate('rates.industryMultipliersTable.industry', ['name', 'icon'])
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

async function getClientAfterUpdate (query, update) {
  return await Clients.findOneAndUpdate(query, update, { new: true })
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
    .populate('discounts')
    .populate('services.services', ['title', 'steps']);
}

async function gerFilteredClients (filters) {
  try {
    const query = getClientsFilteringQuery(filters);
    return await Clients.find(query).sort({ _id: 1 }).limit(25)
      .populate('industries', ['icon']);
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

const getClientsForNewProject = () => {
  return Clients.find({ $or: [{ status: 'Active' }, { status: 'Potential' }] }, { _id: 1, name: 1, industries: 1 })
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

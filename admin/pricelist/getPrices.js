const { Pricelist, Clients } = require("../models");

async function getPricelist (obj) {
  const pricelist = await Pricelist.findOne(obj)
    .populate("wordsRates.source")
    .populate("wordsRates.target")
    .populate("wordsRates.industries")
    .populate("hoursRates.source")
    .populate("hoursRates.target")
    .populate("hoursRates.industries")
    .populate("monoRates.target")
    .populate("monoRates.industries");
  return pricelist;
}

async function getPricelists (obj) {
  const pricelist = await Pricelist.find(obj)
    .populate("wordsRates.source")
    .populate("wordsRates.target")
    .populate("wordsRates.industries")
    .populate("hoursRates.source")
    .populate("hoursRates.target")
    .populate("hoursRates.industries")
    .populate("monoRates.target")
    .populate("monoRates.industries");
  return pricelist;
}

async function getUpdatedPricelist (query, update) {
  return await Pricelist.findOneAndUpdate(query, update, { new: true })
    .populate('industryMultipliersTable.industry')
    .populate('stepMultipliersTable.step')
    .populate('stepMultipliersTable.unit')
    .populate('basicPricesTable.sourceLanguage')
    .populate('basicPricesTable.targetLanguage');
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

module.exports = { getPricelist, getPricelists, getUpdatedPricelist, getClientRates };

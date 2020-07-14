const { Clients } = require('../models');

const getFilteredPricelist = (pricelistTable, filters) => {
  const { sourceFilter, targetFilter, stepFilter, unitFilter, industryFilter } = filters;
  if (sourceFilter) {
    pricelistTable = pricelistTable.filter(item => item.sourceLanguage === sourceFilter);
  }
  if (targetFilter) {
    pricelistTable = pricelistTable.filter(item => item.targetLanguage === targetFilter);
  }
  if (stepFilter) {
    pricelistTable = pricelistTable.filter(item => item.step === stepFilter);
  }
  if (unitFilter) {
    pricelistTable = pricelistTable.filter(item => item.unit === unitFilter);
  }
  if (industryFilter) {
    pricelistTable = pricelistTable.filter(item => item.industry === industryFilter);
  }
  return pricelistTable;
};

const getRatePricelist = async (clientId, filters) => {
  const { countFilter } = filters;
  const client = await Clients.findOne({ _id: clientId });
  const { pricelistTable } = client.rates;
  if (pricelistTable.length) {
    const filteredPricelistTable = getFilteredPricelist(pricelistTable, filters);
    return filteredPricelistTable.splice(countFilter, 25);
  } else {
    return [];
  }
};

module.exports = { getRatePricelist };

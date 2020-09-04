const { getClientRates } = require('./getPrices');
const { getVendor } = require('../vendors');

const getFilteredPricelist = (pricelistTable, filters) => {
  const { sourceFilter, targetFilter, stepFilter, unitFilter, industryFilter } = filters;
  if (sourceFilter) {
    pricelistTable = pricelistTable.filter(item => item.sourceLanguage.lang === sourceFilter);
  }
  if (targetFilter) {
    pricelistTable = pricelistTable.filter(item => item.targetLanguage.lang === targetFilter);
  }
  if (stepFilter) {
    pricelistTable = pricelistTable.filter(item => item.step.title === stepFilter);
  }
  if (unitFilter) {
    pricelistTable = pricelistTable.filter(item => item.unit.type === unitFilter);
  }
  if (industryFilter) {
    pricelistTable = pricelistTable.filter(item => item.industry.name === industryFilter);
  }
  return pricelistTable;
};

const getRatePricelist = async (personId, filters, fromVendor = false) => {
  const { countFilter } = filters;
  const neededQuery = fromVendor ? getVendor : getClientRates;
  const { rates } = await neededQuery({ _id: personId });
  const { pricelistTable } = rates;
  if (pricelistTable.length) {
    const filteredPricelistTable = getFilteredPricelist(pricelistTable, filters);
    return filteredPricelistTable.splice(countFilter, 25);
  } else {
    return [];
  }
};

module.exports = { getRatePricelist };

const { Clients } = require('../models');
const { getPercentage, multiplyPrices } = require('../multipliers');

const getRateCombinations = async (clientId, filters) => {
  const { countFilter, industryFilter } = filters;
  const client = await Clients.findOne({ _id: clientId })
    .populate('rates.basicPricesTable')
    .populate('rates.stepMultipliersTable')
    .populate('rates.industryMultipliersTable');
  // const { clientCurrencies } = client;
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  const industryMultipliers = industryFilter ?
    industryMultipliersTable.filter(({ industry }) => industry.name === industryFilter)
    : industryMultipliersTable;
  const priceListCombinations = [];
  stepMultipliersTable.forEach(({ step, unit, size, multiplier: stepMultiplierValue, euroMinPrice }) => {
    basicPricesTable.forEach(({ sourceLanguage, targetLanguage, euroBasicPrice }) => {
      industryMultipliersTable.forEach(({ industry, multiplier: industryMultiplierValue }) => {
        priceListCombinations.push({
          sourceLanguage,
          targetLanguage,
          step,
          unit,
          size,
          industry: industry.name,
          eurPrice: multiplyPrices(euroBasicPrice, stepMultiplierValue, industryMultiplierValue),
          euroMinPrice,
          isGrouped: false,
        });
      });
    });
  });
  // if (industryFilter) {
  return priceListCombinations.splice(countFilter, 25);
  // }
};

module.exports = { getRateCombinations };

const { Clients } = require('../models');
const { getPercentage, multiplyPrices } = require('../multipliers');

const getRateCombinations = async (clientId, filters) => {
  const { countFilter, industryFilter } = filters;
  const client = await Clients.findOne({ _id: clientId })
    .populate('rates.industryMultipliersTable.industry')
    .populate('rates.stepMultipliersTable.step')
    .populate('rates.stepMultipliersTable.unit')
    .populate('rates.basicPricesTable.sourceLanguage')
    .populate('rates.basicPricesTable.targetLanguage');
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

  return priceListCombinations.splice(countFilter, 25);
  // }
};

module.exports = { getRateCombinations };

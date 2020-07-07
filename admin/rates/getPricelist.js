const { Clients, Languages, Step, Units } = require('../models');
const { getPercentage, multiplyPrices } = require('../multipliers');

const getRateCombinations = async (clientId, filters) => {
  const { countFilter, industryFilter, sourceFilter, targetFilter, stepFilter, unitFilter } = filters;
  const client = await Clients.findOne({ _id: clientId })
    .populate('rates.industryMultipliersTable.industry')
    .populate('rates.stepMultipliersTable.step')
    .populate('rates.stepMultipliersTable.unit')
    .populate('rates.basicPricesTable.sourceLanguage')
    .populate('rates.basicPricesTable.targetLanguage');
  // const { clientCurrencies } = client;
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = client.rates;
  if (sourceFilter || targetFilter) {
    basicPricesTable = await getFilteredBasicPrice(basicPricesTable, filters);
  }
  if (stepFilter || unitFilter) {
    stepMultipliersTable = await getFilteredStepMultiplier(stepMultipliersTable, filters);
  }
  industryMultipliersTable = industryFilter ?
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
};
const getFilteredBasicPrice = async (basicPrices, filters) => {
  if (filters.sourceFilter) {
    const lang = await Languages.findOne({ lang: filters.sourceFilter });
    basicPrices = basicPrices.filter(({ sourceLanguage }) => sourceLanguage._id.toString() === lang._id.toString());
  }
  if (filters.targetFilter) {
    const lang = await Languages.findOne({ lang: filters.targetFilter });
    basicPrices = basicPrices.filter(({ targetLanguage }) => (
      targetLanguage._id.toString() === lang._id.toString()
    ));
  }
  return basicPrices;
};

const getFilteredStepMultiplier = async (stepMultipliersTable, filters) => {
  if (filters.stepFilter) {
    const steps = await Step.find({ title: filters.stepFilter });
    if (steps.length > 1) {
      const neededSteps = [];
      for (let key of steps) {
        neededSteps.push(stepMultipliersTable.find(({ step }) => step._id.toString() === key._id.toString()));
        stepMultipliersTable = neededSteps;
      }
    } else {
      stepMultipliersTable = stepMultipliersTable.filter(({ step }) => steps[0]._id.toString() === step._id.toString());
    }
  }
  if (filters.unitFilter) {
    const units = await Units.find({ type: filters.unitFilter });
    if (units.length > 1) {
      const neededUnits = [];
      for (let key of units) {
        neededUnits.push(stepMultipliersTable.find(({ unit }) => unit._id.toString() === key._id.toString()));
        stepMultipliersTable = neededUnits;
      }
    } else {
      stepMultipliersTable = stepMultipliersTable.filter(({ unit }) => units[0]._id.toString() === unit._id.toString());
    }
  }
  if (filters.sizeFilter) {
    stepMultipliersTable = stepMultipliersTable.filter(({ size }) => size === +filters.sizeFilter);
  }
  return stepMultipliersTable;
};

const getFilteredIndustryMultipliers = (filters) => {

};

module.exports = { getRateCombinations };

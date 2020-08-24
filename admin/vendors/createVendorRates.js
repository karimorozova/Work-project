const _ = require('lodash');
const { Pricelist, Vendors, Step } = require('../models');
const {
  getNeededLangPair,
  getNeededCurrency,
  getStepMultipliersCombinations,
  generateNewPricelistCombinations
} = require('../clients');

const createRateCombinations = async (listForRates, vendorId) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true });
  const { pricelistTable: oldPricelistTable } = vendor.rates;
  const { langPairs, steps, industries } = splitRatesArr(listForRates);
  let {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
    rates
  } = await combineVendorRates(langPairs, steps, industries, defaultPricelist, vendor);
  let pricelistTable = [...await generateNewPricelistCombinations(
    basicPricesTable, stepMultipliersTable, industryMultipliersTable, oldPricelistTable)];
  pricelistTable = _.uniqBy(pricelistTable, (item) => (
    item.sourceLanguage.toString() +
    item.targetLanguage.toString() +
    item.step.toString() +
    item.unit.toString() +
    item.size +
    item.industry.toString()
  ));
  rates = {
    ...rates,
    pricelistTable
  };
  return rates;
};

const splitRatesArr = (arr) => {
  const langPairs = [];
  const steps = [];
  const industries = [];
  for (let { sourceLanguage, targetLanguage, step, industry } of arr) {
    langPairs.push({
      sourceLanguage,
      targetLanguage
    });
    steps.push(step);
    industries.push(industry);
  }
  return {
    langPairs: _.uniqBy(langPairs, item => item.sourceLanguage + item.targetLanguage),
    steps: Array.from(new Set(steps)),
    industries: Array.from(new Set(industries)),
  };
};

const combineVendorRates = async (langPairs, steps, industries, defaultPricelist, vendor) => {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = defaultPricelist;
  const newLangPairCombinations = [];
  const newStepMultiplierCombinations = [];
  const newIndustryMultiplierCombinations = [];
  const { rates, currency } = vendor;
  for (let { sourceLanguage, targetLanguage } of langPairs) {
    const similarLangPair = getNeededLangPair(rates.basicPricesTable, sourceLanguage, targetLanguage);
    if (!similarLangPair) {
      const boundLangPairRow = getNeededLangPair(basicPricesTable, sourceLanguage, targetLanguage);
      const boundBasicPrice = boundLangPairRow ? getNeededCurrency(boundLangPairRow, currency) : 1;
      const langPairCombination = {
        type: sourceLanguage.toString() === targetLanguage.toString() ? 'Mono' : 'Duo',
        sourceLanguage,
        targetLanguage,
        basicPrice: boundBasicPrice
      };
      newLangPairCombinations.push(langPairCombination);
      rates.basicPricesTable.push(langPairCombination);
    } else {
      newLangPairCombinations.push(similarLangPair);
    }
  }
  for (let step of steps) {
    const newStepsArr = [];
    const fullStepInfo = await Step.findOne({ _id: step });
    if (fullStepInfo.calculationUnit.length) {
      const sameStepMultipliers = checkForStepDuplicates(rates.stepMultipliersTable, fullStepInfo);
      if (!sameStepMultipliers.length) {
        newStepsArr.push(...await getStepMultipliersCombinations({ _id: step }, { stepMultipliersTable: stepMultipliersTable }));
        newStepsArr.map(item => ({ ...item, step: item.step._id }));
        newStepMultiplierCombinations.push(...newStepsArr);
        rates.stepMultipliersTable.push(...newStepsArr);
      } else {
        newStepMultiplierCombinations.push(...sameStepMultipliers);
      }
    }
  }
  for (let industry of industries) {
    const sameIndustryMultiplier = rates.industryMultipliersTable.find(item => item.industry.toString() === industry.toString());
    if (!sameIndustryMultiplier) {
      const neededIndustryRow = industryMultipliersTable.find(item => item.industry.toString() === industry.toString());
      const multiplier = neededIndustryRow ? neededIndustryRow.multiplier : 100;
      newIndustryMultiplierCombinations.push({
        industry,
        multiplier
      });
      rates.industryMultipliersTable.push({
        industry,
        multiplier
      });
    } else {
      newIndustryMultiplierCombinations.push(sameIndustryMultiplier);
    }
  }
  return {
    basicPricesTable: newLangPairCombinations,
    stepMultipliersTable: newStepMultiplierCombinations,
    industryMultipliersTable: newIndustryMultiplierCombinations,
    rates
  };

  function checkForStepDuplicates(stepMultipliersTable, step) {
    const occurrences = [];
    const { calculationUnit } = step;
    for (let unit of calculationUnit) {
      const sizes = unit.hasOwnProperty('sizes') ? unit.sizes : [];
      if (sizes.length) {
        sizes.forEach(size => {
          const occurrence = stepMultipliersTable.find(item => (
            `${item.step} ${item.unit} ${item.size}` === `${step._id} ${unit._id} ${size}`
          ));
          if (occurrence) occurrences.push(occurrence);
        });
      } else {
        const occurrence = stepMultipliersTable.find(item => (
          `${item.step} ${item.unit} ${1}` === `${step._id} ${unit._id} ${1}`
        ));
        if (occurrence) occurrences.push(occurrence);
      }
    }
    return occurrences;
  }
};

const createRateRowFromQualification = async (vendorId, qualification) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true });
  const { pricelistTable: oldPricelistTable } = vendor.rates;
  let { source, target, steps, industry } = qualification;
  const langPairs = [{
    sourceLanguage: source._id,
    targetLanguage: target._id,
  }];
  steps = steps.map(item => item._id);
  const industries = [industry._id];
  const {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
    rates
  } = await combineVendorRates(langPairs, steps, industries, defaultPricelist, vendor);
  let pricelistTable = [...await generateNewPricelistCombinations(
    basicPricesTable, stepMultipliersTable, industryMultipliersTable, oldPricelistTable)];
  pricelistTable = _.uniqBy(pricelistTable, (item) => (
    item.sourceLanguage.toString() +
    item.targetLanguage.toString() +
    item.step.toString() +
    item.unit.toString() +
    item.size +
    item.industry.toString()
  ));
  await Vendors.updateOne({ _id: vendorId }, {
    rates: {
      ...rates,
      pricelistTable,
    }
  });
};

module.exports = {
  createRateCombinations,
  createRateRowFromQualification
};

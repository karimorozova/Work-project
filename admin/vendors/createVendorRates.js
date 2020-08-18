const _ = require('lodash');
const { Pricelist, Vendors, Step } = require('../models');
const {
  getNeededLangPair,
  getNeededCurrency,
  getStepMultipliersCombinations,
  getPricelistCombinations
} = require('../clients');
const ObjectId = require('mongodb').ObjectID;

const createRateCombinations = async (listForRates, vendorId) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isDefault: true });
  const { pricelistTable: oldPricelistTable } = vendor.rates;
  const { langPairs, steps, industries } = splitRatesArr(listForRates);
  let {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable
  } = await combineVendorRates(langPairs, steps, industries, defaultPricelist, vendor);
  const pricelistTable = await getPricelistCombinations(
    basicPricesTable, stepMultipliersTable, industryMultipliersTable, oldPricelistTable
  );
  await Vendors.updateOne({ _id: vendorId }, {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable,
    }
  });
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
  const { rates, currency } = vendor;
  for (let { sourceLanguage, targetLanguage } of langPairs) {
    const similarLangPair = getNeededLangPair(rates.basicPricesTable, sourceLanguage._id, targetLanguage._id);
    if (!similarLangPair) {
      const boundLangPairRow = getNeededLangPair(basicPricesTable, sourceLanguage, targetLanguage);
      const boundBasicPrice = boundLangPairRow ? getNeededCurrency(boundLangPairRow, currency) : 1;
      rates.basicPricesTable.push({
        type: sourceLanguage.toString() === targetLanguage.toString() ? 'Mono' : 'Duo',
        sourceLanguage: ObjectId(sourceLanguage._id),
        targetLanguage: ObjectId(targetLanguage._id),
        basicPrice: boundBasicPrice
      });
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
        rates.stepMultipliersTable.push(...newStepsArr);
      }
    }
  }
  for (let industry of industries) {
    const sameIndustryMultiplier = rates.industryMultipliersTable.find(item => item.industry.toString() === industry);
    if (!sameIndustryMultiplier) {
      const neededIndustryRow = industryMultipliersTable.find(item => item.industry.toString() === industry.toString());
      const multiplier = neededIndustryRow ? neededIndustryRow.multiplier : 100;
      rates.industryMultipliersTable.push({
        industry,
        multiplier
      });
    }
  }
  return rates;

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
  const defaultPricelist = await Pricelist.findOne({ isDefault: true });
  const { pricelistTable: oldPricelistTable } = vendor.rates;
  let { source, target, steps, industry } = qualification;
  const langPairs = [{
    sourceLanguage: source,
    targetLanguage: target,
  }];
  steps = steps.map(item => item._id);
  const industries = [industry._id];
  let {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable
  } = await combineVendorRates(langPairs, steps, industries, defaultPricelist, vendor);
  const pricelistTable = await getPricelistCombinations(
    basicPricesTable, stepMultipliersTable, industryMultipliersTable, oldPricelistTable
  );
  await Vendors.updateOne({ _id: vendorId }, {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable,
    }
  });
};

module.exports = {
  createRateCombinations,
  createRateRowFromQualification
};

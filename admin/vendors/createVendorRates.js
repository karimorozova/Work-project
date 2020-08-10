const _ = require('lodash');
const { Pricelist, Vendors } = require('../models');
const {
  getNeededLangPair,
  getNeededCurrency,
  getStepMultipliersCombinations,
  getPricelistCombinations
} = require('../clients');

const createRateCombinations = async (listForRates, vendorId) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const { pricelistTable: oldPricelistTable } = vendor.rates;
  const { langPairs, steps, industries } = splitRatesArr(listForRates);
  const defaultPricelist = await Pricelist.findOne({ isDefault: true });
  const {
    newLangPairsArr,
    newStepsArr,
    newIndustriesArr
  } = await combineVendorRates(langPairs, steps, industries, defaultPricelist, vendor.currency);
  const pricelistTable = await getPricelistCombinations(
    newLangPairsArr, newStepsArr, newIndustriesArr, oldPricelistTable
  );
  await Vendors.updateOne({ _id: vendorId }, {
    rates: {
      basicPricesTable: newLangPairsArr,
      stepMultipliersTable: newStepsArr,
      industryMultipliersTable: newIndustriesArr,
      pricelistTable
    }
  });
};

const splitRatesArr = (ratesArr) => {
  const langPairs = [];
  const steps = [];
  const industries = [];
  for (let { sourceLanguage, targetLanguage, step, industry } of ratesArr) {
    langPairs.push({
      sourceLanguage,
      targetLanguage
    });
    steps.push(step);
    industries.push(industry);
  }
  return {
    langPairs: _.uniqBy(langPairs, (item) => item.sourceLanguage + item.targetLanguage),
    steps: Array.from(new Set(steps)),
    industries: Array.from(new Set(industries)),
  };
};


const combineVendorRates = async (langPairs, steps, industries, defaultPricelist, vendorCurrency) => {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = defaultPricelist;
  const newLangPairsArr = [];
  const newStepsArr = [];
  for (let { sourceLanguage, targetLanguage } of langPairs) {
    const similarLangPair = getNeededLangPair(basicPricesTable, sourceLanguage, targetLanguage);
    const boundBasicPrice = similarLangPair ? getNeededCurrency(similarLangPair, vendorCurrency) : 1;
    newLangPairsArr.push({
      type: sourceLanguage.toString() === targetLanguage.toString() ? 'Mono' : 'Duo',
      sourceLanguage,
      targetLanguage,
      basicPrice: boundBasicPrice
    });
  }
  for (let step of steps) {
    newStepsArr.push(...await getStepMultipliersCombinations({ _id: step }, { stepMultipliersTable }));
  }
  const newIndustriesArr = [...industries.map(industry => {
    const { multiplier } = industryMultipliersTable.find(item => item.industry.toString() === industry.toString());
    return {
      industry,
      multiplier
    };
  })];
  return {
    newLangPairsArr,
    newStepsArr,
    newIndustriesArr
  };
};

module.exports = {
  createRateCombinations
};

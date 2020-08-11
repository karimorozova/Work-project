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
  console.log(newLangPairsArr);
  // await Vendors.updateOne({ _id: vendorId }, {
  //   rates: {
  //     basicPricesTable: newLangPairsArr,
  //     stepMultipliersTable: newStepsArr,
  //     industryMultipliersTable: newIndustriesArr,
  //     pricelistTable
  //   }
  // });
};

const splitRatesArr = (ratesArr) => {
  const { sourceLanguage, targetLanguage: targetLanguages, step: steps, industry: industries } = ratesArr;
  const langPairs = targetLanguages.map(item => ({
    sourceLanguage,
    targetLanguage: item
  }));
  return {
    langPairs: _.uniqBy(langPairs, item => item.sourceLanguage + item.targetLanguage),
    steps: _.uniqBy(steps, item => item._id),
    industries: _.uniqBy(industries, item => item._id),
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
      type: sourceLanguage._id.toString() === targetLanguage._id.toString() ? 'Mono' : 'Duo',
      sourceLanguage: sourceLanguage._id,
      targetLanguage: targetLanguage._id,
      basicPrice: boundBasicPrice
    });
  }
  for (let step of steps) {
    newStepsArr.push(...await getStepMultipliersCombinations({ _id: step }, { stepMultipliersTable: stepMultipliersTable }));
  }
  const newIndustriesArr = [...industries.map(industry => {
    const neededIndustryRow = industryMultipliersTable.find(item => item.industry.toString() === industry.toString());
    const multiplier = neededIndustryRow ? neededIndustryRow.multiplier : 100;
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

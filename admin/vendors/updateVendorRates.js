const { Vendors, Pricelist } = require('../models');
const {
  getPricelistCombinations,
  replaceOldItem,
  changePricelistTable,
  getStepMultipliersCombinations
} = require('../clients');
const { getRateInfoFromStepFinance, manageMonoPairRates, manageDuoPairRates } = require("../pricelist/ratesmanage")
const { getVendor, getVendorAfterUpdate } = require("../vendors")
const { tableKeys } = require('../enums');

/**
 *
 * @param {String} vendorId - updating subject's id
 * @param {String} newData - updated example from frontend
 * @param {String} oldData - old example from database
 * @return nothing - updates vendor's rates
 */
const updateVendorRatesFromCompetence = async (vendorId, newData, oldData) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true });
  const sourceLangDifference = compareIds(newData.sourceLanguage, oldData.sourceLanguage);
  const targetLangDifference = compareIds(newData.targetLanguage, oldData.targetLanguage);
  const stepDifference = compareIds(newData.step, oldData.step);
  const industryDifference = compareIds(newData.industry, oldData.industry);
  let updatedRates;
  if (sourceLangDifference || targetLangDifference) {
    updatedRates = await updateVendorLangPairs(
      oldData,
      sourceLangDifference,
      targetLangDifference,
      vendor,
      defaultPricelist
    );
  }
  if (stepDifference) {
    updatedRates = await updateVendorStepMultipliers(oldData, stepDifference, vendor, defaultPricelist);
  }
  if (industryDifference) {
    updatedRates = await updateIndustryMultipliers(oldData, industryDifference, vendor, defaultPricelist);
  }
  return updatedRates

  function compareIds (obj1, id) {
    return obj1._id.toString() === id.toString() ? undefined : obj1;
  }
};

/**
 *
 * @param {Object} oldData - old example from database
 * @param {Object} newSourceLang - new source language value of rate row
 * @param {Object} newTargetLang - new target language value of rate row
 * @param {Object} vendor - current vendor's data
 * @param {Object} defaultPricelist - default pricelist data
 * @return nothing - updates vendor's rates
 */
const updateVendorLangPairs = async (
  oldData,
  newSourceLang,
  newTargetLang,
  vendor,
  defaultPricelist
) => {
  const { _id, competencies, rates } = vendor;
  const { sourceLanguage, targetLanguage } = oldData;
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  if (newSourceLang) {
    const sameLangPairRow = findSameLangPairRow(basicPricesTable, newSourceLang._id, targetLanguage._id);
    if (!sameLangPairRow) {
      basicPricesTable = pushNewBasicPriceItem(
        basicPricesTable,
        defaultPricelist,
        newSourceLang._id,
        targetLanguage._id
      );
      pricelistTable = await getPricelistCombinations(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable
      );
    }
    const isNotLastLangPairInCompetence = findSameLangPairRow(competencies, sourceLanguage._id, targetLanguage._id);
    if (!isNotLastLangPairInCompetence) {
      basicPricesTable = filterRedundantLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
      pricelistTable = filterRedundantLangPair(pricelistTable, sourceLanguage._id, targetLanguage._id);
    }
  }
  if (newTargetLang) {
    const sameLangPairRow = findSameLangPairRow(basicPricesTable, sourceLanguage._id, newTargetLang._id);
    if (!sameLangPairRow) {
      basicPricesTable = pushNewBasicPriceItem(
        basicPricesTable,
        defaultPricelist,
        sourceLanguage,
        newTargetLang._id
      );
      pricelistTable = await getPricelistCombinations(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable
      );
    }
    const isNotLastLangPairInCompetence = findSameLangPairRow(competencies, sourceLanguage._id, targetLanguage._id);
    if (!isNotLastLangPairInCompetence) {
      basicPricesTable = filterRedundantLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
      pricelistTable = filterRedundantLangPair(pricelistTable, sourceLanguage._id, targetLanguage._id);
    }
  }
  return {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    }
  };


  function findSameLangPairRow(arr, sourceLangId, targetLangId) {
    return arr.find(item => (
      `${item.sourceLanguage} ${item.targetLanguage}` === `${sourceLangId} ${targetLangId}`
    ));
  }

  function filterRedundantLangPair(arr, sourceLangId, targetLangId) {
    return arr.filter(item => (
      `${item.sourceLanguage} ${item.targetLanguage}` !== `${sourceLangId} ${targetLangId}`
    ));
  }

  function pushNewBasicPriceItem(basicPricesTable, defaultPricelist, sourceLanguage, targetLanguage) {
    const neededLangRow = defaultPricelist.basicPricesTable.find(item => (
      `${item.sourceLanguage} ${item.targetLanguage}` === `${sourceLanguage} ${targetLanguage}`
    ));
    const basicPrice = neededLangRow ? neededLangRow.basicPrice : 1;
    basicPricesTable.push({
      type: sourceLanguage.toString() === targetLanguage.toString() ? 'Mono' : 'Duo',
      sourceLanguage,
      targetLanguage,
      basicPrice
    });
    return basicPricesTable;
  }
};

/**
 *
 * @param {Object} oldData - old example from database
 * @param {Object} newStep - new step value of rate row
 * @param {Object} vendor - current vendor's data
 * @param {Object} defaultPricelist - default pricelist data
 * @return nothing - updates vendor's rates
 */
const updateVendorStepMultipliers = async (oldData, newStep, vendor, defaultPricelist) => {
  const { _id, competencies, rates } = vendor;
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const sameStep = stepMultipliersTable.find(item => item.step._id.toString() === newStep._id.toString());
  const isNotLastStepInCompetence = competencies.find(item => item.step.toString() === oldData.step._id.toString());
  if (!sameStep) {
    stepMultipliersTable.push(...await getStepMultipliersCombinations(newStep, defaultPricelist));
    pricelistTable = await getPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable);
  }
  if (!isNotLastStepInCompetence) {
    stepMultipliersTable = filterRedundantSteps(stepMultipliersTable, oldData.step._id);
    pricelistTable = filterRedundantSteps(pricelistTable, oldData.step._id);
  }
  return {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    }
  };

  function filterRedundantSteps(arr, stepId) {
    return arr.filter(item => item.step.toString() !== stepId.toString());
  }
};

/**
 *
 * @param {Object} oldData - old example from database
 * @param {Object} newIndustry - new industry of rate row
 * @param {Object} vendor - current vendor's data
 * @param {Object} defaultPricelist - default pricelist data
 * @return nothing - updates vendor's rates
 */
const updateIndustryMultipliers = async (oldData, newIndustry, vendor, defaultPricelist) => {
  const { _id, competencies, rates } = vendor;
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const sameIndustry = industryMultipliersTable.find(item => item.industry.toString() === newIndustry._id.toString());
  const isNotLastIndustryInCompetence = competencies.find(item => item.industry.toString() === oldData.industry._id.toString());
  if (!sameIndustry) {
    const boundIndustry = defaultPricelist.industryMultipliersTable.find(item => item.industry.toString() === newIndustry._id.toString());
    const multiplier = boundIndustry ? boundIndustry.multiplier : 100;
    industryMultipliersTable.push({
      industry: newIndustry._id,
      multiplier
    });
    pricelistTable = await getPricelistCombinations(basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable);
  }
  if (!isNotLastIndustryInCompetence) {
    industryMultipliersTable = industryMultipliersTable.filter(item => item.industry.toString() !== oldData.industry._id.toString());
    pricelistTable = pricelistTable.filter(item => item.industry.toString() !== oldData.industry._id.toString());
  }
  return {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    }
  };
};

/**
 *
 * @param {String} vendorId - updating subject's id
 * @param {String} itemIdentifier - updating table identifier string
 * @param {Object} updatedItem - updated example from frontend
 * @return nothing - updates vendor's rates
 */
const updateVendorsRatePrices = async (vendorId, itemIdentifier, updatedItem) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = vendor.rates;
  let updatedPricelistTable;
  switch (itemIdentifier) {
    default:
    case tableKeys.basicPricesTable:
      const { basicPrice } = basicPricesTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (basicPrice === Number(updatedItem.basicPrice)) return;
      const updatedBasicPricesTable = replaceOldItem(
        basicPricesTable,
        updatedItem,
        defaultPricelist,
        tableKeys.basicPricesTable,
        'Vendor');
      updatedPricelistTable = changePricelistTable(
        pricelistTable,
        updatedItem,
        itemIdentifier,
        basicPrice
      );
      vendor.rates.basicPricesTable = updatedBasicPricesTable;
      vendor.rates.pricelistTable = updatedPricelistTable;
      await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates });
      break;
    case tableKeys.stepMultipliersTable:
      const { multiplier: stepMultiplier } = stepMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (stepMultiplier === Number(updatedItem.multiplier)) return;
      const updatedStepMultipliersTable = replaceOldItem(
        stepMultipliersTable,
        updatedItem,
        defaultPricelist,
        tableKeys.stepMultipliersTable,
        'Vendor'
      );
      updatedPricelistTable = changePricelistTable(
        pricelistTable,
        updatedItem,
        itemIdentifier,
        stepMultiplier
      );
      vendor.rates.stepMultipliersTable = updatedStepMultipliersTable;
      vendor.rates.pricelistTable = updatedPricelistTable;
      await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates });
      break;
    case tableKeys.industryMultipliersTable:
      const { multiplier: industryMultiplier } = industryMultipliersTable.find(item => item._id.toString() === updatedItem._id.toString());
      if (industryMultiplier === Number(updatedItem.multiplier)) return;
      const updatedIndustryMultipliersTable = replaceOldItem(
        industryMultipliersTable,
        updatedItem,
        defaultPricelist,
        tableKeys.industryMultipliersTable,
        'Vendor'
      );
      updatedPricelistTable = changePricelistTable(
        pricelistTable,
        updatedItem,
        itemIdentifier,
        industryMultiplier
      );
      vendor.rates.industryMultipliersTable = updatedIndustryMultipliersTable;
      vendor.rates.pricelistTable = updatedPricelistTable;
      await Vendors.updateOne({ _id: vendorId }, { rates: vendor.rates });
      break;
  }
};
async function updateVendorRates(vendor, rateInfo) {
  const { stepsIds, prop, packageSize, industries, source, target, rates } = rateInfo;
  try {
    let updatedRates = [];
    if(prop === 'monoRates') {
      updatedRates = await manageMonoPairRates({
        stepsIds, packageSize, industries, target, rates, currentRates: vendor[prop], entity: vendor
      });
    } else {
      updatedRates = await manageDuoPairRates({
        stepsIds, source, target, industries, rates, currentRates: vendor[prop], entity: vendor
      });
    }
    return await getVendorAfterUpdate({"_id": vendor.id}, {[prop]: updatedRates});
  } catch(err) {
    console.log(err);
    console.log("Error in updateVendorRates");
  }
}

async function getVendorAfterCombinationsUpdated({project, step, rate}) {
  try {
    const rateInfo = await getRateInfoFromStepFinance({project, step, rate});
    const vendor = await getVendor({"_id": step.vendor._id});
    return await updateVendorRates(vendor, rateInfo);
  } catch(err) {
    console.log(err);
    console.log("Error in getVendorAfterCombinationsUpdated");
  }
}

module.exports = {
  updateVendorRatesFromCompetence,
  updateVendorsRatePrices,
  getVendorAfterCombinationsUpdated
};

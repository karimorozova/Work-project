const { Vendors, Pricelist } = require('../models');
const {
  getPricelistCombinations,
  replaceOldItem,
  changePricelistTable,
} = require('../clients');
const { getRateInfoFromStepFinance, manageMonoPairRates, manageDuoPairRates } = require("../pricelist/ratesmanage")
const { getVendor, getVendorAfterUpdate } = require("./index");
const { createRateCombinations } = require('./createVendorRates');
const { tableKeys } = require('../enums');

/**
 *
 * @param {String} vendorId - updating subject's id
 * @param {String} newData - updated competence example from frontend
 * @param {String} oldData - old competence example from database
 * @return nothing - updates vendor's rates
 */

/*

 */
const updateVendorRatesFromCompetence = async (vendorId, newData, oldData) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isVendorDefault: true });
  const sourceLangDifference = compareIds(newData.sourceLanguage, oldData.sourceLanguage);
  const targetLangDifference = compareIds(newData.targetLanguage, oldData.targetLanguage);
  const stepDifference = compareIds(newData.step, oldData.step);
  const industryDifference = compareIds(newData.industry, oldData.industry);
  let updatedRates = vendor.rates;
  if (sourceLangDifference || targetLangDifference) {
    updatedRates = await updateVendorLangPairs(
      newData,
      oldData,
      sourceLangDifference,
      targetLangDifference,
      vendor,
      updatedRates,
      defaultPricelist
    );
  }
  if (stepDifference) {
    updatedRates = await updateVendorStepMultipliers(oldData, stepDifference, vendor, updatedRates);
  }
  if (industryDifference) {
    updatedRates = await updateIndustryMultipliers(oldData, industryDifference, vendor, updatedRates);
}
  return updatedRates

  function compareIds (obj1, obj2) {
    return obj1._id.toString() === obj2._id.toString() ? undefined : obj1;
  }
};

/**
 *
 * @param {Object} newData - new competence example from frontend
 * @param {Object} oldData - old example from database
 * @param {Object} newSourceLang - new source language value of rate row
 * @param {Object} newTargetLang - new target language value of rate row
 * @param {Object} vendor - current vendor's data
 * @param {Object} defaultPricelist - default pricelist data
 * @param {Object} vendorRates - updated vendor's rates
 * @return nothing - updates vendor's rates
 */
const updateVendorLangPairs = async (
  newData,
  oldData,
  newSourceLang,
  newTargetLang,
  vendor,
  vendorRates,
  defaultPricelist
) => {
  const { competencies } = vendor;
  const { sourceLanguage, targetLanguage } = oldData;
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = vendorRates;
  if (newSourceLang && newTargetLang) {
    const sameLangPairRow = findSameLangPairRow(basicPricesTable, newSourceLang._id, newTargetLang._id);
    if (!sameLangPairRow) {
      basicPricesTable = pushNewBasicPriceItem(
        basicPricesTable,
        defaultPricelist,
        newSourceLang._id,
        newTargetLang._id
      );
      pricelistTable = await getPricelistCombinations(
        basicPricesTable,
        stepMultipliersTable,
        industryMultipliersTable,
        pricelistTable
      );
    }
  } else if (newSourceLang && !newTargetLang) {
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
  } else {
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
  }
  const isNotLastLangPairInCompetence = findSameLangPairRow(competencies, sourceLanguage._id, targetLanguage._id);
  if (!isNotLastLangPairInCompetence) {
    basicPricesTable = filterRedundantLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
    pricelistTable = filterRedundantLangPair(pricelistTable, sourceLanguage._id, targetLanguage._id);
  }
  return {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
    pricelistTable
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
 * @param {Object} vendorRates - updated vendor's rates
 * @return nothing - updates vendor's rates
 */
const updateVendorStepMultipliers = async (oldData, newStep, vendor, vendorRates) => {
  const { competencies, _id: vendorId } = vendor;
  const sameStep = vendorRates.stepMultipliersTable.find(item => item.step._id.toString() === newStep._id.toString());
  const isNotLastStepInCompetence = competencies.find(item => item.step.toString() === oldData.step._id.toString());
  if (!sameStep) {
    const dataForCreation = [{
      step: newStep._id,
      sourceLanguage: oldData.sourceLanguage._id,
      targetLanguage: oldData.targetLanguage._id,
      industry: oldData.industry._id
    }];
    vendorRates = await createNewRateCombinations(dataForCreation, vendorRates, vendorId);
  }
  if (!isNotLastStepInCompetence) {
    vendorRates.stepMultipliersTable = filterRedundantItem(vendorRates.stepMultipliersTable, oldData.step._id);
    vendorRates.pricelistTable = filterRedundantItem(vendorRates.pricelistTable, oldData.step._id);
  }
  return vendorRates;
};

/**
 *
 * @param {Object} oldData - old example from database
 * @param {Object} newIndustry - new industry of rate row
 * @param {Object} vendor - current vendor's data
 * @param {Object} vendorRates - updated vendor's rates
 * @return nothing - updates vendor's rates
 */
const updateIndustryMultipliers = async (oldData, newIndustry, vendor, vendorRates) => {
  const { competencies, _id: vendorId } = vendor;
  const sameIndustry = vendorRates.industryMultipliersTable.find(item => item.industry.toString() === newIndustry._id.toString());
  const isNotLastIndustryInCompetence = competencies.find(item => item.industry.toString() === oldData.industry._id.toString());
  if (!sameIndustry) {
    const dataForCreation = [{
      industry: newIndustry,_id,
      sourceLanguage: oldData.sourceLanguage._id,
      targetLanguage: oldData.targetLanguage._id,
      step: oldData.step._id
    }];
    vendorRates = await createNewRateCombinations(dataForCreation, vendorRates, vendorId);
  }
  if (!isNotLastIndustryInCompetence) {
    vendorRates.industryMultipliersTable = filterRedundantItem(vendorRates.industryMultipliersTable, oldData.step._id)
    vendorRates.pricelistTable = filterRedundantItem(vendorRates.pricelistTable, oldData.step._id)
  }
  return vendorRates
};

const filterRedundantItem = (arr, itemId) => arr.filter(item => item.step.toString() !== itemId.toString());

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
    let updatedRates;
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

const createNewRateCombinations = async (dataForCreation, vendorRates, vendorId) => {
  const {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
    pricelistTable,
  } = await createRateCombinations(dataForCreation, vendorId);
  vendorRates.basicPricesTable = [...vendorRates.basicPricesTable, ...basicPricesTable];
  vendorRates.stepMultipliersTable = [...vendorRates.stepMultipliersTable, ...stepMultipliersTable];
  vendorRates.industryMultipliersTable = [...vendorRates.industryMultipliersTable, ...industryMultipliersTable];
  vendorRates.pricelistTable = [...vendorRates.pricelistTable, ...pricelistTable];
  return vendorRates;
}

module.exports = {
  updateVendorRatesFromCompetence,
  updateVendorsRatePrices,
  getVendorAfterCombinationsUpdated
};

const { Vendors, Pricelist } = require('../models');
const { generateNewStepCombinations } = require('../clients/editClientRates');
const { getPricelistCombinations, replaceOldItem, changePricelistTable, getStepMultipliersCombinations } = require('../clients');
const { tableKeys } = require('../enums');

const updateVendorRatesFromCompetence = async (vendorId, newData, oldData) => {
  const vendor = await Vendors.findOne({ _id: vendorId });
  const defaultPricelist = await Pricelist.findOne({ isDefault: true });
  const sourceLangDifference = compareIds(newData.sourceLanguage, oldData.sourceLanguage);
  const targetLangDifference = compareIds(newData.targetLanguage, oldData.targetLanguage);
  const stepDifference = compareIds(newData.step, oldData.step);
  const industryDifference = compareIds(newData.industry, oldData.industry);
  if (sourceLangDifference || targetLangDifference) {
    await updateVendorLangPairs(
      oldData,
      sourceLangDifference,
      targetLangDifference,
      vendor,
      defaultPricelist
    );
  }
  if (stepDifference) {
    await updateVendorStepMultipliers(oldData, stepDifference, vendor, defaultPricelist);
  }
  if (industryDifference) {
    await updateIndustryMultipliers(oldData, industryDifference, vendor, defaultPricelist);
  }

  function compareIds(obj1, obj2) {
    return obj1._id.toString() !== obj2._id.toString() ? obj1 : undefined;
  }
};

/*
  update competence => check for duplicates in competence =>
  {
    if duplicate found => do not remove old rate's row => create new lang pair in basic price =>
    check for same row in default pricelist => create new step multiplier row => check for same row in default pricelist =>
    create new industry multiplier row => check for same row in default pricelist => recalculate with new data =>
    check for same row in default pricelist;

    if no duplicate found => remove old rate's row => create new lang pair in basic price =>
    check for same row in default pricelist => create new step multiplier row => check for same row in default pricelist =>
    create new industry multiplier row => check for same row in default pricelist => recalculate with new data =>
    check for same row in default pricelist;
  }
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
  await Vendors.updateOne({ _id }, {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    }
  });

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
  };
};


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
  await Vendors.updateOne({ _id }, {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    }
  });

  function filterRedundantSteps(arr, stepId) {
    return arr.filter(item => item.step.toString() !== stepId.toString());
  }
};

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
  await Vendors.updateOne({ _id }, {
    rates: {
      basicPricesTable,
      stepMultipliersTable,
      industryMultipliersTable,
      pricelistTable
    }
  });
};

module.exports = {
  updateVendorRatesFromCompetence
};

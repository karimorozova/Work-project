const { Clients, Pricelist, Vendors } = require('../models');
const { tableKeys } = require('../enums/ratesTableKeys');
const { getNeededCurrency, getNeededLangPair, getNeededStepRow } = require('./clientRates');
const { multiplyPrices } = require('../multipliers');

/**
 *
 * @param {ObjectId} clientId
 * @param {String} tableKey
 * @param {Object} row
 * @returns nothing - synchronizes client's rates with bound pricelist
 */
const syncClientRatesCost = async (clientId, tableKey, row) => {
  const { currency, rates, defaultPricelist } = await Clients.findOne({ _id: clientId });
  const {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
  } = await Pricelist.findOne({ _id: defaultPricelist });
  switch (tableKey) {
    default:
    case tableKeys.basicPricesTable:
      await synchronizeBasicPrice(row, basicPricesTable, rates, clientId, currency);
      break;
    case tableKeys.stepMultipliersTable:
      await synchronizeStepMultiplier(row, stepMultipliersTable, rates, clientId);
      break;
    case tableKeys.industryMultipliersTable:
      await synchronizeIndustryMultiplier(row, industryMultipliersTable, rates, clientId);
      break;
    case tableKeys.pricelistTable:
      await synchronizePricelistTable(row, rates, clientId);
  }
};

/**
 *
 * @param {Object} row
 * @param {Array} basicPricesTable
 * @param {Object} rates
 * @param {ObjectId} subjectId
 * @param {String} currency
 * @param {Boolean} fromVendor
 * @returns nothing - just updates vendor or client;
 */
const synchronizeBasicPrice = async (row, basicPricesTable, rates, subjectId, currency, fromVendor = false) => {
  const { _id, sourceLanguage, targetLanguage, basicPrice } = row;
  const neededSubject = fromVendor ? Vendors : Clients;
  const neededLangPair = getNeededLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
  let boundBasicPrice = 0;
  if (neededLangPair) {
    boundBasicPrice = fromVendor ? (getNeededCurrency(neededLangPair, currency) / 2)
      : getNeededCurrency(neededLangPair, currency);
  }
  const neededRowIndex = rates.basicPricesTable.findIndex(item => item._id.toString() === _id.toString());
  rates.basicPricesTable[neededRowIndex].basicPrice = boundBasicPrice ? boundBasicPrice : basicPrice;
  rates.basicPricesTable[neededRowIndex].altered = false;
  rates.basicPricesTable[neededRowIndex].notification = '';
  rates.pricelistTable = recalculateFromNewPrice(row, boundBasicPrice, rates);
  await neededSubject.updateOne({ _id: subjectId }, { rates });
};

/**
 *
 * @param {Object} row
 * @param {Number} syncedPrice
 * @param {Object} rates
 * @returns {Array} - returns an array of client's pricelist table
 */
const recalculateFromNewPrice = (row, syncedPrice, rates) => {
  const { sourceLanguage, targetLanguage } = row;
  let { stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  pricelistTable = pricelistTable.map(item => {
    if (item.sourceLanguage.toString() === sourceLanguage._id.toString() &&
      item.targetLanguage.toString() === targetLanguage._id.toString()) {
      const { multiplier: stepMultiplier, size } = stepMultipliersTable.find(row => (
        `${row.step} ${row.unit} ${row.size}` === `${item.step} ${item.unit} ${item.size}`
      ));
      const { multiplier: industryMultiplier } = industryMultipliersTable.find(row => (
        row.industry.toString() === item.industry.toString()
      ));
      item.price = multiplyPrices(syncedPrice, stepMultiplier, size, industryMultiplier);
    }
    return item
  });
  return pricelistTable;
};

/**
 *
 * @param {Object} row
 * @param {Array} stepMultipliersTable
 * @param {Object} rates
 * @param {ObjectId} subjectId
 * @param {Boolean} fromVendor
 * @returns nothing - just updates vendor or client;
 */
const synchronizeStepMultiplier = async (row, stepMultipliersTable, rates, subjectId, fromVendor = false) => {
  const { _id, step, unit, size, multiplier } = row;
  const neededSubject = fromVendor ? Vendors : Clients;
  const neededStepMultiplierRow = getNeededStepRow(stepMultipliersTable, step, unit, size);
  const neededRowIndex = rates.stepMultipliersTable.findIndex(item => item._id.toString() === _id.toString());
  const syncedMultiplier = !!neededStepMultiplierRow ? neededStepMultiplierRow.multiplier : multiplier;
  rates.stepMultipliersTable[neededRowIndex].multiplier = syncedMultiplier;
  rates.stepMultipliersTable[neededRowIndex].altered = false;
  rates.stepMultipliersTable[neededRowIndex].notification = '';
  rates.pricelistTable = recalculateFromNewMultiplier(row, syncedMultiplier, rates, tableKeys.stepMultipliersTable);
  await neededSubject.updateOne({ _id: subjectId }, { rates });
};

/**
 *
 * @param {Object} row
 * @param {Array} industryMultipliersTable
 * @param {Object} rates
 * @param {ObjectId} subjectId
 * @param {Boolean} fromVendor
 * @returns nothing - just updates vendor or client;
 */
const synchronizeIndustryMultiplier = async (row, industryMultipliersTable, rates, subjectId, fromVendor = false) => {
  const { _id, industry, multiplier } = row;
  const neededSubject = fromVendor ? Vendors : Clients;
  const neededIndustryMultiplierRow = industryMultipliersTable.find(item => item.industry.toString() === industry._id.toString());
  const neededRowIndex = rates.industryMultipliersTable.findIndex(item => item._id.toString() === _id.toString());
  const oldMultiplier = !!neededIndustryMultiplierRow ? neededIndustryMultiplierRow.multiplier : multiplier;
  rates.industryMultipliersTable[neededRowIndex].multiplier = oldMultiplier;
  rates.industryMultipliersTable[neededRowIndex].altered = false;
  rates.industryMultipliersTable[neededRowIndex].notification = '';
  rates.pricelistTable = recalculateFromNewMultiplier(row, oldMultiplier, rates, tableKeys.industryMultipliersTable);
  await neededSubject.updateOne({ _id: subjectId }, { rates });
};

/**
 *
 * @param {Object} row
 * @param {Object} rates
 * @param {ObjectId} subjectId
 * @param {Boolean} fromVendor
 * @returns nothing - just updates vendor or client;
 */
const synchronizePricelistTable = async (row, rates, subjectId, fromVendor = false) => {
  const { _id, sourceLanguage, targetLanguage, step, unit, size, industry } = row;
  const neededSubject = fromVendor ? Vendors : Clients;
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const { basicPrice } = getNeededLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
  const { multiplier: stepMultiplierValue } = getNeededStepRow(stepMultipliersTable, step, unit, size);
  const { multiplier: industryMultiplierValue } = industryMultipliersTable.find(item => (
    item.industry.toString() === industry._id.toString()
  ));
  const recalculatedPrice = multiplyPrices(basicPrice, stepMultiplierValue, size, industryMultiplierValue);
  const neededPricelistRowIndex = pricelistTable.findIndex(item => item._id.toString() === _id.toString());
  rates.pricelistTable[neededPricelistRowIndex].price = recalculatedPrice;
  rates.pricelistTable[neededPricelistRowIndex].altered = false;
  rates.pricelistTable[neededPricelistRowIndex].notification = '';
  await neededSubject.updateOne({ _id: subjectId }, { rates });
};

/**
 *
 * @param {Object} row
 * @param {Number} syncedMultiplier
 * @param {Object} rates
 * @param {String} key
 * @returns {Array} - returns an updated pricelist table
 */
const recalculateFromNewMultiplier = (row, syncedMultiplier, rates, key) => {
  let { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  switch (key) {
    default:
    case tableKeys.stepMultipliersTable:
      pricelistTable = pricelistTable.map(item => {
        if (
          item.step.toString() === row.step._id.toString() &&
          item.unit.toString() === row.unit._id.toString() &&
          item.size === Number(row.size)) {
          const { basicPrice } = basicPricesTable.find(row => (
            `${row.sourceLanguage} ${row.targetLanguage}` === `${item.sourceLanguage} ${item.targetLanguage}`
          ));
          const { multiplier: industryMultiplier } = industryMultipliersTable.find(row => (
            row.industry.toString() === item.industry.toString()
          ));
          item.price = multiplyPrices(basicPrice, syncedMultiplier, row.size, industryMultiplier);
        }
        return item;
      });
      break;
    case tableKeys.industryMultipliersTable:
      pricelistTable = pricelistTable.map(item => {
        if (item.industry.toString() === row.industry._id.toString()) {
          const { basicPrice } = basicPricesTable.find(row => (
            `${row.sourceLanguage} ${row.targetLanguage}` === `${item.sourceLanguage} ${item.targetLanguage}`
          ));
          const { multiplier: stepMultiplier, size } = stepMultipliersTable.find(row => (
            `${row.step} ${row.unit} ${row.size}` === `${item.step} ${item.unit} ${item.size}`
          ));
          item.price = multiplyPrices(basicPrice, stepMultiplier, size, syncedMultiplier);
        }
        return item;
      });
  }
  return pricelistTable;
};

module.exports = {
  syncClientRatesCost,
  recalculateFromNewPrice,
  recalculateFromNewMultiplier,
  synchronizeBasicPrice,
  synchronizeStepMultiplier,
  synchronizeIndustryMultiplier,
  synchronizePricelistTable
};

const { Clients, Pricelist, Vendors } = require('../models');
const { tableKeys } = require('../enums/ratesTableKeys');
const { getNeededCurrency, getNeededLangPair, getNeededStepRow } = require('./clientRates');
const { multiplyPrices } = require('../multipliers');

const syncClientRatesCost = async (clientId, tableKey, row) => {
  const { currency, rates } = await Clients.findOne({ _id: clientId });
  const {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
  } = await Pricelist.findOne({  isDefault: true  });
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

const synchronizeBasicPrice = async (row, basicPricesTable, rates, subjectId, currency, fromVendor = false) => {
  const { _id, sourceLanguage, targetLanguage, basicPrice } = row;
  const neededSubject = fromVendor ? Vendors : Clients;
  const neededLangPair = getNeededLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
  const boundBasicPrice = neededLangPair ? getNeededCurrency(neededLangPair, currency) : basicPrice;
  const neededRowIndex = rates.basicPricesTable.findIndex(item => item._id.toString() === _id.toString());
  rates.basicPricesTable[neededRowIndex].basicPrice = boundBasicPrice;
  rates.basicPricesTable[neededRowIndex].altered = false;
  rates.basicPricesTable[neededRowIndex].notification = '';
  rates.pricelistTable = recalculateFromNewPrice(row, boundBasicPrice, rates.pricelistTable);
  await neededSubject.updateOne({ _id: subjectId }, { rates });
};

const recalculateFromNewPrice = (row, oldPrice, pricelistTable) => {
  const { sourceLanguage, targetLanguage, basicPrice: newPrice } = row;
  pricelistTable = pricelistTable.map(item => {
    if (item.sourceLanguage.toString() === sourceLanguage._id.toString() &&
      item.targetLanguage.toString() === targetLanguage._id.toString()) {
      item.price /= newPrice;
      item.price *= oldPrice;
    }
    return item
  });
  return pricelistTable;
};

const synchronizeStepMultiplier = async (row, stepMultipliersTable, rates, subjectId, fromVendor = false) => {
  const { _id, step, unit, size, multiplier } = row;
  const neededSubject = fromVendor ? Vendors : Clients;
  const neededStepMultiplierRow = getNeededStepRow(stepMultipliersTable, step, unit, size);
  const neededRowIndex = rates.stepMultipliersTable.findIndex(item => item._id.toString() === _id.toString());
  const oldMultiplier = !!neededStepMultiplierRow ? neededStepMultiplierRow.multiplier : multiplier;
  rates.stepMultipliersTable[neededRowIndex].multiplier = oldMultiplier;
  rates.stepMultipliersTable[neededRowIndex].altered = false;
  rates.stepMultipliersTable[neededRowIndex].notification = '';
  rates.pricelistTable = recalculateFromNewMultiplier(row, oldMultiplier, rates.pricelistTable, tableKeys.stepMultipliersTable);
  await neededSubject.updateOne({ _id: subjectId }, { rates });
};

const synchronizeIndustryMultiplier = async (row, industryMultipliersTable, rates, subjectId, fromVendor = false) => {
  const { _id, industry, multiplier } = row;
  const neededSubject = fromVendor ? Vendors : Clients;
  const neededIndustryMultiplierRow = industryMultipliersTable.find(item => item.industry.toString() === industry._id.toString());
  const neededRowIndex = rates.industryMultipliersTable.findIndex(item => item._id.toString() === _id.toString());
  const oldMultiplier = !!neededIndustryMultiplierRow ? neededIndustryMultiplierRow.multiplier : multiplier;
  rates.industryMultipliersTable[neededRowIndex].multiplier = oldMultiplier;
  rates.industryMultipliersTable[neededRowIndex].altered = false;
  rates.industryMultipliersTable[neededRowIndex].notification = '';
  rates.pricelistTable = recalculateFromNewMultiplier(row, oldMultiplier, rates.pricelistTable, tableKeys.industryMultipliersTable);
  await neededSubject.updateOne({ _id: subjectId }, { rates });
};

const synchronizePricelistTable = async (row, rates, subjectId, fromVendor = false) => {
  const { _id, sourceLanguage, targetLanguage, step, unit, size, industry } = row;
  const neededSubject = fromVendor ? Vendors : Clients;
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const { basicPrice } = getNeededLangPair(basicPricesTable, sourceLanguage._id, targetLanguage._id);
  const { multiplier: stepMultiplierValue } = getNeededStepRow(stepMultipliersTable, step, unit, size);
  const { multiplier: industryMultiplierValue } = industryMultipliersTable.find(item => (
    item.industry.toString() === industry._id.toString()
  ));
  const recalculatedPrice = multiplyPrices(basicPrice, stepMultiplierValue, industryMultiplierValue);
  const neededPricelistRowIndex = pricelistTable.findIndex(item => item._id.toString() === _id.toString());
  rates.pricelistTable[neededPricelistRowIndex].price = recalculatedPrice;
  rates.pricelistTable[neededPricelistRowIndex].altered = false;
  rates.pricelistTable[neededPricelistRowIndex].notification = '';
  await neededSubject.updateOne({ _id: subjectId }, { rates });
};
const recalculateFromNewMultiplier = (row, oldMultiplier, pricelistTable, key) => {
  switch (key) {
    default:
    case tableKeys.stepMultipliersTable:
      pricelistTable = pricelistTable.map(item => {
        if (
          item.step.toString() === row.step._id.toString() &&
          item.unit.toString() === row.unit._id.toString() &&
          item.size === Number(row.size)) {
          item.price /= row.multiplier;
          item.price *= oldMultiplier;
        }
        return item;
      });
      break;
    case tableKeys.industryMultipliersTable:
      pricelistTable.map(item => {
        if (item.industry.toString() === row.industry._id.toString()) {
          item.price /= row.multiplier;
          item.price *= oldMultiplier;
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

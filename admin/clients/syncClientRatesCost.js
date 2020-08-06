const { Clients, Pricelist } = require('../models');
const { tableKeys } = require('../enums/ratesTableKeys');
const { getNeededCurrency, getNeededLangPair } = require('./clientRates');
const { multiplyPrices } = require('../multipliers');

const syncClientRatesCost = async (clientId, tableKey, row) => {
  const { defaultPricelist, currency, rates } = await Clients.findOne({ _id: clientId });
  const {
    basicPricesTable,
    stepMultipliersTable,
    industryMultipliersTable,
  } = await Pricelist.findOne({ _id: defaultPricelist });
  switch (tableKey) {
    default:
    case tableKeys.pricelistTable:
      await synchronizeBasicPrice(row, basicPricesTable, rates, clientId);
      break;
    case tableKeys.stepMultipliersTable:
      await synchronizeStepMultiplier(row, stepMultipliersTable, rates, clientId);
      break;
    case tableKeys.industryMultipliersTable:
      await synchronizeIndustryMultiplier(row, industryMultipliersTable, rates, clientId);
  }
};

const synchronizeBasicPrice = async (row, basicPricesTable, rates, clientId) => {
  const { _id, sourceLanguage, targetLanguage, basicPrice } = row;
  const neededLangPair = getNeededLangPair(basicPricesTable, sourceLanguage, targetLanguage);
  const boundBasicPrice = neededLangPair ? getNeededCurrency(neededLangPair, currency) : basicPrice;
  const neededRowIndex = rates.basicPricesTable.findIndex(item => item._id.toString() === _id.toString());
  const oldPrice = rates.basicPricesTable[neededRowIndex].basicPrice;
  rates.basicPricesTable[neededRowIndex].basicPrice = boundBasicPrice;
  rates.pricelistTable = recalculateFromNewPrice(row, oldPrice, rates.pricelistTable);
  await Clients.updateOne({ _id: clientId }, { rates });
};

const recalculateFromNewPrice = (row, oldPrice, pricelistTable) => {
  const { sourceLanguage, targetLanguage, basicPrice: newPrice } = row;
  pricelistTable.map(item => {
    if (item.sourceLanguage.toString() === sourceLanguage.toString() &&
      item.targetLanguage.toString() === targetLanguage.toString()) {
      item.price /= oldPrice;
      item.price *= newPrice;
    };
  });
  return pricelistTable;
};

const synchronizeStepMultiplier = async (row, stepMultipliersTable, rates, clientId) => {
  const { _id, step, unit, size } = row;
  const neededStepMultiplierRow = stepMultipliersTable.find(item => (
    `${item.step} ${item.unit} ${item.size}` === `${step} ${unit} ${size}`
  ));
  const neededRowIndex = rates.stepMultipliersTable.findIndex(item => item._id.toString() === _id.toString());
  rates.stepMultipliersTable[neededRowIndex].multiplier = neededStepMultiplierRow.multiplier;
  await Clients.updateOne({ _id: clientId }, { rates });
};

const synchronizeIndustryMultiplier = async (row, industryMultipliersTable, rates, clientId) => {
  const { _id, industry } = row;
  const neededIndustryMultiplierRow = industryMultipliersTable.find(item => item.industry.toString() === industry.toString());
  const neededRowIndex = rates.industryMultipliersTable.findIndex(item => item._id.toString() === _id.toString());
  rates.industryMultipliersTable[neededRowIndex].multiplier = neededIndustryMultiplierRow.multiplier;
  await Clients.updateOne({ _id: clientId }, { rates });
};

const recalculateFromNewMultiplier = (row, oldMultiplier, pricelistTable, key) => {
   switch (key) {
     case tableKeys.stepMultipliersTable:

   }
};

module.exports = {
  syncClientRatesCost
};

const { Pricelist, Clients } = require('../models');
const { multiplyPrices } = require('../multipliers');

/**
 *
 * @param {ObjectId} clientId
 * @param {ObjectId} defaultPricelistId
 * @param {Object} objToBind
 * @param {String} key
 * @returns nothing - just updates client
 */
const bindClientRates = async (clientId, defaultPricelistId, objToBind, key) => {
  const { rates, currency, defaultPricelist } = await Clients.findOne({ _id: clientId });
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable, pricelistTable } = rates;
  const pricelist = await Pricelist.findOne({ _id: defaultPricelist });
  switch (key) {
    default:
    case 'Basic Price Table':
      const updatedBasicPriceItem = getUpdatedBasicPriceRow(pricelist.basicPricesTable, objToBind, currency);
      const oldBasicPriceItemIndex = basicPricesTable.findIndex(item => item._id === objToBind._id);
      rates.basicPricesTable.splice(oldBasicPriceItemIndex, 1, updatedBasicPriceItem);
      break;
    case 'Step Multipliers Table':
      const updatedStepMultiplierItem = getUpdatedStepMultiplierRow(pricelist.stepMultipliersTable, objToBind);
      const oldStepMultiplierItemIndex = stepMultipliersTable.findIndex(item => item._id === objToBind._id);
      rates.stepMultipliersTable.splice(oldStepMultiplierItemIndex, 1, updatedStepMultiplierItem);
      break;
    case 'Industry Multipliers Table':
      const updatedIndustryMultiplierItem =
        getUpdatedIndustryMultiplierRow(pricelist.industryMultipliersTable, objToBind);
      const oldIndustryMultiplierIndex = industryMultipliersTable.findIndex(item => item._id === objToBind._id);
      rates.industryMultipliersTable.splice(oldIndustryMultiplierIndex, 1, updatedIndustryMultiplierItem);
      break;
    case 'Pricelist Table':
      const updatedPricelistItem =
        getUpdatedPricelistRow(basicPricesTable, stepMultipliersTable, industryMultipliersTable, objToBind);
      const oldPricelistItemIndex = pricelistTable.findIndex(item => item._id === objToBind._id);
      rates.pricelistTable.splice(oldPricelistItemIndex, 1, updatedPricelistItem);
      break;
  }
  await Clients.updateOne({ _id: clientId }, { rates });
};

/**
 *
 * @param {Array} basicPriceTable
 * @param {Object} obj
 * @param {String} currency
 * @returns {Object} - returns updated object
 */
const getUpdatedBasicPriceRow = (basicPriceTable, obj, currency) => {
  const relatedRow = basicPriceTable.find(item => (
    item.sourceLanguage === obj.sourceLanguage &&
    item.targetLanguage === obj.targetLanguage
  ));
  if (relatedRow) {
    const { euroBasicPrice, usdBasicPrice, gbpBasicPrice } = relatedRow;
    switch (currency) {
      default:
      case 'EUR':
        obj.basicPrice = euroBasicPrice;
        return obj;
      case 'USD':
        obj.basicPrice = usdBasicPrice;
        return obj;
      case 'GBP':
        obj.basicPrice = gbpBasicPrice;
        return obj;
    }
  } else {
    return obj;
  }
};

/**
 *
 * @param {Array} stepMultipliersTable
 * @param {Object} obj
 * @returns {Object} - returns updated object
 */
const getUpdatedStepMultiplierRow = (stepMultipliersTable, obj) => {
  const relatedRow = stepMultipliersTable.find(item => (
    item.step === obj.step &&
    item.unit === obj.unit &&
    item.size === obj.size
  ));
  if (relatedRow) {
    const { multiplier } = relatedRow;
    obj.multiplier = multiplier;
    return obj;
  } else {
    return obj;
  }
};

/**
 *
 * @param {Array} industryMultipliersTable
 * @param {Object} obj
 * @returns {Object} - returns updated object
 */
const getUpdatedIndustryMultiplierRow = (industryMultipliersTable, obj) => {
  const relatedRow = industryMultipliersTable.find(item => (
    item.industry === obj.industry
  ));
  if (relatedRow) {
    const { multiplier } = relatedRow;
    obj.multiplier = multiplier;
    return obj;
  } else {
    return obj;
  }
};

/**
 *
 * @param {Array} basicPricesTable
 * @param {Array} stepMultipliersTable
 * @param {Array} industryMultipliersTable
 * @param {Object} objToBind
 * @returns {Object} - returns updated object
 */
const getUpdatedPricelistRow = (basicPricesTable, stepMultipliersTable, industryMultipliersTable, objToBind) => {
  const { basicPrice } = basicPricesTable.find(({ sourceLanguage, targetLanguage }) => (
    sourceLanguage === obj.sourceLanguage &&
    targetLanguage === obj.targetLanguage
  ));
  const { multiplier: stepMultiplierValue, size } = stepMultipliersTable.find(({ step, unit, size }) => (
    step === objToBind.step &&
    unit === objToBind.unit &&
    size === objToBind.size
  ));
  const { multiplier: industryMultiplierValue } = industryMultipliersTable.find(({ industry }) => (
    industry === objToBind.industry
  ));
  obj.price = multiplyPrices(basicPrice, stepMultiplierValue, size, industryMultiplierValue);
  return obj;
};

module.exports = { bindClientRates };

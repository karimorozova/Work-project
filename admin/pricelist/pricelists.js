const { Pricelist, Clients, Languages } = require('../models');
const { getDefaultBasicPrices, getDefaultStepMultipliers, getDefaultIndustryMultipliers } = require('../helpers/defaults/defaultPriceLists');
const ObjectId = require('mongodb').ObjectID;

/**
 *
 * @param {Object} pricelist
 * @returns nothing - just creates a new pricelist document
 */
async function saveNewPricelist (pricelist) {
  let {
    name, isActive, isClientDefault, isVendorDefault, basicPricesTable,
    industryMultipliersTable, stepMultipliersTable, copyName
  } = pricelist;
  try {
    if (copyName !== '') {
      const donorPricelist = await Pricelist.findOne({ 'name': copyName });
      basicPricesTable = donorPricelist.basicPricesTable;
      industryMultipliersTable = donorPricelist.industryMultipliersTable;
      stepMultipliersTable = donorPricelist.stepMultipliersTable;
    } else {
      basicPricesTable = await getDefaultBasicPrices();
      industryMultipliersTable = await getDefaultIndustryMultipliers();
      stepMultipliersTable = await getDefaultStepMultipliers();
    }
    return await Pricelist.create({
      name, isClientDefault, isVendorDefault, isActive, basicPricesTable, industryMultipliersTable, stepMultipliersTable
    });
  } catch (err) {
    console.log(err);
    console.log('Error in saveNewPricelist');
  }
}

/**
 *
 * @param {ObjectId} id
 * @param {Boolean} isVendorDefault
 * @returns {Boolean} - if pricelist has been deleted - returns true, else - false
 */
async function deletePricelist (id, isVendorDefault) {
  try {
    const isUsingByClient = await checkClientUsage(id);
    if (!isVendorDefault && !isUsingByClient) {
      await Pricelist.deleteOne({ '_id': id });
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    console.log('Error in deletePricelist');
  }
}

/**
 *
 * @param pricelistId {ObjectId} - current pricelist id
 * @return {Boolean} - checks if current pricelist is in use in any client
 */
const checkClientUsage = async (pricelistId) => {
  const clients = await Clients.find();
  return clients.some(client => (
    client.defaultPricelist.toString() === pricelistId.toString()
  ));
};

/**
 *
 * @param {ObjectId} pricelistId
 * @param {Array} userNewLangs
 * @returns {Array} - returns new lang pairs array
 */
const checkPricelistLangPairs = async (pricelistId, userNewLangs) => {
  const { basicPricesTable } = pricelistId ?
    await Pricelist.findOne({ _id: pricelistId })
      .populate('basicPricesTable.sourceLanguage', ['lang'])
      .populate('basicPricesTable.targetLanguage', ['lang'])
    :
    await Pricelist.findOne({ isVendorDefault: true })
      .populate('basicPricesTable.sourceLanguage', ['lang'])
      .populate('basicPricesTable.targetLanguage', ['lang']);
  const existingLangPairs = basicPricesTable.map(row => `${row.sourceLanguage.lang} - ${row.targetLanguage.lang}`);
  let newLangPairs = [];
  for (let newLangPair of userNewLangs) {
    if (!existingLangPairs.includes(newLangPair)) {
      const splittedString = newLangPair.split(' - ');
      const { _id: sourceId } = await Languages.findOne({ lang: splittedString[0] });
      const { _id: targetId } = await Languages.findOne({ lang: splittedString[1] });
      newLangPairs.push({
        source: ObjectId(sourceId),
        target: ObjectId(targetId),
      });
    }
  }
  return newLangPairs;
};

/**
 *
 * @param {ObjectId} pricelistId
 * @param {Array} langsToAdd
 * @returns nothing - just updates needed pricelist with new lang pairs
 */
const replenishPricelistLangs = async (pricelistId, langsToAdd) => {
  const { _id, newLangPairs: existingLangPairs } = pricelistId ? await Pricelist.findOne({ _id: pricelistId })
    : await Pricelist.findOne({ isVendorDefault: true });
  existingLangPairs.push(...langsToAdd);
  return await Pricelist.updateOne({ _id }, { newLangPairs: existingLangPairs });
};


module.exports = { saveNewPricelist, deletePricelist, checkPricelistLangPairs, replenishPricelistLangs };

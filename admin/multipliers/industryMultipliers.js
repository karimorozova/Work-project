const { Pricelist } = require('../models');
const { tableKeys } = require('../enums');
const { postNotifications } = require('./relatedUsersNotifications');

/**
 *
 * @param {Object} industryToUpdate
 * @param {ObjectId} priceListId
 * @returns nothing - just updates needed pricelist table
 */
const updateIndustryMultipliers = async (industryToUpdate, priceListId) => {
  try {
    const { industryMultipliersTable } = await Pricelist.findOne({ _id: priceListId }, {
      _id: 0,
      industryMultipliersTable: 1
    })
      .populate('industryMultipliersTable.industry');
    const industryMultiplierIndex = industryMultipliersTable.findIndex(industry => (
      industry._id.toString() === industryToUpdate._id
    ));
    industryToUpdate.altered = true;
    industryMultipliersTable.splice(industryMultiplierIndex, 1, industryToUpdate);
    await postNotifications(priceListId, industryToUpdate, tableKeys.industryMultipliersTable);
    await Pricelist.updateOne({ _id: priceListId }, { industryMultipliersTable });
  } catch (err) {
    console.log(err);
    console.log('Error in updateIndustryMultipliers');
  }
};

module.exports = { updateIndustryMultipliers };

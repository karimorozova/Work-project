const { Pricelist } = require('../models');
const updateIndustryMultipliers = async (industryToUpdate, priceListId) => {
  try {
    const { industryMultipliersTable } = await Pricelist.findOne({ _id: priceListId }, { _id: 0, industryMultipliersTable: 1 })
      .populate('industryMultipliersTable.industry');
    const industryMultiplierIndex = industryMultipliersTable.findIndex(industry => (
      industry._id.toString() === industryToUpdate._id
    ));
    industryMultipliersTable.splice(industryMultiplierIndex, 1, industryToUpdate);
    await Pricelist.updateOne({ _id: priceListId }, industryMultipliersTable);
  } catch (err) {
    console.log(err);
    console.log('Error in updateIndustryMultipliers');
  }
}

module.exports = { updateIndustryMultipliers }

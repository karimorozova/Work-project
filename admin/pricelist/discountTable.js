const { Pricelist } = require('../models');
const { getUpdatedPricelist } = require('./getPrices');

/**
 *
 * @param {ObjectId} pricelistId
 * @param {Object} updatedRowObj
 * @returns {Object} - updates needed pricelist table and returns updated
 */
const updatePricelistDiscount = async (pricelistId, updatedRowObj) => {
  const { discountChart } = await Pricelist.findOne({ _id: pricelistId });
  const { key, value } = updatedRowObj
  discountChart[key].rate = +value;
  return await getUpdatedPricelist({ _id: pricelistId }, { discountChart });
}

module.exports = { updatePricelistDiscount }

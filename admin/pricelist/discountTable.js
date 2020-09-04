const { Pricelist } = require('../models');
const { getUpdatedPricelist } = require('./getPrices');

const updatePricelistDiscount = async (pricelistId, updatedRowObj) => {
  const { discountChart } = await Pricelist.findOne({ _id: pricelistId });
  const { key, value } = updatedRowObj
  discountChart[key].rate = +value;
  return await getUpdatedPricelist({ _id: pricelistId }, { discountChart });
}

module.exports = { updatePricelistDiscount }

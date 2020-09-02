const { Pricelist } = require('../models');
const { getUpdatedPricelist } = require('./getPrices');

const updatePricelistDiscount = async (pricelistId, updatedRowObj) => {
  const { discountChart } = await Pricelist.findOne({ _id: pricelistId });
  const [key] = Object.keys(updatedRowObj);
  discountChart[key].rate = updatedRowObj[key];
  return await getUpdatedPricelist({ _id: pricelistId }, discountChart);
}

module.exports = { updatePricelistDiscount }

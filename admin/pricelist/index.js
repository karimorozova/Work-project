const { getPricelist, getPricelists, getUpdatedPricelist } = require("./getPrices");
const { saveNewPricelist, deletePricelist, checkPricelistLangPairs, replenishPricelistLangs } = require("./pricelists");
const { getRatePricelist } = require('./getPricelist');
const { changeMainRatePricelist } = require('./changePricelist');
const { bindClientRates } = require('./bindRates');
const { updatePricelistDiscount } = require('./discountTable');

module.exports = {
  saveNewPricelist,
  deletePricelist,
  getPricelist,
  getPricelists,
  getUpdatedPricelist,
  getRatePricelist,
  changeMainRatePricelist,
  bindClientRates,
  updatePricelistDiscount,
  checkPricelistLangPairs,
  replenishPricelistLangs
};

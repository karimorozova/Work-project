const { getPricelist, getPricelists, getUpdatedPricelist, getClientRates } = require("./getPrices");
const { saveNewPricelist, deletePricelist } = require("./pricelists");
const { getAfterRatesSaved, getAfterRatesImported } = require("./ratesmanage");
const { getRatePricelist } = require('./getPricelist');
const { changeMainRatePricelist } = require('./changePricelist');
const { bindClientRates } = require('./bindRates');

module.exports = {
  getAfterRatesSaved,
  getAfterRatesImported,
  saveNewPricelist,
  deletePricelist,
  getPricelist,
  getPricelists,
  getUpdatedPricelist,
  getRatePricelist,
  changeMainRatePricelist,
  getClientRates,
  bindClientRates
};

const { getPricelist, getPricelists, getUpdatedPricelist, getClientRates } = require("./getPrices");
const { saveNewPricelist, deletePricelist } = require("./pricelists");
const { getAfterRatesSaved, getAfterRatesImported } = require("./ratesmanage");
const { getRatePricelist } = require('./getPricelist');
const { changeClientPricelist } = require('./changePricelist');

module.exports = {
  getAfterRatesSaved,
  getAfterRatesImported,
  saveNewPricelist,
  deletePricelist,
  getPricelist,
  getPricelists,
  getUpdatedPricelist,
  getRatePricelist,
  changeClientPricelist,
  getClientRates
};

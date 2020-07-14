const { getPricelist, getPricelists, getUpdatedPricelist } = require("./getPrices");
const { saveNewPricelist, deletePricelist } = require("./pricelists");
const { getAfterRatesSaved, getAfterRatesImported } = require("./ratesmanage");
const { getRatePricelist } = require('./getPricelist');

module.exports = {
    getAfterRatesSaved,
    getAfterRatesImported,
    saveNewPricelist,
    deletePricelist,
    getPricelist,
    getPricelists,
    getUpdatedPricelist,
  getRatePricelist
}

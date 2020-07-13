const { getPricelist, getPricelists, getUpdatedPricelist } = require("./getPrices");
const { saveNewPricelist, deletePricelist } = require("./pricelists");
const { getAfterRatesSaved, getAfterRatesImported } = require("./ratesmanage");
const { getRateCombinations } = require('./getPricelist');

module.exports = {
    getAfterRatesSaved,
    getAfterRatesImported,
    saveNewPricelist,
    deletePricelist,
    getPricelist,
    getPricelists,
    getUpdatedPricelist,
  getRateCombinations
}

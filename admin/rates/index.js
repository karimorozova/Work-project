const { getPricelist, getPricelists, getUpdatedPricelist } = require("./getrates");
const { saveNewPricelist, deletePricelist } = require("./pricelists");
const { getAfterRatesSaved, getAfterAddSeveralRates } = require("./ratesmanage");

module.exports = {
    getAfterRatesSaved,
    getAfterAddSeveralRates,
    saveNewPricelist,
    deletePricelist,
    getPricelist,
    getPricelists,
    getUpdatedPricelist,
}
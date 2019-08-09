const { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist, getPricelists, getUpdatedPricelist } = require("./getrates");
const { saveNewPricelist, deletePricelist, checkPriceForPairs, addSeveralLangs, replaceRates, replaceFromPrice } = require("./pricelists");
const { getAfterRatesSaved, getAfterAddSeveralRates } = require("./ratesmanage");

module.exports = {
    getAfterRatesSaved,
    getAfterAddSeveralRates,
    getDuoRates,
    getDuoRate,
    getMonoRates,
    getMonoRate,
    saveNewPricelist,
    deletePricelist,
    getPricelist,
    getPricelists,
    getUpdatedPricelist,
    checkPriceForPairs,
    addSeveralLangs,
    replaceRates,
    replaceFromPrice
}
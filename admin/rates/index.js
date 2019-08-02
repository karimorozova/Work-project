const { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist, getPricelists, getUpdatedPricelist, parseIndustries } = require("./getrates");
const { saveNewPricelist, deletePricelist, checkPriceForPairs, addSeveralLangs, replaceRates, replaceFromPrice } = require("./pricelists");
const { getAfterRatesSaved, includeAllIndustries, defaultRates, getAllUpdatedIndustries, getAfterDeleteRates, updateCombIndustries } = require("./ratesmanage");

module.exports = {
    getAfterRatesSaved,
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
    replaceFromPrice,
    includeAllIndustries, 
    defaultRates,
    getAllUpdatedIndustries,
    getAfterDeleteRates,
    parseIndustries,
    updateCombIndustries
}
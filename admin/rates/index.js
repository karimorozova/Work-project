const { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist, getPricelists, getUpdatedPricelist } = require("./getrates");
const { saveNewPricelist, deletePricelist, checkPriceForPairs, addSeveralLangs, replaceRates, replaceFromPrice } = require("./pricelists");
const { getAfterRatesSaved, getAfterAddSeveralMono, includeAllIndustries, defaultRates, getAllUpdatedIndustries, getAfterDeleteRates, updateCombIndustries } = require("./ratesmanage");

module.exports = {
    getAfterRatesSaved,
    getAfterAddSeveralMono,
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
    updateCombIndustries
}
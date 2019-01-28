const { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist, getPricelists, parseIndustries } = require("./getrates");
const { saveNewPricelist, deletePricelist, checkPriceForPairs, addSeveralLangs, replaceRates, replaceFromPrice } = require("./pricelists");
const { includeAllIndustries, defaultRates, getAllUpdatedIndustries, getAfterDeleteRates, updateCombIndustries } = require("./ratesmanage");
module.exports = {
    getDuoRates,
    getDuoRate,
    getMonoRates,
    getMonoRate,
    saveNewPricelist,
    deletePricelist,
    getPricelist,
    getPricelists,
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
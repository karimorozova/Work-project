const { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist, getPricelists } = require("./getrates");
const { saveNewPricelist, deletePricelist, checkPriceForPairs, addSeveralLangs, getNewFromPrice } = require("./pricelists");

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
    getNewFromPrice
}
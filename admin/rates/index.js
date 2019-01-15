const { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist } = require("./getrates");
const { saveNewPricelist, deletePricelist } = require("./pricelists");

module.exports = {
    getDuoRates,
    getDuoRate,
    getMonoRates,
    getMonoRate,
    saveNewPricelist,
    deletePricelist,
    getPricelist
}
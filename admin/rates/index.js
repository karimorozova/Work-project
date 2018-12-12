const { getDuoRates, getDuoRate, getMonoRates, getMonoRate } = require("./getrates");
const { saveNewPricelist, deletePricelist } = require("./pricelists");

module.exports = {
    getDuoRates,
    getDuoRate,
    getMonoRates,
    getMonoRate,
    saveNewPricelist,
    deletePricelist
}
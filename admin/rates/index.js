const { getDuoRates, getDuoRate, getMonoRates, getMonoRate } = require("./getrates");
const { saveNewPricelist} = require("./pricelists");

module.exports = {
    getDuoRates,
    getDuoRate,
    getMonoRates,
    getMonoRate,
    saveNewPricelist
}
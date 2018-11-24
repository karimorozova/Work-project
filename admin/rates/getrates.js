const  { Duorate } = require("../models");

async function getDuoRates(obj) {
    const rates = await Duorate.find(obj)
        .populate("source")
        .populate("target")
        .populate("industries.industry");
    return rates;
}

module.exports = { getDuoRates }
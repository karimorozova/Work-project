const  { Duorate } = require("../models");

async function getDuoRates(obj) {
    const rates = await Duorate.find(obj)
        .populate("source")
        .populate("target")
        .populate("industries.industry");
    return rates;
}

async function getDuoRate(obj) {
    const rate = await Duorate.findOne(obj)
        .populate("source")
        .populate("target")
        .populate("industries.industry");
    return rate;
}

module.exports = { getDuoRates, getDuoRate }
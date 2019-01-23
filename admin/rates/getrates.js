const  { Duorate, Monorate, Pricelist } = require("../models");

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

async function getMonoRates(obj) {
    const rate = await Monorate.find(obj)
        .populate("target")
        .populate("industries.industry");
    return rate;
}

async function getMonoRate(obj) {
    const rate = await Monorate.findOne(obj)
        .populate("target")
        .populate("industries.industry");
    return rate;
}

async function getPricelist(obj) {
    const pricelist = await Pricelist.findOne(obj)
        .populate("combinations.source")
        .populate("combinations.target")
        .populate("combinations.industries.industry");
    return pricelist;
}

async function getPricelists(obj) {
    const pricelist = await Pricelist.find(obj)
        .populate("combinations.source")
        .populate("combinations.target")
        .populate("combinations.industries.industry");
    return pricelist;
}

module.exports = { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist, getPricelists }
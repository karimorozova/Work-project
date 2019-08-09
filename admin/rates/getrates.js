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
        .populate("wordsRates.source")
        .populate("wordsRates.target")
        .populate("wordsRates.industries")
        .populate("hoursRates.source")
        .populate("hoursRates.target")
        .populate("hoursRates.industries")
        .populate("monoRates.target")
        .populate("monoRates.industries");
    return pricelist;
}

async function getPricelists(obj) {
    const pricelist = await Pricelist.find(obj)
        .populate("wordsRates.source")
        .populate("wordsRates.target")
        .populate("wordsRates.industries")
        .populate("hoursRates.source")
        .populate("hoursRates.target")
        .populate("hoursRates.industries")
        .populate("monoRates.target")
        .populate("monoRates.industries");
    return pricelist;
}

async function getUpdatedPricelist(query, update) {
    const pricelist = await Pricelist.findOneAndUpdate(query, update, {new: true})
        .populate("wordsRates.source")
        .populate("wordsRates.target")
        .populate("wordsRates.industries")
        .populate("hoursRates.source")
        .populate("hoursRates.target")
        .populate("hoursRates.industries")
        .populate("monoRates.target")
        .populate("monoRates.industries");
    return pricelist;
}

module.exports = { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist, getPricelists, getUpdatedPricelist }
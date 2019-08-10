const  { Pricelist } = require("../models");

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

module.exports = { getPricelist, getPricelists, getUpdatedPricelist }
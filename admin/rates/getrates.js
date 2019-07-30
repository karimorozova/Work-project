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
        .populate("duoRates.source")
        .populate("duoRates.target")
        .populate("duoRates.industries.industry")
        .populate("monoRates.target")
        .populate("monoRates.industries.industry");
    return pricelist;
}

async function getPricelists(obj) {
    const pricelist = await Pricelist.find(obj)
        .populate("duoRates.source")
        .populate("duoRates.target")
        .populate("duoRates.industries")
        .populate("monoRates.target")
        .populate("monoRates.industries");
    return pricelist;
}

function parseIndustries(rate, serviceIds, form) {
    let rates = []
    for(let elem of rate.industries) {
        const allServRates = includeAllServices(elem.rates, serviceIds);
        let industry = {...elem.industry._doc, _id: elem.industry._id};
        industry.rates = {...allServRates};
        if(form === "Duo") {
            rates.push({
                id: rate.id,
                ratesId: elem._id,
                sourceLanguage: rate.source,
                targetLanguage: rate.target,
                industry: industry,
                check: false
            })
        } else {
            rates.push({
                id: rate.id,
                ratesId: elem._id,
                targetLanguage: rate.target,
                package: rate.package,
                industry: industry,
                check: false
            })
        }
    }
    return rates;
}

function includeAllServices(elemRates, serviceIds) {
    let rates = {};
    for(let id of serviceIds) {
        if(Object.keys(elemRates).indexOf(id) !== -1) {
            rates[id] = elemRates[id];
        } else {
            rates[id] = {value: 0, active: false};
        }
    }
    return rates;
}

module.exports = { getDuoRates, getDuoRate, getMonoRates, getMonoRate, getPricelist, getPricelists, parseIndustries }
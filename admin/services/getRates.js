const { Duorate, Services } = require("../models");
const { getDuoRates } = require("../rates");

async function getAllDuoRates() {
    try {
        const duoRates = await getDuoRates({});
        const duoServices = await Services.find({languageForm: "Duo"}, {"_id": 1});
        const serviceIds = duoServices.map(item => item.id);
        let fullInfo = [];
        for(let rate of duoRates) {
            fullInfo.push(...parseIndustries(rate, serviceIds));    
        }
        return fullInfo;
    } catch(err) {
        console.log("from function getDuoRates " + err);   
    }
}

function parseIndustries(rate, serviceIds) {
    let rates = []
    for(let elem of rate.industries) {
        const allServRates = includeAllServices(elem.rates, serviceIds);
        let industry = {...elem.industry._doc, _id: elem.industry._id};
        industry.rates = {...allServRates};
        rates.push({
            id: elem._id,
            sourceLanguage: rate.source,
            targetLanguage: rate.target,
            industry: industry
        })
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

module.exports = { getAllDuoRates }
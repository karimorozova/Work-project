const { Services } = require("../models");

async function includeAllIndustries(industries, entityIndustries, languageForm) {
    try {
        const allIndustries = await defaultRates(entityIndustries, languageForm);
        let updatedIndustries = [];
        for(let elem of allIndustries) {
            const index = industries.findIndex(item => {
                item._id === elem.id || (item.industry && item.industry.id === elem.id)
                || item.name === "All"
            });
            if(index !== -1) {
                updatedIndustries.push({
                    'industry': elem.id,
                    'rates': industries[index].rates
                })
            } else {
                updatedIndustries.push({
                    'industry': elem.id,
                    'rates': elem.rates
                })
            }
        }
        return updatedIndustries;
    } catch(err) {
        console.log(err);
        console.log("Error in includeAllIndustries");
    }
}

async function defaultRates(entityIndustries, languageForm) {
    const industries = [...entityIndustries];
    try {
        const services = await Services.find({"languageForm": languageForm});
        const serviceRate = {value: 0, active: false};
        const rates = services.reduce((init, cur) => {
            const key = cur.id;
            init[key] = {...serviceRate};
            return {...init};
        }, {});
        for(let industry of industries) {
            industry["rates"] = {...rates};
        }
        return industries;
    } catch(err) {
        console.log(err);
        console.log("Error in defaultRates");
    }
}

async function getAllUpdatedIndustries(industries, entityIndustries, languageForm) {
    let updatedIndustries = [];
    try {
        const allIndustries = await includeAllIndustries(industries, entityIndustries, languageForm);
        if(industries[0].name === "All") {
            updatedIndustries = updateRatesForAll(allIndustries, industries[0].rates);
        } else {
            updatedIndustries = updateRates(industries, allIndustries); 
        }
        return updatedIndustries;
    } catch(err) {
        console.log(err);
        console.log("Error in getAllUpdatedIndustries");
    }
}

function updateRatesForAll(allIndustries, rates) {
    return allIndustries.map(item => {
      return  {...item, rates}
    })
}

function updateRates(industries, allIndustries) {
    let updatedIndustries = [...allIndustries];
    for(let industry of updatedIndustries) {
        const index = industries.findIndex(item => item._id === industry.industry);
        if(index !== -1) {
            industry.rates = industries[index].rates;
        }
    }
    return updatedIndustries;
}

function getAfterDeleteRates({industries, servicesIds, combinations, id}) {
    const industriesIds = industries.map(item => item._id);
    const updatedCombinations = [...combinations];
    const rateIndex = updatedCombinations.findIndex(item => item.id === id);
    for(let elem of updatedCombinations[rateIndex].industries) {
        if(industries[0].name === "All" || industriesIds.indexOf(elem.industry.id) !== -1) {
            elem.rates = getDeletedRates(elem, servicesIds);
        }
    }
    if(isAllRatesDeleted(updatedCombinations[rateIndex].industries)) {
        updatedCombinations.splice(rateIndex, 1);
    }
    return updatedCombinations;
}

function getDeletedRates(industry, servicesIds) {
    const { rates } = industry;
    for(let id of servicesIds) {
        rates[id].value = 0;
        rates[id].active = false;
    }
    return rates;
}

function isAllRatesDeleted(industries) {
    let sum = 0;
    for(let elem of industries) {
      sum += Object.keys(elem.rates).reduce((init, cur) => {
        return init + elem.rates[cur].value;
      }, 0)
    }
    return sum === 0
}

module.exports = { includeAllIndustries, defaultRates, getAllUpdatedIndustries, getAfterDeleteRates }
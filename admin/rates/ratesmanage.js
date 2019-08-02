const { Pricelist, Step, Industries } = require("../models");
const { getUpdatedPricelist } = require("./getrates");

async function getAfterRatesSaved(rateInfo, pricelist) {
    const { prop, _id, packageSize, industries, target, rates } = rateInfo;
    try {
        let updatedRates = [];
        if(_id) {
            updatedRates = await manageExistingRate({
                _id, packageSize, industries, target, rates, priceRates: pricelist[prop]
            });
        } else {
            updatedRates = await addNewRate({
                packageSize, industries, target, rates, priceRates: pricelist[prop]
            });
        }
        return await getUpdatedPricelist({"_id": pricelist.id}, {[prop]: updatedRates});
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterRatesSaved");
    }
}

async function manageExistingRate({_id, packageSize, industries, target, rates, priceRates}) {
    try {
        if(industries[0].name === 'All') {
            const allIndustries = await Industries.find();
            const changingPair = priceRates.find(item => item.id === _id);
            let updatedRates = priceRates.filter(item => {
                if(item.target.lang === target.lang && item.packageSize === packageSize) return false;
                return true;
            });
            updatedRates.push({...changingPair._doc, industries: allIndustries, rates});
            return updatedRates;
        } else {
            return manageNotAllIndustriesrate({_id, packageSize, industries, target, rates, priceRates})
        }
    } catch(err) {
        console.log(err);
        console.log("Error in manageExistingRate");
    }
}

function manageNotAllIndustriesrate({_id, packageSize, industries, target, rates, priceRates}) {
    const industriesIds = industries.map(item => item._id);
    let updatedRates = [...priceRates];
    let samePairIndex = updatedRates.findIndex(item => {
        return item.packageSize === packageSize && target.lang === item.target.lang
            && areEqual(item.rates, rates)
    })
    if(samePairIndex !== -1) {
        for(let industry of industries) {
            const industryIndex = updatedRates[samePairIndex].industries.findIndex(item => item.id === industry._id);
            if(industryIndex === -1) {
                updatedRates[samePairIndex].industries.push(industry);
            }
        }
    } else {
        updatedRates.push({target, packageSize, industries, rates});  
    }
    updatedRates = updatedRates.map(item => {
        if(item.id === _id) {
            item.industries = filterIndustries(item.industries, industriesIds);
        }
        return item;
    })
    return updatedRates.filter(item => item.industries.length);
}

function filterIndustries(itemIndustries, industriesIds) {
    return itemIndustries.filter(item => {
        return industriesIds.indexOf(item.id) === -1;
    })
}

function areEqual(itemRates, rates) {
    for(let key in itemRates) {
        if(JSON.stringify(itemRates[key]) !== JSON.stringify(rates[key])) {
            return false
        }
    }
    return true;
}

async function includeAllIndustries(industries, entityIndustries, languageForm) {
    try {
        const allIndustries = await defaultRates(entityIndustries, languageForm);
        let updatedIndustries = [];
        for(let elem of allIndustries) {
            const index = industries.findIndex(item => {
                return item._id === elem.id || (item.industry && item.industry.id === elem.id)
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
    let industries = [...entityIndustries];
    try {
        const services = await Services.find({"languageForm": languageForm});
        const serviceRate = {value: 0, active: false};
        const rates = services.reduce((prev, cur) => {
            const key = cur.id;
            prev[key] = {...serviceRate};
            return {...prev};
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

function updateCombIndustries(combIndustries, industries) {
    let updatedIndustries = [...combIndustries];
    for(let industry of industries) {
        let industryId = industry._id || industry.industry.id;
        const rateIndex = updatedIndustries.findIndex(item => {
            return item.industry.id === industryId || item.industry === industryId}
        );
        if(rateIndex !== -1) {
            updatedIndustries[rateIndex].rates = industry.rates;
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
      sum += Object.keys(elem.rates).reduce((prev, cur) => {
        return prev + elem.rates[cur].value;
      }, 0)
    }
    return sum === 0
}

module.exports = { getAfterRatesSaved, includeAllIndustries, defaultRates, getAllUpdatedIndustries, getAfterDeleteRates, updateCombIndustries }
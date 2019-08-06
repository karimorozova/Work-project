const { Pricelist, Step, Industries } = require("../models");
const { getUpdatedPricelist, getPricelist } = require("./getrates");

async function getAfterRatesSaved(rateInfo, pricelist) {
    const { prop, packageSize, industries, target, rates } = rateInfo;
    try {
        let updatedRates = await managePairRates({
                packageSize, industries, target, rates, priceRates: pricelist[prop]
            });
        return await getUpdatedPricelist({"_id": pricelist.id}, {[prop]: updatedRates});
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterRatesSaved");
    }
}

async function managePairRates({packageSize, industries, target, rates, priceRates}) {
    try {
        const allIndustries = await Industries.find();
        if(industries[0].name === 'All') {
            if(!priceRates.length) {
                return [{packageSize, industries: allIndustries, target, rates}]
            }
            let updatedRates = priceRates.filter(item => {
                if(item.target.lang === target.lang && item.packageSize === packageSize) return false;
                return true;
            });
            updatedRates.push({target, packageSize, industries: allIndustries, rates});
            return updatedRates;
        } else {
            if(!priceRates.length) {
                return [{packageSize, industries, target, rates}]
            }
            return manageNotAllIndustriesrate({packageSize, industries, target, rates, priceRates})
        }
    } catch(err) {
        console.log(err);
        console.log("Error in managePairRates");
    }
}

function manageNotAllIndustriesrate({packageSize, industries, target, rates, priceRates}) {
    const industriesIds = industries.map(item => item._id);
    let updatedRates = priceRates.filter(item => {
        if(item.target.lang === target.lang && item.packageSize === packageSize) return false;
        return true;
    });
    let samePairs = priceRates.filter(item => item.packageSize === packageSize && target.lang === item.target.lang);
    if(samePairs.length) {
        updatedRates.push(...manageSamePairs({samePairs, rates, industriesIds}));
    } else {
        updatedRates.push({target, packageSize, industries, rates});  
    }
    return updatedRates.filter(item => item.industries.length);
}

function manageSamePairs({samePairs, rates, industriesIds}) {
    let sameRateIndex = samePairs.findIndex(item => areEqual(item.rates, rates));
    let managedRates = samePairs.map((item, index) => {
        let industries = [];
        if(sameRateIndex === index) {
            industries = item.industries.map(industry => industry.id);
            industries.push(industriesIds);
            industries = industries.filter((value, index, self) => self.indexOf(value) === index);    
        } else {
            industries = item.industries.filter(industry => industriesIds.indexOf(industry.id) === -1);
        }
        item.industries = industries;
        return item;
    })
    if(sameRateIndex === -1) {
        managedRates.push({
            target: samePairs[0].target,
            packageSize: samePairs[0].packageSize,
            industries: industriesIds,
            rates
        })
    }
    return managedRates;
}

function areEqual(itemRates, rates) {
    for(let key in itemRates) {
        if(JSON.stringify(itemRates[key]) !== JSON.stringify(rates[key])) {
            return false
        }
    }
    return true;
}

async function getAfterAddSeveralMono(priceId, ratesData) {
    let { copyRates, industries, stepsIds, packages, targets } = ratesData;
    if(industries[0] === 'All') {
        industries = [{name: 'All'}]
    }
    const targetsIds = targets.map(item => item._id);
    const allAvailablePairs = copyRates.filter(item => packages.indexOf(item.packageSize) !== -1 && targetsIds.indexOf(item.target._id)!== -1);
    try {
        const price = await getPricelist({"_id": priceId});
        let monoRates = price.monoRates.length ? [...price.monoRates] : [];
        for(let pair of allAvailablePairs) {
            let copiedRates = getRatesToCopy(pair.rates, stepsIds);
            const { packageSize, target } = pair;
            monoRates = await managePairRates({
                packageSize, industries, target, rates: copiedRates, priceRates: monoRates
            });
        }
        return await getUpdatedPricelist({"_id": priceId}, { monoRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterAddSeveralMono");
    }
}

function getRatesToCopy(pairRates, stepsIds) {
    return Object.keys(pairRates).reduce((prev, cur) => {
        if(stepsIds.indexOf(cur) !== -1) {
            prev[cur] = pairRates[cur]
        } else {
            prev[cur] = {value: 0, min: 5, active: false}
        }
        return {...prev}
    }, {})
}

/////////////////////////////////////////////
// Old version of logic and functionality //
////////////////////////////////////////////
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

module.exports = { getAfterRatesSaved, getAfterAddSeveralMono, includeAllIndustries, defaultRates, getAllUpdatedIndustries, getAfterDeleteRates, updateCombIndustries }
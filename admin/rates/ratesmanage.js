const { Industries, Step, Languages } = require("../models");
const { getUpdatedPricelist, getPricelist } = require("./getPrices");

async function getAfterRatesSaved(rateInfo, pricelist) {
    const { stepsIds, prop, packageSize, industries, source, target, rates } = rateInfo;
    try {
        let updatedRates = [];
        if(prop === 'monoRates') {
            updatedRates = await manageMonoPairRates({
                stepsIds, packageSize, industries, target, rates, currentRates: pricelist[prop]
            });
        } else {
            updatedRates = await manageDuoPairRates({
                stepsIds, source, target, industries, rates, currentRates: pricelist[prop]
            });
        }
        return await getUpdatedPricelist({"_id": pricelist.id}, {[prop]: updatedRates});
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterRatesSaved");
    }
}

async function getAfterRatesImported({priceId, ratesData, prop}) {
    try {
        if(prop === 'monoRates') {
            return await getAfterImportMono(priceId, ratesData);
        }
        return await getAfterImportDuo({priceId, ratesData, prop});
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterRatesImported");
    }
}

/////// Mono rates managing start ///////

async function manageMonoPairRates({stepsIds, packageSize, industries, target, rates, currentRates, entity}) {
    try {
        const allIndustries = entity ? entity.industries : await Industries.find();
        if(industries[0].name === 'All') {
            if(!currentRates.length) {
                return [{packageSize, industries: allIndustries, target, rates}]
            }
            let updatedRates = currentRates.filter(item => {
                if(item.target.lang === target.lang && item.packageSize === packageSize) return false;
                return true;
            });
            updatedRates.push(...manageMonoAllIndustriesRates({stepsIds, target, packageSize, allIndustries, rates, currentRates}));
            return updatedRates;
        } else {
            if(!currentRates.length) {
                return [{packageSize, industries, target, rates}]
            }
            return manageMonoNotAllIndustriesRate({stepsIds, packageSize, industries, target, rates, currentRates})
        }
    } catch(err) {
        console.log(err);
        console.log("Error in manageMonoPairRates");
    }
}

function manageMonoAllIndustriesRates({stepsIds, target, packageSize, allIndustries, rates, currentRates}) {
    let samePairs = currentRates.filter(item => item.target.lang === target.lang && item.packageSize === packageSize);
    if(!samePairs.length) {
        return [{target, packageSize, industries: allIndustries, rates}]
    }
    let industries = allIndustries.map(item => {
        return {...item._doc, _id: item.id}
    })
    return manageSamePairs({samePairs, rates, stepsIds, industries});
}

function manageMonoNotAllIndustriesRate({stepsIds, packageSize, industries, target, rates, currentRates}) {
    let updatedRates = currentRates.filter(item => {
        if(item.target.lang === target.lang && item.packageSize === packageSize) return false;
        return true;
    });
    let samePairs = currentRates.filter(item => item.packageSize === packageSize && target.lang === item.target.lang);
    if(samePairs.length) {
        updatedRates.push(...manageSamePairs({stepsIds, samePairs, rates, industries}));
    } else {
        updatedRates.push({target, packageSize, industries, rates});  
    }
    return updatedRates.filter(item => item.industries.length);
}

async function getAfterImportMono(priceId, ratesData) {
    let { copyRates, industries, stepsIds, packages, targets } = ratesData;
    const isAllIndustries = industries[0] === 'All'
    try {
        if(isAllIndustries) {
            industries = await Industries.find();
        }
        const targetsIds = targets.map(item => item._id);
        const allAvailablePairs = copyRates.filter(item => packages.indexOf(item.packageSize) !== -1 && targetsIds.indexOf(item.target._id)!== -1);
        const price = await getPricelist({"_id": priceId});
        let monoRates = price.monoRates.length ? [...price.monoRates] : [];
        if(!monoRates.length) {
            monoRates = fillEmptyRates({allAvailablePairs, stepsIds, industries});
        } else {
            monoRates = fillNonEmptyMonoRates({allAvailablePairs, stepsIds, industries, monoRates, isAllIndustries});
        }
        return await getUpdatedPricelist({"_id": priceId}, { monoRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterImportMono");
    }
}

function fillNonEmptyMonoRates({allAvailablePairs, stepsIds, industries, monoRates, isAllIndustries}) {
    let currentRates = [...monoRates];
    let filledRates = [];
    for(let pair of allAvailablePairs) {
        let copiedRates = getRatesToCopy(pair.rates, stepsIds);
        const { packageSize, target } = pair;
        filledRates = [];
        if(isAllIndustries) {
            filledRates = currentRates.filter(item => {
                if(item.target.lang === target.lang && item.packageSize === packageSize) return false;
                return true;
            });
            filledRates.push(...manageMonoAllIndustriesRates({stepsIds, target, packageSize, allIndustries: industries, rates: copiedRates, currentRates}));
        } else {
            filledRates = manageMonoNotAllIndustriesRate({
                stepsIds, packageSize, industries, target, rates: copiedRates, currentRates
            })
        }
        currentRates = [...filledRates];
    }
    return currentRates;
}

/////// Mono rates managing end ///////

/////// Duo rates managing start ///////

async function manageDuoPairRates({stepsIds, source, target, industries, rates, currentRates, entity}) {
    try {
        const allIndustries = entity ? entity.industries : await Industries.find();
        if(industries[0].name === 'All') {
            if(!currentRates.length) {
                return [{source, target, industries: allIndustries, rates}]
            }
            let updatedRates = currentRates.filter(item => {
                if(item.source.lang === source.lang && item.target.lang === target.lang) return false;
                return true;
            });
            updatedRates.push(...manageDuoAllIndustriesRates({stepsIds, target, source, allIndustries, rates, currentRates}));
            return updatedRates;
        } else {
            if(!currentRates.length) {
                return [{source, target, industries, rates}]
            }
            return manageDuoNotAllIndustriesRate({stepsIds, source, target, industries, rates, currentRates})
        }
    } catch(err) {
        console.log(err);
        console.log("Error in manageDuoPairRates");
    }
}

function manageDuoAllIndustriesRates({stepsIds, target, source, allIndustries, rates, currentRates}) {
    let samePairs = currentRates.filter(item => item.target.lang === target.lang && item.source.lang === source.lang);
    if(!samePairs.length) {
        return [{target, source, industries: allIndustries, rates}]
    }
    let industries = allIndustries.map(item => {
        return {...item._doc, _id: item.id}
    })
    return manageSamePairs({samePairs, rates, stepsIds, industries});
}

function manageDuoNotAllIndustriesRate({stepsIds, source, target, industries, rates, currentRates}) {
    let updatedRates = currentRates.filter(item => {
        if(item.source.lang === source.lang && item.target.lang === target.lang) return false;
        return true;
    });
    let samePairs = currentRates.filter(item => item.source.lang === source.lang && target.lang === item.target.lang);
    if(samePairs.length) {
        updatedRates.push(...manageSamePairs({stepsIds, samePairs, rates, industries}));
    } else {
        updatedRates.push({source, target, industries, rates});  
    }
    return updatedRates.filter(item => item.industries.length);
}

async function getAfterImportDuo({priceId, ratesData, prop}) {
    let { copyRates, industries, stepsIds, sources, targets } = ratesData;
    const isAllIndustries = industries[0] === 'All'
    try {
        if(isAllIndustries) {
            industries = await Industries.find();
        }
        const sourcesIds = sources.map(item => item._id);
        const targetsIds = targets.map(item => item._id);
        const allAvailablePairs = copyRates.filter(item => sourcesIds.indexOf(item.source._id) !== -1 && targetsIds.indexOf(item.target._id)!== -1);
        const price = await getPricelist({"_id": priceId});
        let duoRates = price[prop].length ? [...price[prop]] : [];
        if(!duoRates.length) {
            duoRates = fillEmptyRates({allAvailablePairs, stepsIds, industries});
        } else {
            duoRates = fillNonEmptyDuoRates({allAvailablePairs, stepsIds, industries, duoRates, isAllIndustries});
        }
        return await getUpdatedPricelist({"_id": priceId}, { [prop]: duoRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterImportDuo");
    }
}

function fillNonEmptyDuoRates({allAvailablePairs, stepsIds, industries, duoRates, isAllIndustries}) {
    let currentRates = [...duoRates];
    let filledRates = [];
    for(let pair of allAvailablePairs) {
        let copiedRates = getRatesToCopy(pair.rates, stepsIds);
        const { source, target } = pair;
        filledRates = [];
        if(isAllIndustries) {
            filledRates = currentRates.filter(item => {
                if(item.target.lang === target.lang && item.source.lang === source.lang) return false;
                return true;
            });
            filledRates.push(...manageDuoAllIndustriesRates({stepsIds, target, source, allIndustries: industries, rates: copiedRates, currentRates}));
        } else {
            filledRates = manageDuoNotAllIndustriesRate({
                stepsIds, source, industries, target, rates: copiedRates, currentRates
            })
        }
        currentRates = [...filledRates];
    }
    return currentRates;
}

/////// Duo rates manage end ///////

/////// Clients and Vendors rates additional functions start //////

async function getRateInfoFromStepFinance({project, step, rate}) {
    const stepId = step.serviceStep._id;
    const prop = getCorrectRateProp(step.serviceStep);
    const industries = [{...project.industry._doc, _id: project.industry.id}];
    try {
        const defaultRates = await getDefaultRates(step.serviceStep.calculationUnit);
        const rates = getRatesForUpdate({defaultRates, rate, stepId});
        const {source, target} = await getPairInfoForUpdate({prop, step});
        return {source, target, prop, rates, industries, stepsIds: [stepId]};
    } catch(err) {
        console.log(err);
        console.log("Error in getRateInfoFromStepFinance");
    }
}

async function getPairInfoForUpdate({prop, step}) {
    let source = "";
    try {
        const target = await Languages.findOne({symbol: step.target});
        if(prop !== 'monoRates') {
            source = await Languages.findOne({symbol: step.source});
        }
        return {source, target}
    } catch(err) {
        console.log(err);
        console.log("Error in getPairInfoForUpdate");
    }
}

function getCorrectRateProp(serviceStep) {
    if(serviceStep.calculationUnit === 'Words') {
        return 'wordsRates';
    }
    if(serviceStep.calculationUnit === 'Hours') {
        return 'hoursRates'
    }
    return 'monoRates';
}

function getRatesForUpdate({defaultRates, rate, stepId}) {
    return Object.keys(defaultRates).reduce((acc, cur) => {
        if(cur === stepId) {
            acc[cur] = {...rate, active: true};
        } else {
            acc[cur] = defaultRates[cur];
        }
        return {...acc};
    }, {})
}

/////// Clients and Vendors rates additional functions end //////

function manageSamePairs({stepsIds, samePairs, rates, industries}) {
    let industriesIds = industries.map(item => {
        return item._id ? item._id : item
    });
    let updatedRates = [];
    for(let i = 0; i < samePairs.length; i++) {
        const pairIndustries = samePairs[i].industries.map(item => item.id);
        const changingPairIndustries = pairIndustries.filter(item => industriesIds.indexOf(item) !== -1);
        const remainingPairIndustries = pairIndustries.filter(item => industriesIds.indexOf(item) === -1);
        const newRates = getNewRates(samePairs[i].rates, rates, stepsIds);
        industriesIds = industriesIds.filter(item => pairIndustries.indexOf(item) === -1);
        const { source, target, packageSize, rates: oldRates } = samePairs[i];
        const ratePair = source ? {source, target} : {target, packageSize};
        updatedRates.push({...ratePair, rates: oldRates, industries: remainingPairIndustries});
        updatedRates.push({...ratePair, packageSize, rates: newRates, industries: changingPairIndustries});
    }
    if(industriesIds.length) {
        const { source, target, packageSize } = samePairs[0];
        const ratePair = source ? {source, target} : {target, packageSize};
        updatedRates.push({...ratePair, rates, industries: industriesIds});
    }
    updatedRates = updatedRates.filter(item => item.industries.length);
    updatedRates = joinSameRatesIndustries(updatedRates);
    return updatedRates;
}

function joinSameRatesIndustries(pairs) {
    let joinedPairs = [...pairs];
    for(let i = joinedPairs.length - 1; i >= 0; i--) {
        const remainPairs = joinedPairs.slice(0, i);
        if(remainPairs.length) {
            for(let j = 0; j < remainPairs.length; j++) {
                if(areEqual(remainPairs[j].rates, joinedPairs[i].rates)) {
                    const industries = getUniqueIndustries([...joinedPairs[i].industries, ...remainPairs[j].industries]);
                    joinedPairs[i].industries = industries;
                    if(j < i) {
                        joinedPairs.splice(j, 1);
                        i--;
                    } else {
                        joinedPairs.splice(j-1, 1);
                    }
                }
            }
        }
    }
    return joinedPairs;
}

function fillEmptyRates({allAvailablePairs, stepsIds, industries}) {
    let filledRates = [];
    for(let pair of allAvailablePairs) {
        const rates = getRatesToCopy(pair.rates, stepsIds);
        const {_id, ...newPair } = pair; 
        filledRates.push({...newPair, rates, industries})
    }
    return filledRates;
}

function getUniqueIndustries(industries) {
    return industries.filter((val, index, self) => self.indexOf(val) === index)
}

function getNewRates(oldRates, newRates, stepsIds) {
    return Object.keys(newRates).reduce((acc, cur) => {
        if(stepsIds.indexOf(cur) !== -1) {
            acc[cur] = newRates[cur];
        } else {
            acc[cur] = oldRates[cur];
        }
        return {...acc}
    }, {})
}

function areEqual(itemRates, rates) {
    for(let key in itemRates) {
        if(JSON.stringify(itemRates[key]) !== JSON.stringify(rates[key])) {
            return false
        }
    }
    return true;
}

function getRatesToCopy(pairRates, stepsIds) {
    return Object.keys(pairRates).reduce((acc, cur) => {
        if(stepsIds.indexOf(cur) !== -1) {
            acc[cur] = pairRates[cur]
        } else {
            acc[cur] = {value: 0, min: 0, active: false}
        }
        return {...acc}
    }, {})
}

async function getDefaultRates(calculationUnit) {
    try {
        const steps = await Step.find({calculationUnit});
        return steps.reduce((acc, cur) => {
            acc[cur.id] = {value: 0, min: 0, active: false};
            return {...acc};
        }, {})
    } catch(err) {
        console.log(err);
        console.log("Error in getDefaultRates");
    }
}

module.exports = { 
    getDefaultRates,
    getAfterRatesSaved, 
    getAfterRatesImported, 
    manageMonoPairRates, 
    manageDuoPairRates, 
    getRatesToCopy, 
    fillEmptyRates, 
    fillNonEmptyMonoRates, 
    fillNonEmptyDuoRates,
    getRateInfoFromStepFinance
}
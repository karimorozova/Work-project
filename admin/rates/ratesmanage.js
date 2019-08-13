const { Industries } = require("../models");
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
        return [...currentRates, {target, packageSize, industries: allIndustries, rates}]
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
            monoRates = await manageMonoPairRates({
                stepsIds, packageSize, industries, target, rates: copiedRates, currentRates: monoRates
            });
        }
        return await getUpdatedPricelist({"_id": priceId}, { monoRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterImportMono");
    }
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
        return [...currentRates, {target, source, industries: allIndustries, rates}]
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
    if(industries[0] === 'All') {
        industries = [{name: 'All'}]
    }
    const sourcesIds = sources.map(item => item._id);
    const targetsIds = targets.map(item => item._id);
    const allAvailablePairs = copyRates.filter(item => sourcesIds.indexOf(item.source._id) !== -1 && targetsIds.indexOf(item.target._id)!== -1);
    try {
        const price = await getPricelist({"_id": priceId});
        let updatedRates = price[prop].length ? [...price[prop]] : [];
        for(let pair of allAvailablePairs) {
            let copiedRates = getRatesToCopy(pair.rates, stepsIds);
            const { source, target } = pair;
            updatedRates = await manageDuoPairRates({
                stepsIds, source, industries, target, rates: copiedRates, currentRates: updatedRates
            });
        }
        return await getUpdatedPricelist({"_id": priceId}, { [prop]: updatedRates });
    } catch(err) {
        console.log(err);
        console.log("Error in getAfterImportDuo");
    }
}

/////// Duo rates manage end ///////

function updateCurrentRates({currentRates, newRates, stepsIds}) {
    return Object.keys(currentRates).reduce((acc, cur) => {
        if(stepsIds.indexOf(cur) !== -1) {
            acc[cur] = newRates[cur];
        } else {
            acc[cur] = currentRates[cur];
        }
        return {...acc}
    }, {})
}

function manageSamePairs({stepsIds, samePairs, rates, industries}) {
    let industriesIds = industries.map(item => item._id);
    let updatedRates = [];
    for(let i = 0; i < samePairs.length; i++) {
        let pairIndustries = samePairs[i].industries.map(item => item.id);
        let changingPairIndustries = pairIndustries.filter(item => industriesIds.indexOf(item) !== -1);
        let remainingPairIndustries = pairIndustries.filter(item => industriesIds.indexOf(item) === -1);
        let newRates = getNewRates(samePairs[i].rates, rates, stepsIds);
        industriesIds = industriesIds.filter(item => pairIndustries.indexOf(item) === -1);
        updatedRates.push({...samePairs[i]._doc, industries: remainingPairIndustries});
        updatedRates.push({...samePairs[i]._doc, rates: newRates, industries: changingPairIndustries});
    }
    if(industriesIds.length) {
        updatedRates.push({...samePairs[0]._doc, rates, industries: industries.map(item => item._id)})
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
            acc[cur] = {value: 0, min: 5, active: false}
        }
        return {...acc}
    }, {})
}

module.exports = { getAfterRatesSaved, getAfterRatesImported, manageMonoPairRates, manageDuoPairRates, getRatesToCopy }
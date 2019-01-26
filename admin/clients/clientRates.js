const { Clients, Services } = require("../models/");
const { getAfterUpdate, getClient } = require("./getClients");
const { getPricelist, parseIndustries, replaceRates, replaceFromPrice, includeAllIndustries, defaultRates, getAllUpdatedIndustries, getAfterDeleteRates } = require("../rates");

async function getClientRates({client, form}) {
    const combinations = form === "Duo" ? client.languageCombinations.filter(item => item.source)
    : client.languageCombinations.filter(item => !item.source);
    try {
        const ratesServices = await Services.find({languageForm: form});
        const serviceIds = ratesServices.map(item => item.id);
        let fullInfo = [];
        for(let rate of combinations) {
            fullInfo.push(...parseIndustries(rate, serviceIds, form));    
        }
        return fullInfo;
    } catch(err) {
        console.log("from function getClientRates " + err);   
    }
}

async function updateClientRates(ratesInfo) {
    const { languageForm, clientId } = ratesInfo;
    try {
        const client = await getClient({"_id": clientId});
        const result = languageForm === "Duo" ? await updateDuoRates(client, ratesInfo) : await updateMonoRates(client, ratesInfo);
        return result;
    } catch(err) {
        console.log(err);
        console.log("Error in updateClientRates");
    }
}

async function updateMonoRates(client, info) {
    const combinations = client.languageCombinations.filter(item => item.package);
    const { industries, package, targetLanguage } = info;
    try {
        const updatedIndustries = await getAllUpdatedIndustries(industries, client.industries, info.languageForm);
        const pairIndex = combinations.findIndex(item => item.target.id === info.targetLanguage._id && item.package === package);
        if(pairIndex !== -1) {
            combinations[pairIndex].industries = updatedIndustries;
        } else {
            combinations.push({
                target: targetLanguage._id,
                package,
                industries: updatedIndustries
            })
        }
        return await getAfterUpdate({"_id": client.id}, {languageCombinations: combinations});
    } catch(err) {
        console.log(err);
        console.log("Error in updateMonoRates");
    }
}

async function updateDuoRates(client, info) {
    const combinations = client.languageCombinations.filter(item => item.source);
    const { industries, sourceLanguage, targetLanguage } = info;
    try {
        const updatedIndustries = await getAllUpdatedIndustries(industries, client.industries, info.languageForm);
        const pairIndex = combinations.findIndex(item => item.source.id === info.sourceLanguage._id && item.target.id === info.targetLanguage._id);
        if(pairIndex !== -1) {
            combinations[pairIndex].industries = updatedIndustries;
        } else {
            combinations.push({
                source: sourceLanguage._id,
                target: targetLanguage._id,
                industries: updatedIndustries
            })
        }
        return await getAfterUpdate({"_id": client.id}, {languageCombinations: combinations});
    } catch(err) {
        console.log(err);
        console.log("Error in updateDuoRates");
    }
}

async function deleteRate(deleteInfo, id) {
    const {clientId, industries, servicesIds} = deleteInfo;
    try {
        const client = await getClient({"_id": clientId});
        const combinations = [...client.languageCombinations];
        const updatedCombinations = getAfterDeleteRates({industries, servicesIds, combinations, id});
        return await getAfterUpdate({"_id": clientId}, {languageCombinations: updatedCombinations});
    } catch(err) {
        console.log(err);
        console.log("Error in deleteRate");
    }
}

async function addSeveralCombinations({priceId, clientId, combinations}) {
    try {
        const pricelist = await getPricelist({"_id": priceId});
        const priceCombs = [...pricelist.combinations];
        const client = await getClient({"_id": clientId});
        let clientCombs = [...client.languageCombinations];
        let newRates = [];
        for(let comb of combinations) {
            const initRate = priceCombs.find(item => item.id === comb.id);
            const goalRateIndex = clientCombs.findIndex(item => {
                return item.source && item.source.id === comb.source._id && item.target.id === comb.target._id
            });
            if(goalRateIndex === -1) {
                const newRateIndustries = await getNewFromPrice(initRate, comb, client.industries);
                newRates.push({
                    source: comb.source, target: comb.target, industries: newRateIndustries
                });
            } else {
                clientCombs[goalRateIndex].industries = await copyFromPrice({
                    curIndustries: clientCombs[goalRateIndex].industries,
                    initRate,
                    comb,
                    clientIndustries: client.industries
                }) 
            }
        }
        return await getAfterUpdate({"_id": clientId}, {languageCombinations: [...clientCombs, ...newRates]});
    } catch(err) {
        console.log(err);
        console.log("Error in addSeveralCombinations of client");
    } 
}

async function copyFromPrice(obj) {
    const { curIndustries, initRate, clientIndustries, comb } = obj;
    const { services, industries } = comb;
    try {
        const initIndustries = [...initRate.industries];
        let currentWithAllIndustries = await includeAllIndustries(curIndustries, clientIndustries, "Duo");
    for(let industry of currentWithAllIndustries) {
        const initIndex = initIndustries.findIndex(item => item.industry.id === industry.industry);
        if(initIndex !== -1 && (industries.indexOf(industry.industry) !== -1 || industries[0] === 'All')) {
            industry.rates = replaceFromPrice({
                curRates: industry.rates, 
                initRates: initIndustries[initIndex].rates,
                services
            })
        }
    }
    return currentWithAllIndustries;
    } catch(err) {
        console.log(err);
        console.log('Error in copyFromPrice');
    }
}

async function getNewFromPrice(initRate, comb, clientIndustries) {
    const { industries, services } = comb;
    const initIndustries = [...initRate.industries];
    let newRateIndustries = [];
    try {
        let ratesWithAllIndustries = await defaultRates(clientIndustries, "Duo");
        for(let industry of ratesWithAllIndustries) {
            const initIndex = initIndustries.findIndex(item => item.industry.id === industry.id);
            if(industries.indexOf(industry.id) !== -1 || industries[0] === 'All') {
                industry.rates = replaceRates(initIndustries[initIndex].rates, services);
            }
            newRateIndustries.push({ industry: industry.id, rates: industry.rates });
        }
        return newRateIndustries;
    } catch(err) {
        console.log(err);
        console.log("Error in getNewFromPrice");
    }
}

module.exports= { getClientRates, updateClientRates, deleteRate, addSeveralCombinations };
const { getClientAfterUpdate, getClient } = require("./getClients");
const { getPricelist } = require("../rates");
const { manageMonoPairRates, manageDuoPairRates } = require("../rates/ratesmanage");

async function updateClientRates(client, rateInfo) {
    const { prop, packageSize, industries, source, target, rates } = rateInfo;
    try {
        let updatedRates = [];
        if(prop === 'monoRates') {
            updatedRates = await manageMonoPairRates({
                packageSize, industries, target, rates, priceRates: client[prop], entity: client
            });
        } else {
            updatedRates = await manageDuoPairRates({
                source, target, industries, rates, priceRates: client[prop], entity: client
            });
        }
        return await getClientAfterUpdate({"_id": client.id}, {[prop]: updatedRates});
    } catch(err) {
        console.log(err);
        console.log("Error in updateClientRates");
    }
}

async function updateMonoRates(client, info) {
    
}

async function updateDuoRates(client, info) {
    
}

async function deleteRate(deleteInfo, id) {
    // const {clientId, industries, servicesIds} = deleteInfo;
    // try {
    //     const client = await getClient({"_id": clientId});
    //     const combinations = [...client.languageCombinations];
    //     const updatedCombinations = getAfterDeleteRates({industries, servicesIds, combinations, id});
    //     return await getClientAfterUpdate({"_id": clientId}, {languageCombinations: updatedCombinations});
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in deleteRate");
    // }
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
        return await getClientAfterUpdate({"_id": clientId}, {languageCombinations: [...clientCombs, ...newRates]});
    } catch(err) {
        console.log(err);
        console.log("Error in addSeveralCombinations of client");
    } 
}

async function copyFromPrice(obj) {
    
}

async function getNewFromPrice(initRate, comb, clientIndustries) {
    // const { industries, services } = comb;
    // const initIndustries = [...initRate.industries];
    // let newRateIndustries = [];
    // try {
    //     let ratesWithAllIndustries = await defaultRates(clientIndustries, "Duo");
    //     for(let industry of ratesWithAllIndustries) {
    //         const initIndex = initIndustries.findIndex(item => item.industry.id === industry.id);
    //         if(industries.indexOf(industry.id) !== -1 || industries[0] === 'All') {
    //             industry.rates = replaceRates(initIndustries[initIndex].rates, services);
    //         }
    //         newRateIndustries.push({ industry: industry.id, rates: industry.rates });
    //     }
    //     return newRateIndustries;
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in getNewFromPrice");
    // }
}

async function getClientAfterCombinationsUpdated({project, step, rate}) {
    const stepTask = project.tasks.find(item => item.taskId === step.taskId);
    const rateService = stepTask.service;
    const rateIndustry = project.industry.id;
    try {
        const client = await getClient({"_id": project.customer.id});
        let { languageCombinations } = client;
        const existingCombIndex = languageCombinations.findIndex(item => item.source && item.source.symbol === step.source && item.target.symbol === step.target);
        if(existingCombIndex !== -1) {
            languageCombinations[existingCombIndex].industries = getUpdateIndustriesForComb({
                industries: languageCombinations[existingCombIndex].industries,
                rateService, rateIndustry, rate
            })
            return await getClientAfterUpdate({"_id": client.id},{ languageCombinations })
        }
        return addNewCombination({id: client.id, languageCombinations, rateService, rateIndustry, rate});
    } catch(err) {
        console.log(err);
        console.log("Error in getClientAfterCombinationsUpdated");
    }
}

async function addNewCombination({id, languageCombinations, rateService, rateIndustry, rate}) {
    // try {
    //     const allIndustriesWithRates = await defaultRates(clientIndustries, "Duo");
    //     const combinationsIndustries = allIndustriesWithRates.map(item => {
    //         return {
    //             industry: item,
    //             rates: item.rates
    //         }
    //     })
    //     const industries = getUpdateIndustriesForComb({industries: combinationsIndustries, rateIndustry, rateService, rate});
    //     const updatedCombinations = [...languageCombinations, {source, target, industries}];
    //     return await getClientAfterUpdate({"_id": id},{ languageCombinations: updatedCombinations });
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in addNewCombination");
    // }
}

function getUpdateIndustriesForComb({industries, rateIndustry, rateService, rate}) {
    return industries.map(item => {
        if(item.industry.id === rateIndustry) {
            item.rates[rateService].value = rate;
            item.rates[rateService].active = true;
        }
        return item;
    })
}

module.exports= { updateClientRates, deleteRate, addSeveralCombinations, getClientAfterCombinationsUpdated };
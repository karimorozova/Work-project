const { getAfterUpdate, getClient } = require("./getClients");
const { getPricelist } = require("../rates");

async function getClientRates({client, form}) {
    
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
    // const combinations = client.languageCombinations;
    // const { industries, package, targetLanguage } = info;
    // try {
    //     const allUpdatedIndustries = await getAllUpdatedIndustries(industries, client.industries, info.languageForm);
    //     const pairIndex = combinations.findIndex(item => item.package && item.target.id === info.targetLanguage._id && item.package === package);
    //     if(pairIndex !== -1) {
    //         const combIndustriesWithAll = await getAllUpdatedIndustries(combinations[pairIndex].industries, client.industries, info.languageForm);
    //         combinations[pairIndex].industries = updateCombIndustries(combIndustriesWithAll, industries);;
    //     } else {
    //         combinations.push({
    //             target: targetLanguage._id,
    //             package,
    //             industries: allUpdatedIndustries
    //         })
    //     }
    //     return await getAfterUpdate({"_id": client.id}, {languageCombinations: combinations});
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in updateMonoRates");
    // }
}

async function updateDuoRates(client, info) {
    // const combinations = client.languageCombinations;
    // const { industries, sourceLanguage, targetLanguage } = info;
    // try {
    //     const allUpdatedIndustries = await getAllUpdatedIndustries(industries, client.industries, info.languageForm);
    //     const pairIndex = combinations.findIndex(item => item.source && item.source.id === info.sourceLanguage._id && item.target.id === info.targetLanguage._id);
    //     if(pairIndex !== -1) {
    //         const combIndustriesWithAll = await getAllUpdatedIndustries(combinations[pairIndex].industries, client.industries, info.languageForm);
    //         combinations[pairIndex].industries = updateCombIndustries(combIndustriesWithAll, industries);
    //     } else {
    //         combinations.push({
    //             source: sourceLanguage._id,
    //             target: targetLanguage._id,
    //             industries: allUpdatedIndustries
    //         })
    //     }
    //     return await getAfterUpdate({"_id": client.id}, {languageCombinations: combinations});
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in updateDuoRates");
    // }
}

async function deleteRate(deleteInfo, id) {
    // const {clientId, industries, servicesIds} = deleteInfo;
    // try {
    //     const client = await getClient({"_id": clientId});
    //     const combinations = [...client.languageCombinations];
    //     const updatedCombinations = getAfterDeleteRates({industries, servicesIds, combinations, id});
    //     return await getAfterUpdate({"_id": clientId}, {languageCombinations: updatedCombinations});
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
        return await getAfterUpdate({"_id": clientId}, {languageCombinations: [...clientCombs, ...newRates]});
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
            return await getAfterUpdate({"_id": client.id},{ languageCombinations })
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
    //     return await getAfterUpdate({"_id": id},{ languageCombinations: updatedCombinations });
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

module.exports= { getClientRates, updateClientRates, deleteRate, addSeveralCombinations, getClientAfterCombinationsUpdated };
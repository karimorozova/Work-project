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

async function addSeveralCombinations({priceId, clientId, combinations}) {

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

module.exports= { updateClientRates, addSeveralCombinations, getClientAfterCombinationsUpdated };
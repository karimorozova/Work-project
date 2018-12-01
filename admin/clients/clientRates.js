const { Clients, Services } = require("../models/");
const { getAfterUpdate, getClient } = require("./getClients");

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

function parseIndustries(rate, serviceIds, form) {
    let rates = []
    for(let elem of rate.industries) {
        const allServRates = includeAllServices(elem.rates, serviceIds);
        let industry = {...elem.industry._doc, _id: elem.industry._id};
        industry.rates = {...allServRates};
        if(form === "Duo") {
            rates.push({
                id: rate.id,
                ratesId: elem._id,
                sourceLanguage: rate.source,
                targetLanguage: rate.target,
                industry: industry,
                check: false
            })
        } else {
            rates.push({
                id: rate.id,
                ratesId: elem._id,
                targetLanguage: rate.target,
                package: rate.package,
                industry: industry,
                check: false
            })
        }
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

async function updateDuoRates(client, info) {
    const combinations = client.languageCombinations.filter(item => item.source);
    const { industries, sourceLanguage, targetLanguage } = info;
    try {
        const allIndustries = await includeAllIndustries(industries, client.industries, info.languageForm);
        let updatedIndustries = [];
        if(industries[0].name === "All") {
            updatedIndustries = updateRatesForAll(allIndustries, industries[0].rates);
        } else {
            updatedIndustries = updateRates(industries, allIndustries); 
        }
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

async function includeAllIndustries(industries, clientIndustries, languageForm) {
    try {
        const allIndustries = await defaultRates(clientIndustries, languageForm);
        let updatedIndustries = [];
        for(let elem of allIndustries) {
            const index = industries.findIndex(item => item._id === elem.id);
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

async function defaultRates(clientIndustries, languageForm) {
    const industries = [...clientIndustries];
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

async function addClientsSeveralLangs({clientId, comb, clientCombinations, industry}) {
    let industries = comb.industry[0].name === "All" ? addAllIndustries(comb.industry[0], industry) : comb.industry;
    let langPairExist = false;
    let updatedCombinations = [...clientCombinations];
    for(let clientComb of updatedCombinations) {
        if(comb.source._id === clientComb.source.id && comb.target._id === clientComb.target.id
            && comb.service._id === clientComb.service.id) {
            clientComb.industry = updateCombination(industries, clientComb.industry);
            langPairExist = true;
        }
    }
    if(!langPairExist) {
        industries = industries.map(item => {
            return {industry: item._id, rate: item.rate, active: item.active}
        })
        updatedCombinations.push({...comb, industry: industries});
        await Clients.updateOne({"_id": clientId}, {$push: {languageCombinations: {...comb, industry: industries}}})
    } else {
        await Clients.updateOne({"_id": clientId}, {$set: {languageCombinations: updatedCombinations}})
    }
}

function addAllIndustries(combIndustry, clientIndustry) {
    let industries = [];
    for(let indus of clientIndustry) {
        industries.push({
            ...indus._doc,
            id: indus.id,
            rate: combIndustry.rate
        })
    }
    return industries
}

function updateCombination(combIndustries, clientIndustries) {
    let updatedIndustries = [...clientIndustries];
    for(let indus of combIndustries) {
        let industryExist = false;
        for(let ind of updatedIndustries) {
            if(ind.industry.id === indus._id) {
                ind.rate = indus.rate;
                industryExist = true;
            }
        }
        if(!industryExist) {
            updatedIndustries.push(indus);
        }
    }
    return updatedIndustries;
}

module.exports= { getClientRates, updateClientRates, deleteRate, addClientsSeveralLangs };
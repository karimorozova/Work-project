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

async function checkRatesMatch(client, industries, rate) {
    if(rate.form === "Mono") {
        return await checkMonoRatesMatches(client, industries, rate);
    }
    let exist = false;
    if(client.languageCombinations.length) {
        for(let comb of client.languageCombinations) {
        if(comb.service.title == rate.service.title && comb.source.lang == rate.sourceLanguage.lang &&
            comb.target.lang == rate.targetLanguage.lang) {
                for(let ind of comb.industry) {
                    for(let indus of rate.industry) {
                        if(ind.industry.id == indus._id || indus.name == "All") {
                            comb.industry = industries;
                        }
                    }
                }
                exist = true;
            }
            if(exist) {
                break
            }
        }
    }
    if(!exist || !client.languageCombinations.length) {
        client.languageCombinations.push({
            source: rate.sourceLanguage._id,
            target: rate.targetLanguage._id,
            service: rate.service._id,
            industry: industries,
        })
    }
    const result = await getAfterUpdate({"_id": client.id}, {$set: {languageCombinations: client.languageCombinations}});
    return result;
}

async function checkMonoRatesMatches(client, industries, rate) {
    let exist = false;
    if(client.languageCombinations.length) {
        for(let elem of rate.industry) {
        for(let comb of client.languageCombinations) {
            if(rate.targetLanguage._id == comb.target.id && !comb.source) {
            exist = true;
            for(let indus of comb.industry) {
                if(elem._id == indus.industry.id || elem.name == 'All') {
                    indus.rate = elem.rate
                    indus.active = elem.active;
                    indus.package = elem.package
                }
            }
            }
        }
        if(exist) {
            break;
        }
        }
    }
    if(!exist || !client.languageCombinations.length) {
        client.languageCombinations.push({
            target: rate.targetLanguage._id,
            service: rate.service._id,
            industry: industries,
        })
    }
    const result = await Clients.updateOne({"_id": client.id}, {'languageCombinations': client.languageCombinations});
    return result;
}

async function deleteRate(client, industry, id) {
    let allZero = [];
    const combIndex = client.languageCombinations.findIndex(item => {
        return item.id === id;
    })
    let combination = {...client.languageCombinations[combIndex]._doc};
    for(let indus of combination.industry) {
        for(let ind of industry) {
            if(ind._id === indus.industry.id) {
                indus.rate = 0;
                indus.industry.active = false;
            }
        }
        allZero.push(indus.rate);
    }
    client.languageCombinations.splice(combIndex, 1, combination);
    const sum = allZero.reduce((init, cur) => {return init + cur}, 0);
    const updatedCombinations = sum ? client.languageCombinations
     : client.languageCombinations.filter(item => { return item.id !== id});
    const result = await getAfterUpdate({"_id": client.id}, {$set: {languageCombinations: updatedCombinations}});
    return result;
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

module.exports= { getClientRates, updateClientRates, checkRatesMatch, deleteRate, addClientsSeveralLangs };
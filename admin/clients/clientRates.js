const { Clients, Services, Pricelist } = require("../models/");
const { getAfterUpdate, getClient } = require("./getClients");
const { getPricelist } = require("../rates");

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

async function getAllUpdatedIndustries(industries, clientIndustries, languageForm) {
    let updatedIndustries = [];
    try {
        const allIndustries = await includeAllIndustries(industries, clientIndustries, languageForm);
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

async function includeAllIndustries(industries, clientIndustries, languageForm) {
    try {
        const allIndustries = await defaultRates(clientIndustries, languageForm);
        let updatedIndustries = [];
        for(let elem of allIndustries) {
            const index = industries.findIndex(item => {
                 return item._id === elem.id || item.industry.id === elem.id
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
        console.log("Error in updateClientCombinations");
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

function replaceFromPrice({ curRates, initRates, services }) {
    const copiedRates = Object.keys(curRates).reduce((init, curKey) => {
        if(services.indexOf(curKey) !== -1) {
            init[curKey] = {...initRates[curKey]}
        } else {
            init[curKey] = {...curRates[curKey]}
        }
        return {...init};
    }, {})
    return copiedRates;
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
                industry.rates = raplaceRates(initIndustries[initIndex].rates, services);
            }
            newRateIndustries.push({ industry: industry.id, rates: industry.rates });
        }
        return newRateIndustries;
    } catch(err) {
        console.log(err);
        console.log("Error in getNewFromPrice");
    }
}

function raplaceRates(industryRates, services) {
    let rates = Object.keys(industryRates).reduce((init, curKey) => {
        if(services.indexOf(curKey) !== -1) {
            init[curKey] = {...industryRates[curKey]};
        } else {
            init[curKey] = {value: 0, active: false};
        }
        return {...init}
    }, {})
    return rates;
}

module.exports= { getClientRates, updateClientRates, deleteRate, addSeveralCombinations };
const { Vendors, Services } = require("../../models/");
const { getVendor } = require("./getVendors");

async function getVendorRates({vendor, form}) {
    const combinations = form === "Duo" ? vendor.languageCombinations.filter(item => item.source)
    : vendor.languageCombinations.filter(item => !item.source);
    try {
        const ratesServices = await Services.find({languageForm: form});
        const serviceIds = ratesServices.map(item => item.id);
        let fullInfo = [];
        for(let rate of combinations) {
            fullInfo.push(...parseIndustries(rate, serviceIds, form));    
        }
        return fullInfo;
    } catch(err) {
        console.log("from function getVendorRates " + err);   
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

async function updateVendorRates(ratesInfo) {
    const { languageForm, vendorId } = ratesInfo;
    try {
        const vendor = await getVendor({"_id": vendorId});
        const result = languageForm === "Duo" ? await updateDuoRates(vendor, ratesInfo) : await updateMonoRates(vendor, ratesInfo);
        return result;
    } catch(err) {
        console.log(err);
        console.log("Error in updateVendorRates");
    }
}

async function updateMonoRates(vendor, info) {
    const combinations = vendor.languageCombinations.filter(item => item.package);
    const { industries, package, targetLanguage } = info;
    try {
        const updatedIndustries = await getAllUpdatedIndustries(industries, vendor.industries, info.languageForm);
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
        return await getAfterUpdate({"_id": vendor.id}, {languageCombinations: combinations});
    } catch(err) {
        console.log(err);
        console.log("Error in updateMonoRates");
    }
}

async function updateDuoRates(vendor, info) {
    const combinations = vendor.languageCombinations.filter(item => item.source);
    const { industries, sourceLanguage, targetLanguage } = info;
    try {
        const updatedIndustries = await getAllUpdatedIndustries(industries, vendor.industries, info.languageForm);
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
        return await getAfterUpdate({"_id": vendor.id}, {languageCombinations: combinations});
    } catch(err) {
        console.log(err);
        console.log("Error in updateDuoRates");
    }
}

async function getAllUpdatedIndustries(industries, vendorIndustries, languageForm) {
    let updatedIndustries = [];
    try {
        const allIndustries = await includeAllIndustries(industries, vendorIndustries, languageForm);
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

async function includeAllIndustries(industries, vendorIndustries, languageForm) {
    try {
        const allIndustries = await defaultRates(vendorIndustries, languageForm);
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

async function defaultRates(vendorIndustries, languageForm) {
    const industries = [...vendorIndustries];
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

function deletePair({ langPairs, combination}) {
    const { source, target } = combination;
    let pairIndex = langPairs.findIndex(item => item.source.id === source.id && item.target.id === target.id);
    const pairs = [...langPairs];
    pairs.splice(pairIndex, 1);
    return pairs;
}



async function deleteRate(vendor, industry, id) {
    let allZero = [];
    const combIndex = vendor.languageCombinations.findIndex(item => {
        return item.id === id;
    })
    let combination = {...vendor.languageCombinations[combIndex]._doc};
    for(let indus of combination.industry) {
        for(let ind of industry) {
            if(ind._id === indus.industry.id) {
                indus.rate = 0;
                indus.industry.active = false;
            }
        }
        allZero.push(indus.rate);
    }
    vendor.languageCombinations.splice(combIndex, 1, combination);
    const sum = allZero.reduce((init, cur) => {return init + cur}, 0);
    const updatedCombinations = sum ? vendor.languageCombinations
     : vendor.languageCombinations.filter(item => { return item.id !== id});
    const updatetLangPairs = sum ? vendor.languagePairs : deletePair({langPairs: vendor.languagePairs, combination});
    const result = await Vendors.updateOne({"_id": vendor.id}, {$set: {languageCombinations: updatedCombinations, languagePairs: updatetLangPairs}});
    return result;
}

async function addVendorsSeveralLangs({vendorId, comb, vendorCombinations, industry}) {
    let industries = comb.industry[0].name === "All" ? addAllIndustries(comb.industry[0], industry) : comb.industry;
    let isExist = false;
    let updatedCombinations = [...vendorCombinations];
    for(let vendorComb of updatedCombinations) {
        if(comb.source._id === vendorComb.source.id && comb.target._id === vendorComb.target.id
            && comb.service._id === vendorComb.service.id) {
            vendorComb.industry = updateCombination(industries, vendorComb.industry);
            isExist = true;
        }
    }
    if(!isExist) {
        industries = industries.map(item => {
            return {industry: item._id, rate: item.rate, active: item.active}
        })
        const vendor = await getVendor({"_id": vendorId});
        let updatedLanguagePairs = getUpdatedLangPairs({source: comb.source, target: comb.target, langPairs: vendor.languagePairs});
        await Vendors.updateOne({"_id": vendorId}, {$push: {languageCombinations: {...comb, industry: industries}}, $set: {languagePairs: updatedLanguagePairs}})
    } else {
        await Vendors.updateOne({"_id": vendorId}, {$set: {languageCombinations: updatedCombinations}})
    }
}

function addAllIndustries(combIndustry, vendorIndustry) {
    let industries = [];
    for(let indus of vendorIndustry) {
        industries.push({
            ...indus._doc,
            _id: indus.id,
            rate: combIndustry.rate
        })
    }
    return industries
}

function updateCombination(combIndustries, vendorIndustries) {
    let updatedIndustries = [...vendorIndustries];
    for(let indus of combIndustries) {
        let industryExist = false;
        for(let ind of updatedIndustries) {
            if(ind.industry.id === indus._id) {
                ind.rate = indus.rate;
                industryExist = true;
            }
        }
        if(!industryExist) {
            updatedIndustries.push({
                industry: indus._id,
                rate: indus.rate,
                active: indus.active,
            });
        }
    }
    return updatedIndustries;
}

module.exports= { getVendorRates, updateVendorRates, deleteRate, addVendorsSeveralLangs };
const { Vendors, Services } = require("../../models/");
const { getVendor, getVendorAfterUpdate } = require("./getVendors");

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
        return await getVendorAfterUpdate({"_id": vendor.id}, {languageCombinations: combinations});
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
        return await getVendorAfterUpdate({"_id": vendor.id}, {languageCombinations: combinations});
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



async function deleteRate(deleteInfo, id) {
    const {vendorId, industries, servicesIds} = deleteInfo;
    try {
        const vendor = await getVendor({"_id": vendorId});
        const combinations = [...vendor.languageCombinations];
        const updatedCombinations = getAfterDeleteRates({industries, servicesIds, combinations, id});
        return await getVendorAfterUpdate({"_id": vendorId}, {languageCombinations: updatedCombinations});
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

async function addVendorsSeveralLangs({vendorId, combinations}) {
    try {
        const vendor = await getVendor({"_id": vendorId});
        let vendorCombs = [...vendor.languageCombinations];
        for(let {source, target, industries} of combinations) {
            const updatedIndustries = await getAllUpdatedIndustries(industries, vendor.industries, "Duo");
            const rateIndex = vendorCombs.findIndex(item => item.source.id === source._id && item.target.id === target._id)
            if(rateIndex !== -1) {
                vendorCombs[rateIndex].industries = updatedIndustries;
            } else {
                vendorCombs.push({
                    source,
                    target,
                    industries: updatedIndustries
                })
            }
        }
        return getVendorAfterUpdate({"_id": vendorId}, {languageCombinations: vendorCombs});
    } catch(err) {
        console.log(err);
        console.log("Error in addVendorsSeveralLangs");
    }   
}

module.exports= { getVendorRates, updateVendorRates, deleteRate, addVendorsSeveralLangs };
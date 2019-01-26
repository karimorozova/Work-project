const { Vendors, Services } = require("../../models/");
const { getVendor, getVendorAfterUpdate } = require("./getVendors");
const { getPricelist, replaceRates, replaceFromPrice, includeAllIndustries, defaultRates, getAllUpdatedIndustries, getAfterDeleteRates } = require("../../rates");

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

async function addSeveralCombinations({priceId,vendorId, combinations}) {
    try {
        const pricelist = await getPricelist({"_id": priceId});
        const priceCombs = [...pricelist.combinations];
        const vendor = await getVendor({"_id": vendorId});
        let vendorCombs = [...vendor.languageCombinations];
        let newRates = [];
        for(let comb of combinations) {
            const initRate = priceCombs.find(item => item.id === comb.id);
            const goalRateIndex = vendorCombs.findIndex(item => {
                return item.source && item.source.id === comb.source._id && item.target.id === comb.target._id
            });
            if(goalRateIndex === -1) {
                const newRateIndustries = await getNewFromPrice(initRate, comb, vendor.industries);
                newRates.push({
                    source: comb.source, target: comb.target, industries: newRateIndustries
                });
            } else {
                vendorCombs[goalRateIndex].industries = await copyFromPrice({
                    curIndustries: vendorCombs[goalRateIndex].industries,
                    initRate,
                    comb,
                    vendorIndustries: vendor.industries
                }) 
            }
        }
        return await getVendorAfterUpdate({"_id": vendorId}, {languageCombinations: [...vendorCombs, ...newRates]});
    } catch(err) {
        console.log(err);
        console.log("Error in addSeveralCombinations of vendor");
    }   
}

async function copyFromPrice(obj) {
    const { curIndustries, initRate, vendorIndustries, comb } = obj;
    const { services, industries } = comb;
    try {
        const initIndustries = [...initRate.industries];
        let currentWithAllIndustries = await includeAllIndustries(curIndustries, vendorIndustries, "Duo");
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

async function getNewFromPrice(initRate, comb, vendorIndustries) {
    const { industries, services } = comb;
    const initIndustries = [...initRate.industries];
    let newRateIndustries = [];
    try {
        let ratesWithAllIndustries = await defaultRates(vendorIndustries, "Duo");
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

module.exports= { getVendorRates, updateVendorRates, deleteRate, addSeveralCombinations };
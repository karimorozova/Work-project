const { Services, Languages } = require("../models/");
const { getVendor, getVendorAfterUpdate } = require("./getVendors");
const { getPricelist } = require("../rates");

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
        console.log(err);
        console.log("Error in getVendorRates");   
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
    // const combinations = vendor.languageCombinations;
    // const { industries, package, targetLanguage } = info;
    // try {
    //     const allUpdatedIndustries = await getAllUpdatedIndustries(industries, vendor.industries, info.languageForm);
    //     const pairIndex = combinations.findIndex(item => item.package && item.target.id === info.targetLanguage._id && item.package === package);
    //     if(pairIndex !== -1) {
    //         const combIndustriesWithAll = await getAllUpdatedIndustries(combinations[pairIndex].industries, vendor.industries, info.languageForm);
    //         combinations[pairIndex].industries = updateCombIndustries(combIndustriesWithAll, industries);
    //     } else {
    //         combinations.push({
    //             target: targetLanguage._id,
    //             package,
    //             industries: allUpdatedIndustries
    //         })
    //     }
    //     return await getVendorAfterUpdate({"_id": vendor.id}, {languageCombinations: combinations});
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in updateMonoRates");
    // }
}

async function updateDuoRates(vendor, info) {
    // const combinations = vendor.languageCombinations;
    // const { industries, sourceLanguage, targetLanguage } = info;
    // try {
    //     const allUpdatedIndustries = await getAllUpdatedIndustries(industries, vendor.industries, info.languageForm);
    //     const pairIndex = combinations.findIndex(item => item.source && item.source.id === info.sourceLanguage._id && item.target.id === info.targetLanguage._id);
    //     if(pairIndex !== -1) {
    //         const combIndustriesWithAll = await getAllUpdatedIndustries(combinations[pairIndex].industries, vendor.industries, info.languageForm);
    //         combinations[pairIndex].industries = updateCombIndustries(combIndustriesWithAll, industries);
    //     } else {
    //         combinations.push({
    //             source: sourceLanguage._id,
    //             target: targetLanguage._id,
    //             industries: allUpdatedIndustries
    //         })
    //     }
    //     return await getVendorAfterUpdate({"_id": vendor.id}, {languageCombinations: combinations});
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in updateDuoRates");
    // }
}

async function deleteRate(deleteInfo, id) {
    // const {vendorId, industries, servicesIds} = deleteInfo;
    // try {
    //     const vendor = await getVendor({"_id": vendorId});
    //     const combinations = [...vendor.languageCombinations];
    //     const updatedCombinations = getAfterDeleteRates({industries, servicesIds, combinations, id});
    //     return await getVendorAfterUpdate({"_id": vendorId}, {languageCombinations: updatedCombinations});
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in deleteRate");
    // }
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
    // const { curIndustries, initRate, vendorIndustries, comb } = obj;
    // const { services, industries } = comb;
    // try {
    //     const initIndustries = [...initRate.industries];
    //     let currentWithAllIndustries = await includeAllIndustries(curIndustries, vendorIndustries, "Duo");
    // for(let industry of currentWithAllIndustries) {
    //     const initIndex = initIndustries.findIndex(item => item.industry.id === industry.industry);
    //     if(initIndex !== -1 && (industries.indexOf(industry.industry) !== -1 || industries[0] === 'All')) {
    //         industry.rates = replaceFromPrice({
    //             curRates: industry.rates, 
    //             initRates: initIndustries[initIndex].rates,
    //             services
    //         })
    //     }
    // }
    // return currentWithAllIndustries;
    // } catch(err) {
    //     console.log(err);
    //     console.log('Error in copyFromPrice');
    // }
}

async function getNewFromPrice(initRate, comb, vendorIndustries) {
    // const { industries, services } = comb;
    // const initIndustries = [...initRate.industries];
    // let newRateIndustries = [];
    // try {
    //     let ratesWithAllIndustries = await defaultRates(vendorIndustries, "Duo");
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

async function getVendorAfterCombinationsUpdated({project, step, rate}) {
    const stepTask = project.tasks.find(item => item.taskId === step.taskId);
    const rateService = stepTask.service;
    const rateIndustry = project.industry.id;
    try {
        const vendor = await getVendor({"_id": step.vendor._id});
        return await getWihtUpdatedCombs({vendor, step, rate, rateService, rateIndustry});
    } catch(err) {
        console.log(err);
        console.log("Error in getVendorAfterCombinationsUpdated");
    }
}

async function getWihtUpdatedCombs({vendor, step, rate, rateService, rateIndustry}) {
    let { languageCombinations } = vendor;
    const existingCombIndex = languageCombinations.findIndex(item => item.source && item.source.symbol === step.source && item.target.symbol === step.target);
    try {
        if(existingCombIndex !== -1) {
            return await manageExistingCombination({
                vendor, rate, rateService, rateIndustry, combIndex: existingCombIndex
            })
        } else {
            return await addCombination({vendor, step, rate, rateService, rateIndustry});
        }
    } catch(err) {
        console.log(err);
        console.log("Error in getWihtUpdatedCombs");
    }
}

async function manageExistingCombination({vendor, rate, rateService, rateIndustry, combIndex}) {
    let { languageCombinations } = vendor;
    const industries = getUpdatedVendorIndustries(vendor, rateIndustry);
    try {
        let updatedCombinations = await getUpdatedCombs({
            combinations: languageCombinations, industries, rate, rateService, rateIndustry, combIndex
        });
        return await getVendorAfterUpdate({"_id": vendor.id}, {languageCombinations: updatedCombinations, industries});
    } catch(err) {
        console.log(err);
        console.log("Error in manageExistingCombination");
    }
}

async function getUpdatedCombs({combinations, industries, rate, rateService, rateIndustry, combIndex}) {
    // let updatedCombs = [];
    // try {
    //     for(let i = 0; i < combinations.length; i++) {
    //         let comb = combinations[i]
    //         if(i !== combIndex) {
    //             updatedCombs.push(comb);
    //         } else {
    //             const rateIndex = comb.industries.findIndex(item => item.industry.id === rateIndustry);
    //             if(rateIndex !== -1) {
    //                 comb.industries[rateIndex].rates[rateService].value = rate;
    //                 comb.industries[rateIndex].rates[rateService].active = true;
    //             } else {
    //                 const ratesWithAllIndustries = await defaultRates(industries, "Duo");
    //                 let changingRate = ratesWithAllIndustries.find(item => item.id === rateIndustry);
    //                 changingRate.rates[rateService].value = rate;
    //                 changingRate.rates[rateService].active = true;
    //                 comb.industries.push(changingRate);
    //             }
    //             updatedCombs.push(comb);
    //         }
    //     }
    //     return updatedCombs;
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in getUpdatedCombs");
    // }
}

function getUpdatedVendorIndustries(vendor, rateIndustry) {
    let { industries } = vendor;
    const industryIndex = industries.findIndex(item => item.id === rateIndustry);
    if(industryIndex === -1) {
        industries.push(rateIndustry);
    }
    return industries;
}

async function addCombination({vendor, step, rate, rateService, rateIndustry}) {
    // const industries = getUpdatedVendorIndustries(vendor, rateIndustry);
    // try {
    //     const source = await Languages.findOne({symbol: step.source});
    //     const target = await Languages.findOne({symbol: step.target});
    //     const allIndustriesWithRates = await defaultRates(industries, "Duo");
    //     const newRateIndustries = allIndustriesWithRates.map(item => {
    //         let rates = Object.keys(item.rates).reduce((prev, cur) => {
    //             prev[cur] = {...item.rates[cur]};
    //             return prev;
    //         },{})
    //         if(item.id === rateIndustry) {
    //             rates[rateService].value = rate;
    //             rates[rateService].active = true;
    //         }
    //         return {
    //             industry: item.id,
    //             rates
    //         };
    //     })
    //     const newComb = {source, target, industries: newRateIndustries};
    //     return await getVendorAfterUpdate({"_id": vendor.id}, { industries, $push: {languageCombinations: newComb} });
    // } catch(err) {
    //     console.log(err);
    //     console.log("Error in addCombination");
    // }
}

module.exports= { getVendorRates, updateVendorRates, deleteRate, addSeveralCombinations, getVendorAfterCombinationsUpdated };
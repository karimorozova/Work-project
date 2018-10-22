const { Vendors } = require("../../models/");

async function checkRatesMatch(vendor, industries, rate) {
    if(rate.form === "Mono") {
        return await checkMonoRatesMatches(vendor, industries, rate);
    }
    let exist = false;
    if(vendor.languageCombinations.length) {
        for(let comb of vendor.languageCombinations) {
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
    if(!exist || !vendor.languageCombinations.length) {
        vendor.languageCombinations.push({
            source: rate.sourceLanguage._id,
            target: rate.targetLanguage._id,
            service: rate.service._id,
            industry: industries,
        })
    }
    const result = await Vendors.updateOne({"_id": vendor.id}, {$set: {languageCombinations: vendor.languageCombinations}});
    return result;
}

async function checkMonoRatesMatches(vendor, industries, rate) {
    let exist = false;
    if(vendor.languageCombinations.length) {
        for(let elem of rate.industry) {
        for(let comb of vendor.languageCombinations) {
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
    if(!exist || !vendor.languageCombinations.length) {
        vendor.languageCombinations.push({
            target: rate.targetLanguage._id,
            service: rate.service._id,
            industry: industries,
        })
    }
    const result = await Vendors.updateOne({"_id": vendor.id}, {'languageCombinations': vendor.languageCombinations});
    return result;
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
    const result = await Vendors.updateOne({"_id": vendor.id}, {$set: {languageCombinations: updatedCombinations}});
    return result;
}

async function addVendorsSeveralLangs({vendorId, comb, vendorCombinations}) {
    let langPairExist = false;
    let updatedCombinations = [...vendorCombinations];
    for(let vendorComb of updatedCombinations) {
        if(comb.source._id === vendorComb.source.id && comb.target._id === vendorComb.target.id
            && comb.service._id === vendorComb.service.id) {
            vendorComb.industry = updateCombination(comb.industry, vendorComb.industry);
            langPairExist = true;
        }
    }
    if(!langPairExist) {
        comb.industry = comb.industry.map(item => {
            return {industry: item._id, rate: item.rate, active: item.active}
        })
        updatedCombinations.push(comb);
        await Vendors.updateOne({"_id": vendorId}, {$set: {languageCombinations: updatedCombinations}})
    } else {
        await Vendors.updateOne({"_id": vendorId}, {$set: {languageCombinations: updatedCombinations}})
    }
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
            updatedIndustries.push(indus);
        }
    }
    return updatedIndustries;
}

module.exports= { checkRatesMatch, deleteRate, addVendorsSeveralLangs };
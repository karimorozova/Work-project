const { Vendors } = require("../../models/");

function getUpdatedLangPairs({ source, target, langPairs }) {
    let pairs = [...langPairs];
    let isPairExist = false;
    for(let pair of pairs) {
        if(pair.source.id === source._id && pair.target.id === target._id) {
            isPairExist = true
        }
    }
    if(!isPairExist) {
        pairs.push({source, target})
    }
    return pairs;
}

function deletePair({ langPairs, combination}) {
    const { source, target } = combination;
    let pairIndex = langPairs.findIndex(item => item.source.id === source.id && item.target.id === target.id);
    const pairs = [...langPairs];
    pairs.splice(pairIndex, 1);
    return pairs;
}

async function checkRatesMatch(vendor, industries, rate) {
    if(rate.form === "Mono") {
        return await checkMonoRatesMatches(vendor, industries, rate);
    }
    let exist = false;
    let languageCombinations = [...vendor.languageCombinations];
    let languagePairs = [...vendor.languagePairs];
    if(languageCombinations.length) {
        for(let comb of languageCombinations) {
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
    if(!exist || !languageCombinations.length) {
        languageCombinations.push({
            source: rate.sourceLanguage._id,
            target: rate.targetLanguage._id,
            service: rate.service._id,
            industry: industries,
        })
        languagePairs = getUpdatedLangPairs({ source: rate.sourceLanguage, target: rate.targetLanguage, langPairs: vendor.languagePairs })
    }
    const result = await Vendors.updateOne({"_id": vendor.id}, {$set: {languageCombinations: languageCombinations, languagePairs: languagePairs}});
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
    const updatetLangPairs = sum ? vendor.languagePairs : deletePair({langPairs: vendor.languagePairs, combination});
    const result = await Vendors.updateOne({"_id": vendor.id}, {$set: {languageCombinations: updatedCombinations, languagePairs: updatetLangPairs}});
    return result;
}

async function addVendorsSeveralLangs({vendorId, comb, vendorCombinations, langPairs, industry}) {
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
        updatedCombinations.push({...comb, industry: industries});
        let updatedLanguagePairs = getUpdatedLangPairs({source: comb.source, target: comb.target, langPairs});
        await Vendors.updateOne({"_id": vendorId}, {$set: {languageCombinations: updatedCombinations, languagePairs: updatedLanguagePairs}})
    } else {
        await Vendors.updateOne({"_id": vendorId}, {$set: {languageCombinations: updatedCombinations}})
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
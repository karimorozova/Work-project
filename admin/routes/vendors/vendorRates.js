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

module.exports= { checkRatesMatch, deleteRate };
const { Clients } = require("../models/");

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
    const result = await Clients.updateOne({"_id": client.id}, {$set: {languageCombinations: client.languageCombinations}});
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
    const result = await Clients.updateOne({"_id": client.id}, {$set: {languageCombinations: updatedCombinations}});
    return result;
}

async function addClientsSeveralLangs({clientId, comb, clientCombinations}) {
    let langPairExist = false;
    for(let clientComb of clientCombinations) {
        if(comb.source._id === clientComb.source.id && comb.target._id === clientComb.target.id
            && comb.service._id === clientComb.service.id) {
            clientComb.industry = updateCombination(comb.industry, clientComb.industry);
            langPairExist = true;
        }
    }
    if(!langPairExist) {
        comb.industry = comb.industry.map(item => {
            return {industry: item._id, rate: item.rate, active: item.active}
        })
        clientCombinations.push(comb);
        await Clients.updateOne({"_id": clientId}, {$set: {languageCombinations: clientCombinations}})
    } else {
        await Clients.updateOne({"_id": clientId}, {$set: {languageCombinations: clientCombinations}})
    }
}

function updateCombination(combIndustries, clientIndustries) {
    for(let indus of combIndustries) {
        let industryExist = false;
        for(let ind of clientIndustries) {
            if(ind.industry.id === indus._id) {
                ind.rate = indus.rate;
                industryExist = true;
            }
        }
        if(!industryExist) {
            clientIndustries.push(indus);
        }
    }
    return clientIndustries;
}

module.exports= { checkRatesMatch, deleteRate, addClientsSeveralLangs };
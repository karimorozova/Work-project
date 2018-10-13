function checkRates(client, industries, rate) {
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
    return client.languageCombinations;
}

function deleteRate(client, industry, id) {
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
     return updatedCombinations;
}

module.exports= { checkRates, deleteRate };
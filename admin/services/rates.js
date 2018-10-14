const { Services } = require("../models/");

async function checkServiceRatesMatches(service, industries, rate) {
    if(service.languageForm === 'Mono') {
        return await checkMonoRatesMatches(service, industries, rate);
    }
    let exist = false;
    for(let elem of rate.industry) {
      for(let comb of service.languageCombinations) {
        if(rate.sourceLanguage._id == comb.source.id &&
          rate.targetLanguage._id == comb.target.id) {
          exist = true;
          for(let indus of comb.industries) {
            if(elem._id == indus.industry.id || elem.name == 'All') {
                indus.rate = elem.rate
                indus.active = elem.active;
            }
          }
        }
      }
      if(exist) {
        break;
      }
    }
    if(!exist || !service.languageCombinations.length) {
        service.languageCombinations.push({
            source: rate.sourceLanguage._id,
            target: rate.targetLanguage._id,
            industries: industries,
        })
    }
    const result = await Services.updateOne({'title': rate.title}, {'languageCombinations': service.languageCombinations});
    return result;
}

async function checkMonoRatesMatches(service, industries, rate) {
    let exist = false;
    for(let elem of rate.industry) {
      for(let comb of service.languageCombinations) {
        if(rate.targetLanguage._id == comb.target.id) {
          exist = true;
          for(let indus of comb.industries) {
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
    if(!exist || !service.languageCombinations.length) {
        service.languageCombinations.push({
            target: rate.targetLanguage._id,
            industries: industries,
        })
    }
    const result = await Services.updateOne({'title': rate.title}, {'languageCombinations': service.languageCombinations});
    return result;
}

async function deleteServiceRate(service, industries, id) {
    const combIndex = service.languageCombinations.findIndex(item => {
        return item.id === id;
      });
      let combination = {...service.languageCombinations[combIndex]._doc};
      let allZero = [];
      for(let indus of combination.industries) {
        for(let ind of industries) {
          if(ind._id === indus.industry.id) {
            indus.rate = 0
            indus.industry.active = false;
          }
        }
        allZero.push(indus.rate);
      }
      service.languageCombinations.splice(combIndex, 1, combination);
      const sum = allZero.reduce((init, cur) => {return init + cur}, 0);
      const updatedCombinations = sum ? service.languageCombinations 
      : service.languageCombinations.filter(item => {return item.id !== id});
    const result = await Services.updateOne({'_id': service.id}, {$set: {'languageCombinations': updatedCombinations}});
    return result;
}

module.exports = { checkServiceRatesMatches, deleteServiceRate };
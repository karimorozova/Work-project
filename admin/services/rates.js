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
        if(rate.targetLanguage._id == comb.target.id && !comb.source) {
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

async function updateLangCombs({serviceId, comb, serviceCombinations, industries}) {
  let exist = false;
  let updatedServCombinations = [...serviceCombinations];
  for(let servComb of updatedServCombinations) {
    if(comb.source._id === servComb.source.id && comb.target._id === servComb.target.id) {
      servComb.industries = updateIndustryRates(comb.industry, servComb.industries);
      exist = true;
    }
  }
  if(!exist) {
    updatedServCombinations = addCombinations({comb, updatedServCombinations, industries}) 
    await Services.updateOne({"_id": serviceId}, {$set: {languageCombinations: updatedServCombinations}})
  } else {
    await Services.updateOne({"_id": serviceId}, {$set: {languageCombinations: updatedServCombinations}})
  }
}

function updateIndustryRates(combIndustries, servIndustries) {
  let updatedServIndustries = [...servIndustries];
  for(let indus of updatedServIndustries) {
    for(let ind of combIndustries) {
      if(indus.industry.id === ind._id) {
        indus.rate = ind.rate
      }
    }
  }
  return updatedServIndustries;
}

function addCombinations({comb, serviceCombinations, industries}) {
  let updatedCombinations = [...serviceCombinations];
  for(let indus of industries) {
    for(let ind of comb.industry) {
      if(indus.id == ind._id) {
        indus.rate = ind.rate;
        indus.active = true;
      } else {
        indus.rate = 0;
        indus.active = false;
      }
    }
  }
  industries = industries.map(item => {
    return {industry: item._id, active: item.active, rate: item.rate}
  })
  updatedCombinations.push({
    source: comb.source,
    target: comb.target,
    industries: industries,
    active: true
  })
  return updatedCombinations;
}

module.exports = { checkServiceRatesMatches, deleteServiceRate, updateLangCombs };
const { Services, Industries, Duorate } = require("../models/");

async function updateRate(rate, infoIndustries, languageForm) {
  try {
    let industries = await includeAllIndustries(rate.industries, languageForm);
    if(infoIndustries[0].name == "All") {
      const updatedIndustries = updateRateForAll(industries, infoIndustries[0].rates);
      return { updatedIndustries };
    }
    for(let industry of industries) {
      const index = infoIndustries.findIndex(item => item._id === industry.industry);
      if(index !== -1) {
        industry.rates = infoIndustries[index].rates; 
      }
    }
    return { updatedIndustries: industries };
  } catch(err) {
    console.log("Error from updateRate!");
    console.log(err);
  }
}

function updateRateForAll(rateIdustries, rates) {
  return rateIdustries.map(item => {
    return  {...item, rates}
  })
}

async function createNewRate(info) {
  const { sourceLanguage, targetLanguage, industries, languageForm } = info;
  try {
    if(info.industries[0].name === "All") {
      return await createNewForAllIndustries({ sourceLanguage, targetLanguage, industries, languageForm });
    }
    const modifiedIndustries = industries.map(item => {
      const industry = {...item, id: item._id}
      return {industry, rates: item.rates}
    })
    const allIndustries = await includeAllIndustries(modifiedIndustries, languageForm);
    await Duorate.create({"source": sourceLanguage, "target": targetLanguage, 'industries': allIndustries});
  } catch(err) {
    console.log("Error from createNewRate");
    console.log(err);
  }
}

async function createNewForAllIndustries({ sourceLanguage, targetLanguage, industries, languageForm }) {
  try {
    const rateIndustries = await defaultRates(languageForm);
    const allIndustries = rateIndustries.map(item => {
      return {industry: item, rates: industries[0].rates}
    });
    await Duorate.create({"source": sourceLanguage, "target": targetLanguage, 'industries': allIndustries});
  } catch(err) {
    console.log("Error from createNewForAllIndustries");
    console.log(err);
  }
}

async function includeAllIndustries(rateIndustries, languageForm) {
  try {
    let industries = await defaultRates(languageForm);
    let allIndustries = [];
    for(let elem of industries) {
      const index = rateIndustries.findIndex(item => item.industry.id === elem.id);
      if(index !== -1) {
        allIndustries.push({
          'industry': elem.id,
          'rates': rateIndustries[index].rates
        })
      } else {
        allIndustries.push({
          'industry': elem.id,
          'rates': elem.rates
        })
      }
    }
    return allIndustries;
  } catch(err) {
    console.log("Error from includeAllIndustries");
    console.log(err);
  }
}

async function defaultRates(languageForm) {
  try {
    const industries = await Industries.find();
    const services = await Services.find({languageForm: languageForm});
    const serviceRate = languageForm === "Duo" ? {value: 0, active: true} : {value: 0, package: 200, active: true};
    const rates = services.reduce((init, cur) => {
        const key = cur._id;
        init[key] = {...serviceRate};
        return {...init}
    }, {});
    for(let industry of industries) {
      industry["rates"] = {...rates}; 
    }
    return industries;
  } catch(err) {
    console.log("Error from defaultrates");
    console.log(err);
  }
}

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
    const updatedCombs = addCombinations({comb, serviceCombinations: updatedServCombinations, industries}) 
    await Services.updateOne({"_id": serviceId}, {$set: {languageCombinations: updatedCombs}})
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
  let updatingIndustries = [];
  for(let indus of industries) {
    for(let ind of comb.industry) {
      if(indus.id == ind._id) {
        updatingIndustries.push({
          industry: indus.id,
          active: ind.active, 
          rate: ind.rate
        })
      } else {
        updatingIndustries.push({
          industry: indus.id,
          active: false, 
          rate: 0
        })
      }
    }
  }
  updatedCombinations.push({
    source: comb.source,
    target: comb.target,
    industries: updatingIndustries,
    active: true
  })
  return updatedCombinations;
}

module.exports = { updateRate, createNewRate, checkServiceRatesMatches, deleteServiceRate, updateLangCombs };
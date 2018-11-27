const { Services, Industries, Duorate, Monorate } = require("../models/");

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
  const { sourceLanguage, targetLanguage, package, industries, languageForm } = info;
  try {
    if(info.industries[0].name === "All") {
      return await createNewForAllIndustries({ sourceLanguage, targetLanguage, package, industries, languageForm });
    }
    const modifiedIndustries = industries.map(item => {
      const industry = {...item, id: item._id}
      return {industry, rates: item.rates}
    })
    const allIndustries = await includeAllIndustries(modifiedIndustries, languageForm);
    if(info.languageForm === "Duo") {
      await Duorate.create({"source": sourceLanguage, "target": targetLanguage, 'industries': allIndustries});
    } else {
      await Monorate.create({"target": targetLanguage, "package": package, 'industries': allIndustries});
    }
  } catch(err) {
    console.log("Error from createNewRate");
    console.log(err);
  }
}

async function createNewForAllIndustries({ sourceLanguage, targetLanguage, package, industries, languageForm }) {
  try {
    const rateIndustries = await defaultRates(languageForm);
    const allIndustries = rateIndustries.map(item => {
      return {industry: item, rates: industries[0].rates}
    });
    if(languageForm === "Duo") {
      await Duorate.create({"source": sourceLanguage, "target": targetLanguage, 'industries': allIndustries});
    } else {
      await Monorate.create({"target": targetLanguage, package: package, 'industries': allIndustries});
    }
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
    const serviceRate = {value: 0, active: false};
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

async function deleteRate({rate, industries, services, languageForm}) {
  let updatedIndustries = [];
  const industriesIds = industries.map(item => item._id);
  try {
    for(let elem of rate.industries) {
      if(industries[0].name === "All" || industriesIds.indexOf(elem.industry.id) !== -1) {
        updatedIndustries.push(deletedRates(elem, services))
      } else {
        updatedIndustries.push(elem);
      }
    }
    if(isAllRatesDeleted(rate.industries)) {
      return languageForm === "Duo" ? await Duorate.deleteOne({"_id": rate.id})
      : await Monorate.deleteOne({"_id": rate.id});
    }
    return languageForm === "Duo" ? await Duorate.updateOne({"_id": rate.id}, {industries: updatedIndustries})
    : await Monorate.updateOne({"_id": rate.id}, {industries: updatedIndustries});
  } catch(err) {
    console.log("Error from deleteDuoRate");
    console.log(err);
  }
}

function isAllRatesDeleted(industries) {
  let sum = 0;
  for(let elem of industries) {
    sum += Object.keys(elem.rates).reduce((init, cur) => {
      return init + elem.rates[cur].value;
    }, 0)
  }
  return sum === 0
}

function deletedRates(elem, services) {
  const { rates } = elem;
  for(let id of services) {
    rates[id].value = 0;
    rates[id].active = false;
  }
  return { industry: elem.industry, rates };
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

module.exports = { updateRate, createNewRate, deleteRate, updateLangCombs };
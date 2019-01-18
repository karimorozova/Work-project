const { Services, Industries, Pricelist, Duorate, Monorate } = require("../models/");

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

function updateRateForAll(industries, rates) {
  return industries.map(item => {
    return  {...item, rates}
  })
}

async function createNewRate(info, priceId) {
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
      await Pricelist.updateOne({"_id": priceId}, {
        $push: {combinations: {source: sourceLanguage, target: targetLanguage, industries: allIndustries}}
      });
    } else {
      await Pricelist.updateOne({"_id": priceId}, {
        $push: {combinations: {target: targetLanguage, package, industries: allIndustries}}
      });
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
      await Pricelist.updateOne({"_id": priceId}, {
        $push: {combinations: {source: sourceLanguage, target: targetLanguage, industries: allIndustries}}
      });
    } else {
      await Pricelist.updateOne({"_id": priceId}, {
        $push: {combinations: {target: targetLanguage,package, industries: allIndustries}}
      });
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
        const key = cur.id;
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

async function deleteRate({priceId, rateId, industries, services}) {
  let updatedIndustries = [];
  const industriesIds = industries.map(item => item._id);
  try {
    const priceList = await Pricelist.findOne({"_id": priceId}).populate("combinations.industries.industry");
    const { combinations } = priceList;
    const rateIndex = combinations.findIndex(item => item.id === rateId);
    for(let elem of combinations[rateIndex].industries) {
      if(industries[0].name === "All" || industriesIds.indexOf(elem.industry.id) !== -1) {
        updatedIndustries.push(deletedRates(elem, services))
      } else {
        updatedIndustries.push(elem);
      }
    }
    if(isAllRatesDeleted(combinations[rateIndex].industries)) {
      combinations.splice(rateIndex, 1);
    }
    return await Pricelist.updateOne({"_id": priceId}, { combinations });
  } catch(err) {
    console.log("Error from deleteRate");
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

async function updateLangCombs(combinations) {
  try {
    for(let {source, target, industries} of combinations) {
      const rate = await Duorate.findOne({"source": source._id, "target": target._id});
      if(rate) {
        await updateExistingCombination(industries, rate);
      } else {
        await createNewRate({
          sourceLanguage: source,
          targetLanguage: target,
          industries,
          languageForm: "Duo"
        })
      }
    }
  } catch(err) {
    console.log(err);
    console.log("Error in updateLangCombs");
  }
}

async function updateExistingCombination(industries, rate) {
  try {
    let allIndustries = await includeAllIndustries(rate.industries, "Duo");
    if(industries[0].name === "All") {
      const updatedIndustries = updateRateForAll(allIndustries, industries[0].rates);
      return await Duorate.updateOne({"_id": rate._id}, {industries: updatedIndustries});
    }
    for(let industry of allIndustries) {
      const index = industries.findIndex(item => item._id === industry.industry);
      if(index !== -1) {
        industry.rates = industries[index].rates
      }
    }
    await Duorate.updateOne({"_id": rate._id}, {industries: allIndustries})
  } catch(err) {
    console.log(err);
    console.log("Error in updateExistingCombination");
  }
}


module.exports = { updateRate, createNewRate, deleteRate, updateLangCombs };
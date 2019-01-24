const { Pricelist, Industries, Services } = require("../models");
const { getPricelist } = require("./getrates");

async function saveNewPricelist(pricelist) {
    const { name, isActive, isDefault, copyName } = pricelist;
    try {
        const donorPricelist = copyName ? await Pricelist.findOne({"name": copyName}) : "";
        const combinations = donorPricelist ? [...donorPricelist.combinations] : [];
        return await createNewPricelist({name, isActive, isDefault, combinations});
    } catch(err) {
        console.log(err);
        console.log("Error in saveNewPricelist");
    }
}

async function createNewPricelist({name, isActive, isDefault, combinations}) {
    try {
        if(isDefault) {
            await Pricelist.updateOne({"isDefault": true}, {"isDefault": !isDefault});
            return await Pricelist.create({name, isDefault, isActive, combinations});
        }
        return await Pricelist.create({name, isDefault, isActive, combinations});
    } catch(err) {
        console.log(err);
        console.log("Error in createNewPricelist");
    }
}

async function deletePricelist(id, isDefault) {
    try {
        if(!isDefault) {
            return await Pricelist.deleteOne({"_id": id});
        }
        const firstPrice = await Pricelist.find().limit(1);
        if(firstPrice.length) {
            const defaultId = firstPrice[0].id;
            await Pricelist.deleteOne({"_id": id});
            await Pricelist.updateOne({"_id": defaultId}, {isDefault: isDefault});
        } 
    } catch(err) {
        console.log(err);
        console.log("Error in deletePricelist");
    }
}

async function checkPriceForPairs(priceId, combinations) {
    let result = [];
    try {
        const pricelist = await getPricelist({"_id": priceId});
        const priceCombs = [...pricelist.combinations];
        for(let comb of combinations) {
            const pairIndex = priceCombs.findIndex(item => {
                return item.source && item.source.id === comb.source._id && item.target.id === comb.target._id;
            })
            if(pairIndex !== -1) {
                result.push({...comb, id: priceCombs[pairIndex]._id});
            }
        }
        return result;
    } catch(err) {
        console.log(err);
        console.log("Error in checkPriceForPairs");
    }
}

async function addSeveralLangs(obj) {
    const { currentPriceId, sourcePriceId, combinations } = obj;
    try {
        const currentPrice = await getPricelist({"_id": currentPriceId});
        const sourcePrice = await getPricelist({"_id": sourcePriceId});
        const sourceCombs = [...sourcePrice.combinations];
        let currentCombs = [...currentPrice.combinations];
        let newRates = [];
        for(let comb of combinations) {
            const initRate = sourceCombs.find(item => item.id === comb.id);
            const goalRateIndex = currentCombs.findIndex(item => {
                return item.source && item.source.id === comb.source._id && item.target.id === comb.target._id
            });
            if(goalRateIndex === -1) {
                const newRateIndustries = await getNewFromPrice(initRate, comb);
                newRates.push({
                    source: comb.source, target: comb.target, industries: newRateIndustries
                });
            } else {
                currentCombs[goalRateIndex].industries = await copyFromPrice({
                    curIndustries: currentCombs[goalRateIndex].industries,
                    initRate,
                    comb
                }) 
            }
        }
        return [...currentCombs, ...newRates];
    } catch(err) {
        console.log(err);
        console.log("Error in addSeveralLangs");
    }
}

async function copyFromPrice(obj) {
    const { curIndustries, initRate, comb } = obj;
    const { services, industries } = comb;
    try {
    let currentWithAllIndustries = await includeAllIndustries(curIndustries, "Duo");
    const initIndustries = [...initRate.industries];
    for(let industry of currentWithAllIndustries) {
        const initIndex = initIndustries.findIndex(item => item.industry.id === industry.industry);
        if(initIndex !== -1 && industries.indexOf(industry.industry) !== -1) {
            industry.rates = replaceFromPrice({
                curRates: industry.rates, 
                initRates: initIndustries[initIndex].rates,
                services
            })
        }
    }
    return currentWithAllIndustries;
    } catch(err) {
        console.log(err);
        console.log('Error in copyFromPrice');
    }
}

function replaceFromPrice({ curRates, initRates, services }) {
    const copiedRates = Object.keys(curRates).reduce((init, curKey) => {
        if(services.indexOf(curKey) !== -1) {
            init[curKey] = {...initRates[curKey]}
        } else {
            init[curKey] = {...curRates[curKey]}
        }
        return {...init};
    }, {})
    return copiedRates;
}

async function getNewFromPrice(initRate, comb) {
    const { industries, services } = comb;
    const initIndustries = [...initRate.industries];
    let newRateIndustries = [];
    try {
        let initWithAllIndustries = await includeAllIndustries(initIndustries, "Duo");
        for(let industry of initWithAllIndustries) {
            if(industries.indexOf(industry.industry) !== -1) {
                industry.rates = raplaceRates(industry.rates, services);
            } else {
                industry.rates = resetRates(industry.rates);
            }
            newRateIndustries.push(industry);
        }
        return newRateIndustries;
    } catch(err) {
        console.log(err);
        console.log("Error in getNewFromPrice");
    }
}

function resetRates(rates) {
    return Object.keys(rates).reduce((init, curKey) => {
        init[curKey] = {value: 0, active: false};
        return {...init};
    }, {});
};

function raplaceRates(industryRates, services) {
    let rates = Object.keys(industryRates).reduce((init, curKey) => {
        if(services.indexOf(curKey) !== -1) {
            init[curKey] = {...industryRates[curKey]};
        } else {
            init[curKey] = {value: 0, active: false};
        }
        return {...init}
    }, {})
    return rates;
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
        console.log("Error from defaultRates");
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

module.exports = { saveNewPricelist, deletePricelist, checkPriceForPairs, addSeveralLangs };
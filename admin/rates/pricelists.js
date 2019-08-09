const { Pricelist, Industries, Services } = require("../models");
const { getPricelist } = require("./getrates");

async function saveNewPricelist(pricelist) {
    const { name, isActive, isClientDefault, isVendorDefault, copyName } = pricelist;
    try {
        const donorPricelist = copyName ? await Pricelist.findOne({"name": copyName}) : "";
        const { monoRates = [], wordsRates = [], hoursRates = [] } = donorPricelist ? donorPricelist : {};
        return await Pricelist.create({
            name, isClientDefault, isVendorDefault, isActive, monoRates, wordsRates, hoursRates
        });
    } catch(err) {
        console.log(err);
        console.log("Error in saveNewPricelist");
    }
}

async function deletePricelist(id, isClientDefault, isVendorDefault) {
    try {
        if(!isClientDefault && !isVendorDefault) {
            return await Pricelist.deleteOne({"_id": id});
        }
        const firstPrice = await Pricelist.find().limit(1);
        const defaultId = firstPrice[0].id;
        if(firstPrice.length) {
            await Pricelist.deleteOne({"_id": id});
            await setDefaultPrice(defaultId, isClientDefault, isVendorDefault);
        } 
    } catch(err) {
        console.log(err);
        console.log("Error in deletePricelist");
    }
}

async function setDefaultPrice(defaultId, isClientDefault, isVendorDefault) {
    try {
        if(isClientDefault && isVendorDefault) {
          return await Pricelist.updateOne({"_id": defaultId}, { isClientDefault, isVendorDefault });
        }
        isClientDefault ? await Pricelist.updateOne({"_id": defaultId}, { isClientDefault })
                : await Pricelist.updateOne({"_id": defaultId}, { isVendorDefault });
    } catch(err) {
        console.log(err);
        console.log("Error in setDefaultPrice");
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
    // const { curIndustries, initRate, comb } = obj;
    // const { services, industries } = comb;
    // try {
    // let currentWithAllIndustries = await includeAllIndustries(curIndustries, "Duo");
    // const initIndustries = [...initRate.industries];
    // for(let industry of currentWithAllIndustries) {
    //     const initIndex = initIndustries.findIndex(item => item.industry.id === industry.industry);
    //     if(initIndex !== -1 && (industries.indexOf(industry.industry) !== -1 || industries[0] === 'All')) {
    //         industry.rates = replaceFromPrice({
    //             curRates: industry.rates, 
    //             initRates: initIndustries[initIndex].rates,
    //             services
    //         })
    //     }
    // }
    // return currentWithAllIndustries;
    // } catch(err) {
    //     console.log(err);
    //     console.log('Error in copyFromPrice');
    // }
}

function replaceFromPrice({ curRates, initRates, services }) {
    const copiedRates = Object.keys(curRates).reduce((prev, curKey) => {
        if(services.indexOf(curKey) !== -1) {
            prev[curKey] = {...initRates[curKey]}
        } else {
            prev[curKey] = {...curRates[curKey]}
        }
        return {...prev};
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
            if(industries.indexOf(industry.industry) !== -1 || industries[0] === 'All') {
                industry.rates = replaceRates(industry.rates, services);
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
    return Object.keys(rates).reduce((prev, curKey) => {
        prev[curKey] = {value: 0, active: false, min: 1};
        return {...prev};
    }, {});
};

function replaceRates(industryRates, services) {
    let rates = Object.keys(industryRates).reduce((prev, curKey) => {
        if(services.indexOf(curKey) !== -1) {
            prev[curKey] = {...industryRates[curKey]};
        } else {
            prev[curKey] = {value: 0, active: false, min: 1};
        }
        return {...prev}
    }, {})
    return rates;
}

async function defaultRates(languageForm) {
    try {
        const industries = await Industries.find();
        const services = await Services.find({languageForm: languageForm});
        const serviceRate = {value: 0, active: false};
        const rates = services.reduce((prev, cur) => {
            const key = cur.id;
            prev[key] = {...serviceRate};
            return {...prev}
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

module.exports = { saveNewPricelist, deletePricelist, checkPriceForPairs, addSeveralLangs, replaceRates, replaceFromPrice };
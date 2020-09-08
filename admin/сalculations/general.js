function hasActiveRateValue({step, rate, stepIndustry}) {
    const stepId = step.serviceStep ? step.serviceStep._id : step._id;
    const index = rate && rate.industries.findIndex(item => item.id === stepIndustry);
    if(index !== -1 /* && */ || rate.rates[stepId]) {
      return true;
        // return rate.rates[stepId].active && rate.rates[stepId].value > 0;
    }
    return false;
}

function isVendorMatches({ rates, source, target, step, industryId }) {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = rates;
  const isLangPairsMatch = basicPricesTable.find(({ sourceLanguage, targetLanguage }) => (
    `${sourceLanguage} ${targetLanguage}` === `${source._id} ${target._id}`
  ));
  const isStepMatches = stepMultipliersTable.find(item => (
    item.step.toString() === step.step.toString()
  ));
  const isIndustryMatches = industryMultipliersTable.find(({ industry }) => (
    industry.toString() === industryId.toString()
  ));
  return !!(isLangPairsMatch && isStepMatches && isIndustryMatches);
  // return rates.find(item => {
  //     if(item.target.symbol === target.symbol && isAnotherPartEqual(packageSize, source, item)) {
  //         return hasActiveRateValue({
  //                 step,
  //                 pair: item,
  //                 stepIndustry: industryId
  //             });
  //     }
  // })
}

function isAnotherPartEqual(packageSize, source, item) {
    return packageSize ? item.packageSize === packageSize : item.source.symbol === source.symbol;
}

function getVendorRate({vendor, ratesProp, packageSize, source, target, industryId, step, multiplier}) {
    const ratePair = vendor[ratesProp].find(item => {
        return item.target.symbol === target.symbol && isAnotherPartEqual(packageSize, source, item)
        && hasActiveRateValue({step, pair: item, stepIndustry: industryId})
    })
    let { min, value } = ratePair ? ratePair.rates[step._id] : {min: 0, value: 0};
    value = multiplier ? +(value*multiplier).toFixed(2) : value;
    const payables = value > min ? value : min;
    return {vendor, vendorRate: ratePair ? ratePair.rates[step._id] : "", payables};
}

function getUpdatedSteps({steps, payables, vendorRate, step}) {
    return steps.map(item => {
        if(item.stepId === step.stepId) {
            item.finance.Price.payables = payables;
            item.vendorRate = vendorRate;
        }
        return item;
    })
}

function getUpdatedTasks({tasks, payables, step}) {
    return tasks.map(item => {
        if(item.taskId === step.taskId) {
            item.finance.Price.payables = payables;
        }
        return item;
    })
}

module.exports = { hasActiveRateValue, isVendorMatches, getVendorRate, getUpdatedSteps, getUpdatedTasks }

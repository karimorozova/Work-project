function hasActiveRateValue({step, pair, stepIndustry}) {
    const stepId = step.serviceStep ? step.serviceStep._id : step._id;
    const index = pair.industries.findIndex(item => item.id === stepIndustry);
    if(index !== -1 && pair.rates[stepId]) {
        return pair.rates[stepId].active && pair.rates[stepId].value > 0;
    }
    return false;
}

function isVendorMatches({rates, packageSize, source, target, step, industryId}) {
    return rates.find(item => {
        if(item.target.symbol === target.symbol && isAnotherPartEqual(packageSize, source, item)) {
            return hasActiveRateValue({
                    step, 
                    pair: item, 
                    stepIndustry: industryId
                });
        }
    })
}

function isAnotherPartEqual(packageSize, source, item) {
    return packageSize ? item.packageSize === packageSize : item.source.symbol === source.symbol;
}

function getVendorRate({vendor, ratesProp, packageSize, source, target, industryId, step, multiplier}) {
    const ratePair = vendor[ratesProp].find(item => {
        return item.target.symbol === target.symbol && item.source.symbol === source.symbol
        && hasActiveRateValue({step, pair: item, stepIndustry: industryId})
    })
    let { min, value } = ratePair ? ratePair.rates[step._id] : {min: 0, value: 0};
    value = multiplier ? +(value*multiplier).toFixed(2) : value;
    const payables = value > min ? value : min;            
    return {vendor, vendorRate: ratePair ? ratePair.rates[step._id] : "", payables};
}

module.exports = { hasActiveRateValue, isVendorMatches, getVendorRate }
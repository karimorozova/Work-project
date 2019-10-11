function filterVendors(vendors, filters) {
    let result = [...vendors];
    if(filters.nameFilter) {
        result = result.filter(item => {
            const name = item.firstName + " " + item.surname;
            return name.toLowerCase().indexOf(filters.nameFilter.toLowerCase()) != -1;
        })
    }
    if(filters.statusFilter && filters.statusFilter !== 'All') {
        result = result.filter(item => {
            return item.status == filters.statusFilter;
        })
    }
    if(filters.industryFilter && filters.industryFilter.name !== 'All') {
        result = result.filter(item => {
            const industryIds = item.industries.map(indus => indus.id);
            return industryIds.indexOf(filters.industryFilter._id) !== -1;
        })
    }
    if(filters.sourceFilter && filters.sourceFilter.length && filters.sourceFilter[0] !== 'All') {
        result = result.filter(item => {
            const combs = [...item.wordsRates, ...item.hoursRates];
            if(combs.length) {
                const comb = combs.find(item => item.source && filters.sourceFilter.indexOf(item.source.symbol) !== -1);
                return comb;
            }
        })
    }
    if(filters.targetFilter && filters.targetFilter.length && filters.targetFilter[0] !== 'All') {
        result = result.filter(item => {
            const combs = [...item.wordsRates, ...item.hoursRates, ...item.monoRates];;
            if(combs.length) {
                const comb = combs.find(item => filters.targetFilter.indexOf(item.target.symbol) !== -1);
                return comb;
            }
        })
    }
    if(filters.stepFilter && filters.stepFilter.title !== "All") {
        result = filterByStep(result, filters.stepFilter);
    }
    return result;
}

function filterByStep(vendors, stepFilter) {
    return vendors.filter(vendor => {
        const combs = [...vendor.wordsRates, ...vendor.hoursRates, ...vendor.monoRates];
        return isActiveStep(combs, stepFilter);
    })
}

function isActiveStep(combs, stepFilter) {
    for(let comb of combs) {
        const { rates } = comb;
        const activeStep = checkServiceSteps(rates, stepFilter);
        if(activeStep) {
            return true;
        }
    }
}

function checkServiceSteps(rates, stepFilter) {
    return Object.keys(rates).find(item => {
        if(item === stepFilter._id) {
            return rates[item].active && +rates[item].value > 0;
        }
    })             
}

module.exports = { filterVendors }
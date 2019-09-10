function hasActiveRateValue({step, pair, stepIndustry}) {
    const stepId = step.serviceStep ? step.serviceStep._id : step._id;
    const index = pair.industries.findIndex(item => item.id === stepIndustry);
    if(index !== -1) {
        return pair.rates[stepId].active && pair.rates[stepId].value > 0;
    }
    return false;
}

module.exports = { hasActiveRateValue }
export default {
    methods: {
        checkForLanguagePair(vendor, index) {
            const step = index >= 0 ? this.allSteps[index] : this.step;
            const ratesProp = this.getRatesProp(step.serviceStep.calculationUnit);
            if(step.serviceStep.calculationUnit !== 'Packages') {
                return this.isVendorMatchesForDuoRate({ratesProp, step, vendor});
            } else {
                return this.isVendorMatchesForMonoRate({ratesProp, step, vendor});
            }
        },
        isVendorMatchesForDuoRate({ratesProp, step, vendor}) {
            return vendor[ratesProp].find(item => {
                if(item.source.symbol === step.source && 
                    item.target.symbol === step.target) {
                    return this.hasRateValue({
                        stepId: step.serviceStep._id, 
                        pair: item, 
                        stepIndustry: this.currentProject.industry._id
                    });
                }
            })
        },
        isVendorMatchesForMonoRate({ratesProp, step, vendor}) {
            return vendor[ratesProp].find(item => {
                if(item.packageSize === step.packageSize && 
                    item.target.symbol === step.target) {
                    return this.hasRateValue({
                        stepId: step.serviceStep._id, 
                        pair: item, 
                        stepIndustry: this.currentProject.industry._id
                    });
                }
            })
        },
        getRatesProp(unit) {
            let prop = "monoRates";
            switch(unit) {
                case "Words":
                    prop = "wordsRates";
                    break;
                case "Hours":
                    prop = "hoursRates";
            }
            return prop;
        },
        hasRateValue({stepId, pair, stepIndustry}) {
            const index = pair.industries.findIndex(item => item._id === stepIndustry);
            if(index === -1) {
                return false;
            }
            return pair.rates[stepId];
        }
    }
}
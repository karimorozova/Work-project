export default {
    methods: {
        extendedVendors(index) {
            const allSteps = this.currentProject.steps;
            const step = index >= 0 ? allSteps[index] : this.step;
            const sameTaskSteps = allSteps.filter(item => item.stepId !== step.stepId && item.taskId === step.taskId);
            const assignedTaskVendors = sameTaskSteps.filter(item => item.vendor).map(item => item.vendor._id);
            let result = !this.isMainGroup() ? this.vendors.filter(item => assignedTaskVendors.indexOf(item._id) === -1) : [...this.vendors];
            if(this.isAllShow) {
                return result.filter(item => item.status === 'Active');
            }
            result = result.filter(item => item.status === 'Active' && this.checkForLanguagePair(item, index));
            return result;
        },
        isMainGroup() {
            return this.userGroup.name === 'Administrators' || this.userGroup.name === 'Developers';
        },
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
                if(item.source.symbol === step.sourceLanguage && 
                    item.target.symbol === step.targetLanguage) {
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
                    item.target.symbol === step.targetLanguage) {
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
export default {
    methods: {
        filterByStep(vendors) {
            return vendors.filter(vendor => {
                const combs = vendor.languageCombinations;
                return this.isActiveStep(combs);
            })
        },
        isActiveStep(combs) {
            for(let comb of combs) {
                const { industries } = comb;
                const activeStep = industries.find(item => {
                    const { rates } = item;
                    return this.checkServiceSteps(rates);
                })
                if(activeStep) {
                    return true;
                }
            }
        },
        checkServiceSteps(rates) {
            const servicesWithStepFilter = this.services.filter(item => {
                if(item.steps && item.steps.length) {
                    return item.steps.find(stepItem => stepItem.step._id === this.stepFilter._id);
                }
            }).map(item => item._id);
            return Object.keys(rates).find(item => {
                if(servicesWithStepFilter.indexOf(item) !== -1) {
                    return rates[item].active && +rates[item].value > 0;
                }
            })
             
        },
        async getAllServices() {
            try {
                await this.getServices();
            } catch(err) { }
        }
    },
    computed: {
        filteredVendors() {
            let result = this.vuexVendors;
            if(this.nameFilter) {
                result = result.filter(item => {
                    const name = item.firstName + " " + item.surname;
                    return name.toLowerCase().indexOf(this.nameFilter.toLowerCase()) != -1;
                })
            }
            if(this.statusFilter && this.statusFilter !== 'All') {
                result = result.filter(item => {
                    return item.status == this.statusFilter;
                })
            }
            if(this.industryFilter && this.industryFilter.name !== 'All') {
                result = result.filter(item => {
                    const industryIds = item.industries.map(indus => indus._id);
                    return industryIds.indexOf(this.industryFilter._id) !== -1;
                })
            }
            if(this.sourceFilter.length && this.sourceFilter[0] !== 'All') {
                result = result.filter(item => {
                    const combs = item.languageCombinations;
                    if(combs.length) {
                        const comb = combs.find(item => item.source && this.sourceFilter.indexOf(item.source.symbol) !== -1);
                        return comb;
                    }
                })
            }
            if(this.targetFilter.length && this.targetFilter[0] !== 'All') {
                result = result.filter(item => {
                    const combs = item.languageCombinations;
                    if(combs.length) {
                        const comb = combs.find(item => this.targetFilter.indexOf(item.target.symbol) !== -1);
                        return comb;
                    }
                })
            }
            if(this.stepFilter && this.stepFilter.title !== "All") {
                result = this.filterByStep(result);
            }
            return result;
        }
    },
    created() {
        this.getAllServices();
    }
}
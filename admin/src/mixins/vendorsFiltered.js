export default {
    methods: {
        filterByStep(vendors) {
            return vendors.filter(vendor => {
                const combs = [...vendor.wordsRates, ...vendor.hoursRates, ...vendor.monoRates];
                return this.isActiveStep(combs);
            })
        },
        isActiveStep(combs) {
            for(let comb of combs) {
                const { rates } = comb;
                const activeStep = this.checkServiceSteps(rates);
                if(activeStep) {
                    return true;
                }
            }
        },
        checkServiceSteps(rates) {
            return Object.keys(rates).find(item => {
                if(item === this.stepFilter._id) {
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
                    const combs = [...item.wordsRates, ...item.hoursRates];
                    if(combs.length) {
                        const comb = combs.find(item => item.source && this.sourceFilter.indexOf(item.source.symbol) !== -1);
                        return comb;
                    }
                })
            }
            if(this.targetFilter.length && this.targetFilter[0] !== 'All') {
                result = result.filter(item => {
                    const combs = [...item.wordsRates, ...item.hoursRates, ...item.monoRates];;
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
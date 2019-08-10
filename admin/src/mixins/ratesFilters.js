export default {
    methods: {
        setFilters({mainProp, option, index , isIndustry}) {
            this.changeFilter({index, mainProp, option});
            if(option === 'All' || option.name === 'All' || !this[mainProp].length) {
                isIndustry ? this[mainProp] = [{name: 'All'}] : this[mainProp] = ['All'];
            }
            this.fitlterRates();
        },
        changeFilter({index, mainProp, option}) {
            if(index !== -1) {
                this[mainProp].splice(index, 1);
            } else {
                this[mainProp].push(option);
            }
        },
        setSourceFilter({lang}) {
            this.sourceSelect = this.sourceSelect.filter(item => item !== 'All');
            const index = this.sourceSelect.indexOf(lang.symbol);
            this.setFilters({mainProp: "sourceSelect", option: lang.symbol, index});
        },
        setTargetFilter({lang}) {
            this.targetSelect = this.targetSelect.filter(item => item !== 'All');
            const index = this.targetSelect.indexOf(lang.symbol);
            this.setFilters({mainProp: "targetSelect", option: lang.symbol, index});
        },
        setPackageFilter({option}) {
            const index = this.packageFilter.indexOf(option);
            this.packageFilter = this.packageFilter.filter(item => item !== 'All');
            this.setFilters({mainProp: "packageFilter", option, index});
        },
        setIndustryFilter({industry}) {
            this.industryFilter = this.industryFilter.filter(item => item.name !== 'All');
            const index = this.industryFilter.findIndex(item => item.name === industry.name);
            this.setFilters({mainProp: "industryFilter", option: industry, index, isIndustry: true});
        },
        fitlterRates() {
            let result = this.entity ? this.entity[this.rateForm] : this.currentPrice[this.rateForm];
            if(this.sourceSelect.length && this.sourceSelect[0] !== 'All' && this.rateForm !== "monoRates") {
                result = result.filter(item => this.sourceSelect.indexOf(item.source.symbol) !== -1);
            }
            if(this.targetSelect.length && this.targetSelect[0] !== 'All') {
                result = result.filter(item => this.targetSelect.indexOf(item.target.symbol) !== -1);
            }
            if(this.packageFilter.length && this.packageFilter[0] !== 'All' && this.rateForm === "monoRates") {
                result = result.filter(item => this.packageFilter.indexOf(item.packageSize) !== -1);
            }
            if(this.industryFilter.length && this.industryFilter[0].name !== 'All') {
                result = result.filter(item => this.hasIndustry(item.industries))
            }
            this.storePriceRates({prop: this.rateForm, value: result});
        },
        hasIndustry(industries) {
            return industries.find(item => this.industryFilterNames.indexOf(item.name) !== -1);
        }
    },
    computed: {
        industryFilterNames() {
            return this.industryFilter.map(item => item.name);
        }
    },
    mounted() {
        this.fitlterRates();
    }
}
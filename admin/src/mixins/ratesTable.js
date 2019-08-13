export default {
    data() {
        return {
            domain: "http://localhost:3001",
            currentActive: -1,
            currentInfo: null,
            areErrors: false,
            errors: []
        }
    },
    methods: {
        isScrollDrop(drop, elem) {
            return drop && this.fullInfo.length >= 4;
        },
        handleScroll() {
            const querySelector = `.${this.ratesBodyClass}`;
            let element = document.querySelector(querySelector);
            element.scrollTop = 400;
        },
        toggleCheck(e, index, bool) {
            const id = this.fullInfo[index]._id;
            this.toggleRateCheck({prop: this.rateForm, id, isChecked: bool});
        },
        toggleAllChecks(e, bool) {
            this.toggleAllRatesCheck({prop: this.rateForm, isChecked: bool});
        },
        toggleActive(stepId) {
            this.currentInfo.rates[stepId].active = !this.currentInfo.rates[stepId].active;
        },
        addNewRow() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.$emit("addNewRow");
            this.setEditingData(this.fullInfo.length-1);
            setTimeout(() => {
                this.handleScroll();
            }, 0)
        },
        async makeAction(key, index) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            switch(key) {
                case "edit": 
                    this.setEditingData(index);
                    break;
                case "cancel": 
                    this.cancelEdition(index);
                    break;
                case "save":
                    await this.checkErrors();
                    break;
                case "delete":
                    await this.deleteRate(index);
            }
        },
        notValidRates() {
            const regex = /^\d*\.?\d+$/;
            const ratesKeys = Object.keys(this.currentInfo.rates);
            for(let key of ratesKeys) {
                if(!regex.test(this.currentInfo.rates[key].value) || !regex.test(this.currentInfo.rates[key].min)) {
                    return true;
                }
            }
            return false;
        },
        async deleteRate(index) {
            if(!this.fullInfo[index]._id) {
                return this.cancelEdition(index);
            }
            try {
                if(!this.isClient && !this.isVendor) {
                    await this.deletePriceRate({id: this.fullInfo[index]._id, prop: this.rateForm});
                } else {
                    this.isClient ? await this.deleteClientRate({...this.currentInfo, rates, prop: this.rateForm})
                        : await this.deleteVendorRate({...this.currentInfo, rates, prop: this.rateForm})    
                }
                this.$emit("refreshRates");
                this.cancelEdition();
            } catch(err) { }
        },
        async save() {
            const rates = Object.keys(this.currentInfo.rates).reduce((prev, cur) => {
                const value = +this.currentInfo.rates[cur].value;
                const min = +this.currentInfo.rates[cur].min;
                prev[cur] = {...this.currentInfo.rates[cur], value, min};
                return {...prev};
            }, {})
            if(!this.isClient && !this.isVendor) {
                await this.savePricelistRates({...this.currentInfo, rates, prop: this.rateForm, stepsIds: this.stepsIds});
            } else {
                this.isClient ? await this.saveClientRates({...this.currentInfo, rates, prop: this.rateForm, stepsIds: this.stepsIds})
                    : await this.saveVendorRates({...this.currentInfo, rates, prop: this.rateForm, stepsIds: this.stepsIds})
            }
            this.$emit("refreshRates");
            this.cancelEdition();
        },
        cancelEdition(index) {
            this.currentActive = -1;
            if(index && !this.fullInfo[index]._id) {
                this.fullInfo.pop();
            }
            this.currentInfo = null;
        },
        setSource({lang}) {
            this.currentInfo.source = lang;
        },
        setTarget({lang}) {
            this.currentInfo.target = lang;
        },
        setPackage({option}) {
            this.currentInfo.packageSize = option;
        },
        setIndustry({industry}) {
            this.currentInfo.industries = this.currentInfo.industries.filter(item => item.name !== 'All');
            const position = this.industriesNames.indexOf(industry.name);
            if(position === -1) {
                this.currentInfo.industries.push(industry);
            } else {
                this.currentInfo.industries.splice(position, 1);
            }
            if(!this.currentInfo.industries.length || industry.name === 'All') {
                this.currentInfo.industries = [{name: "All"}];
            }
        },
        setEditingData(index) {
            this.currentActive = index;
            const stringifiedCopy = JSON.stringify(this.fullInfo[index]);
            this.currentInfo = JSON.parse(stringifiedCopy);
            if(this.isAllIndusties(this.currentInfo.industries)) {
                this.currentInfo.industries = [{name: "All"}]
            }
        },
        isAllIndusties(rateIndustries) {
            const rateIndustriesIds = rateIndustries.map(item => item._id).sort();
            return JSON.stringify(rateIndustriesIds) === JSON.stringify(this.industries);
        },
        isTogglerActive(rowRates, stepId, index) {
            return this.currentActive === index ? this.currentInfo.rates[stepId].active : rowRates[stepId].active;
        },
        closeErrors() {
            this.areErrors = false;
            this.errors = [];
        }
    },
    computed: {
        tableFields() {
            let fields = this.fields.map(item => item);
            fields = fields.filter(item => !item.isStepTitle);
            for(let i = 0; i < this.selectedSteps.length; i++) {
                fields.splice(-1, 0,{
                    label: this.selectedSteps[i].title, 
                    headerKey: `headerStep${i+1}`, 
                    key: this.selectedSteps[i].symbol, 
                    width: 233, 
                    padding: "0", 
                    isStepTitle: true
                })
            }
            return fields;
        },
        stepsIds() {
            return this.selectedSteps.map(item => item._id);
        },
        industriesNames() {
            return this.currentInfo.industries.map(item => item.name);
        },
        isAllChecked() {
            const unChecked = this.fullInfo.length ? this.fullInfo.find(item => !item.isChecked) : true;
            return !unChecked;
        }
    },
    mounted() {
        this.domain = __WEBPACK__API_URL__;
    }
}
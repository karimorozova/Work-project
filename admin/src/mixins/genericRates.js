export default {
    data() {
        return {
            isAllChecked: false,
            sourceSelect: ["EN-GB"],
            targetSelect: ["All"],
            packageFilter: ["All"],
            industryFilter: [{name: "All"}],
            industrySelected: [{name: 'All'}],
            selectedSteps: [{}],
            defaultStep: {},
            industries: [],
            packages: [],
            actions: ["Delete"],
            selectedAction: "",
            isImportRates: false
        }
    },
    methods: {
        setAction({option}) {
            this.selectedAction = option;
        },
        closeModal() {
            this.selectedAction = "";
        },
        showImportRates() {
            this.isImportRates = true;
        },
        closeImportRates() {
            this.isImportRates = false;
        },
        async approveAction() {
            if(this.selectedAction === "Delete") {
                try {
                    await this.deleteChecked();
                } catch(err) {
                    this.alertToggle({message: 'Internal serer error. Cannot delete rates.', isShow: true, type: 'error'});
                }
            }
            this.closeModal();
        },
        async deleteChecked() {
            const checked = this.fullInfo.filter(item => item.isChecked);
            if(!checked.length) return;
            const checkedIds = checked.map(item => item._id);
            try {
                await this.deletePriceRates({checkedIds, prop: this.rateForm});
                this.refreshRates();
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot delete rates.', isShow: true, type: 'error'});
            }
        },
        setStepsFilter({option}) {        
            const index = this.selectedSteps.findIndex(item => item.title === option);
            const step = this.vuexSteps.find(item => item.title === option);
            this.changeFilter({index, mainProp: 'selectedSteps', option: step});
            if(!this.selectedSteps.length) {
                return this.selectedSteps = [this.defaultStep];
            }
            this.selectedSteps.sort((a, b) => {
                if(a.title > b.title) return 1;
                if(a.title < b.title) return -1;
            });
        },
        async addSeveralRates({ratesData}) {
            try {
                await this.addSeveralMonoRates({ratesData});
                this.refreshRates();
                this.isImportRates = false;
            } catch(err) { }
        },
        refreshRates() {
            this.sourceSelect = ["All"];
            this.targetSelect = ["All"];
            this.packageFilter = ["All"];
            this.industryFilter = [{name: "All"}];
            const prop = this.rateForm;
            this.storePriceRates({prop, value: this.currentPrice[prop]});             
            this.setAllSteps();
        },
        async setDefaultStep() {
            try {
                if(!this.vuexSteps.length) {
                    await this.getSteps();
                }
            } catch(err) { }
            this.defaultStep = this.vuexSteps.find(item => {
                return item.symbol === this.defaultStepSymbol;
            });
            this.selectedSteps = [this.defaultStep];
            this.setAllSteps();
        },
        setAllSteps() {
            const stepIds = this.vuexSteps.filter(item => item.calculationUnit === this.calcUnit).map(item => item._id);
            this.setAllStepsForRates({prop: this.rateForm, stepIds});
        },
        defaultRates() {
            const packageSteps = this.vuexSteps.filter(item => item.calculationUnit === this.calcUnit);
            return packageSteps.reduce((prev, cur) => {
                prev[cur._id] = {value: 0, min: 5, active: false};
                return {...prev}
            }, {});
        },
        async getIndustries() {
            try {
                const result = await this.$http.get("/api/industries");
                this.industries = result.body.map(item => item._id).sort();
            } catch(err) {
                this.alertToggle({message: "Erorr on getting Industries", isShow: true, type: "error"});    
            }
        },
        async getPackages() {
            try {
                const result = await this.$http.get("/api/packages");
                this.packages = result.body.map(item => item.size);
                this.packages.unshift("All");
            } catch(err) {

            }
        }
    },
    computed: {
        stepsIds() {
            return this.selectedSteps.map(item => item._id);
        },
        isAnyChecked() {
            return this.fullInfo.find(item => item.isChecked);
        },
        filteredSteps() {
            return this.vuexSteps.filter(item => item.calculationUnit === this.calcUnit).map(item => item.title);
        }
    },
    created() {
        this.setDefaultStep();
        this.getIndustries();
    }
}
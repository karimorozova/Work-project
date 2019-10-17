<template lang="pug">
    .mono-rates
        .mono-rates__filters
            Filters(form="mono" 
                :industriesList="industries"
                :industriesSelect="industriesSelect"
                :industryFilter="industriesNames"
                :targetLanguages="targetLanguages"
                :steps="stepsNames"
                :packages="allPackages"
                :targetSelect="targetSelect"
                :selectedSteps="selectedSteps"
                :packageSelect="packageSelect"
                @setPackageFilter="(e) => setFilter(e, 'packageSelect')"
                @setTargetFilter="(e) => setFilter(e, 'targetSelect')"
                @setIndustryFilter="setIndustryFilter"
                @setStepsFilter="setStepsFilter"
            )
        .mono-rates__rates    
            MonoRatesTable(:rates="sortedRates" :langFilter="targetSelect" :industriesFilter="industriesNames" :packagesFilter="packageSelect")
</template>

<script>
import Filters from "./Filters";
import MonoRatesTable from "./tables/MonoRatesTable";
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            targetSelect: ["All"],
            industriesSelect: [{name: "All"}],
            selectedSteps: ["Copywriting"],
            packageSelect: ["All"]
        }
    },
    methods: {
        setFilter({option}, prop) {
            if(option === "All") return this[prop] = ["All"];
            const position = this[prop].indexOf(option);
            if(position !== -1) {
                this[prop].splice(position, 1);
            } else {
                this[prop] = this[prop].filter(item => item !== "All");
                this[prop].push(option);
            }
            if(!this[prop].length) return this[prop] = ["All"];
        },
        setIndustryFilter({industry}) {
            if(industry.name === "All") return this.industriesSelect = [{name: "All"}];
            const position = this.industriesNames.indexOf(industry.name);
            if(position !== -1) {
                this.industriesSelect.splice(position, 1);
            } else {
                this.industriesSelect = this.industriesSelect.filter(item => item.name !== "All");
                this.industriesSelect.push(industry);
            }
            if(!this.industriesSelect.length) return this.industriesSelect = [{name: "All"}];
        },
        setStepsFilter({option}) {
            const position = this.selectedSteps.indexOf(option);
            if(position !== -1) {
                this.selectedSteps.splice(position, 1);
            } else {
                this.selectedSteps = this.selectedSteps.filter(item => item !== "All");
                this.selectedSteps.push(option);
            }
            if(!this.selectedSteps.length) return this.selectedSteps = ["Copywriting"];
        },
        setDefaultStep() {
            const defaultStep = this.steps.find(item => item.symbol === 'copywriting');
            this.selectedSteps = [defaultStep.title];
        }
    },
    components: {
        Filters,
        MonoRatesTable
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo",
            steps: "getSteps",
            packages: "getPackages"
        }),
        targetLanguages() {
            let result = [];
            const { monoRates } = this.accountInfo;
            if(monoRates.length) {
                result = monoRates.map(item => item.target.lang);
                result = result.filter((item, i, arr) => arr.indexOf(item) === i);
                result.sort((a, b) => {
                    if(a < b) return -1;
                    if(a > b) return 1;
                })
                result.unshift("All");
            }
            return result;
        },
        industries() {
            let result = [...this.accountInfo.industries];
            result.unshift({name: "All"});
            return result;
        },
        industriesNames() {
            return this.industriesSelect.map(item => item.name);
        },
        stepsNames() {
            let result = [];
            if(this.steps.length) {
                result = this.steps.filter(item => item.languageForm === "Mono")
                .map(item => item.title);
            }
            return result;
        },
        allPackages() {
            let result = [...this.packages];
            result.unshift("All");
            return result;
        },
        sortedRates() {
            let result = [...this.accountInfo.monoRates];
            if(result.length) {
                result.sort((a,b) => a.target.lang > b.target.lang ? 1 : -1);
            }
            return result;
        }
    },
    mounted() {
        this.setDefaultStep();
    }
}
</script>

<style lang="scss" scoped>

.mono-rates {
    &__filters {
        padding-bottom: 20px;
        margin-top: 10px;
    }
}

</style>

<template lang="pug">
    .duo-rates
        .duo-rates__filters
            Filters(form="Duo"
                :industriesList="industries"
                :industriesSelect="industriesSelect"
                :industryFilter="industriesNames"
                :targetLanguages="targetLanguages"
                :sourceLanguages="sourceLanguages"
                :steps="stepsNames"
                :targetSelect="targetSelect"
                :sourceSelect="sourceSelect"
                :selectedSteps="selectedSteps"
                @setSourceFilter="(e) => setLangFilter(e, 'sourceSelect')"
                @setTargetFilter="(e) => setLangFilter(e, 'targetSelect')"
                @setIndustryFilter="setIndustryFilter"
                @setServiceFilter="setServiceFilter"
            )
        .duo-rates__rates
            DuoRatesTable(:rates="sortedRates" unit="Hours" :sourceFilter="sourceSelect" :targetFilter="targetSelect" :industriesFilter="industriesNames")
</template>

<script>
import Filters from "./Filters";
import DuoRatesTable from "./tables/DuoRatesTable";
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            targetSelect: ["All"],
            sourceSelect: ["All"],
            industriesSelect: [{name: "All"}],
            selectedSteps: ["Graphic Design"]
        }
    },
    methods: {
        setLangFilter({option}, prop) {
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
        setServiceFilter({option}) {
            const position = this.selectedSteps.indexOf(option);
            if(position !== -1) {
                this.selectedSteps.splice(position, 1);
            } else {
                this.selectedSteps = this.selectedSteps.filter(item => item !== "All");
                this.selectedSteps.push(option);
            }
            if(!this.selectedSteps.length) return this.selectedSteps = ["Graphic Design"];
        },
        setDefaultStep() {
            const defaultStep = this.steps.find(item => item.symbol === 'graphic_design');
            this.selectedSteps = [defaultStep.title];
        }
    },
    components: {
        Filters,
        DuoRatesTable
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo",
            steps: "getSteps"
        }),
        sourceLanguages() {
            let result = [];
            const { hoursRates } = this.accountInfo;
            if(hoursRates.length) {
                result = hoursRates.filter(item => item.source).map(item => item.source.lang);
                result = result.filter((item, i, arr) => arr.indexOf(item) === i);
                result.sort((a, b) => a > b ? 1 : -1);
                result.unshift("All");
            }
            return result;
        },
        targetLanguages() {
            let result = [];
            const { hoursRates } = this.accountInfo;
            if(hoursRates.length) {
                result = hoursRates.map(item => item.target.lang);
                result = result.filter((item, i, arr) => arr.indexOf(item) === i);
                result.sort((a, b) => a > b ? 1 : -1);
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
                result = this.steps.filter(item => item.calculationunit === "Hours")
                .map(item => item.title);
            }
            return result;
        },
        sortedRates() {
            let result = [...this.accountInfo.hoursRates];
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

.duo-rates {
    width: 100%;
    overflow-x: auto;
    &__filters {
        padding-bottom: 20px;
        margin-top: 10px;
    }
}

</style>

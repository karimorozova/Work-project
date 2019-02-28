<template lang="pug">
    .duo-rates
        .duo-rates__filters
            Filters(form="Duo"
                :industriesList="industries"
                :industriesSelect="industriesSelect"
                :industryFilter="industriesNames"
                :targetLanguages="targetLanguages"
                :sourceLanguages="sourceLanguages"
                :services="servicesNames"
                :targetSelect="targetSelect"
                :sourceSelect="sourceSelect"
                :serviceSelect="serviceSelect"
                @setSourceFilter="(e) => setLangFilter(e, 'sourceSelect')"
                @setTargetFilter="(e) => setLangFilter(e, 'targetSelect')"
                @setIndustryFilter="setIndustryFilter"
                @setServiceFilter="setServiceFilter"
            )
        .duo-rates__rates
            DuoRatesTable(:sourceFilter="sourceSelect" :targetFilter="targetSelect" :industriesFilter="industriesNames")
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
            serviceSelect: ["Translation"],
            duoServicesFilter: ["tr", "pr", "qt"]
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
            const position = this.serviceSelect.indexOf(option);
            if(position !== -1) {
                this.serviceSelect.splice(position, 1);
            } else {
                this.serviceSelect = this.serviceSelect.filter(item => item !== "All");
                this.serviceSelect.push(option);
            }
            if(!this.serviceSelect.length) return this.serviceSelect = ["Translation"];
        },
        setDefaultService() {
            const defaultService = this.services.find(item => item.symbol === 'tr');
            this.serviceSelect = [defaultService.title];
        }
    },
    components: {
        Filters,
        DuoRatesTable
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo",
            services: "getServices"
        }),
        sourceLanguages() {
            let result = [];
            const { languageCombinations } = this.accountInfo;
            if(languageCombinations.length) {
                result = languageCombinations.filter(item => item.source).map(item => item.source.lang);
                result = result.filter((item, i, arr) => arr.indexOf(item) === i);
                result.sort((a, b) => {
                    if(a < b) return -1;
                    if(a > b) return 1;
                })
                result.unshift("All");
            }
            return result;
        },
        targetLanguages() {
            let result = [];
            const { languageCombinations } = this.accountInfo;
            if(languageCombinations.length) {
                result = languageCombinations.map(item => item.target.lang);
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
        servicesNames() {
            let result = [];
            if(this.services.length) {
                result = this.services.filter(item => item.languageForm === "Duo" && this.duoServicesFilter.indexOf(item.symbol) !== -1)
                .map(item => item.title);
            }
            return result;
        }
    },
    mounted() {
        this.setDefaultService();
    }
}
</script>

<style lang="scss" scoped>

.duo-rates {
    &__filters {
        padding-bottom: 20px;
        margin-top: 10px;
    }
}

</style>

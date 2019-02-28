<template lang="pug">
    .mono-rates
        .mono-rates__filters
            Filters(form="mono" 
                :industriesList="industries"
                :industriesSelect="industriesSelect"
                :industryFilter="industriesNames"
                :targetLanguages="targetLanguages"
                :services="servicesNames"
                :packages="allPackages"
                :targetSelect="targetSelect"
                :serviceSelect="serviceSelect"
                :packageSelect="packageSelect"
                @setPackageFilter="(e) => setFilter(e, 'packageSelect')"
                @setTargetFilter="(e) => setFilter(e, 'targetSelect')"
                @setIndustryFilter="setIndustryFilter"
                @setServiceFilter="setServiceFilter"
            )
        .mono-rates__rates    
            MonoRatesTable(:langFilter="targetSelect" :industriesFilter="industriesNames" :packagesFilter="packageSelect")
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
            serviceSelect: ["Copywriting"],
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
        setServiceFilter({option}) {
            const position = this.serviceSelect.indexOf(option);
            if(position !== -1) {
                this.serviceSelect.splice(position, 1);
            } else {
                this.serviceSelect = this.serviceSelect.filter(item => item !== "All");
                this.serviceSelect.push(option);
            }
            if(!this.serviceSelect.length) return this.serviceSelect = ["Copywriting"];
        },
        setDefaultService() {
            const defaultService = this.services.find(item => item.symbol === 'co');
            this.serviceSelect = [defaultService.title];
        }
    },
    components: {
        Filters,
        MonoRatesTable
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo",
            services: "getServices",
            packages: "getPackages"
        }),
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
                result = this.services.filter(item => item.languageForm === "Mono")
                .map(item => item.title);
            }
            return result;
        },
        allPackages() {
            let result = this.packages;
            result.unshift("All");
            return result;
        }
    },
    mounted() {
        this.setDefaultService();
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

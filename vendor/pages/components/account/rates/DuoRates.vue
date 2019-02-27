<template lang="pug">
    .duo-rates
        Filters(form="Duo"
            :industriesList="industries"
            :industriesSelect="industriesSelect"
            :industryFilter="industriesNames"
            :targetLanguages="targetLanguages"
            :sourceLanguages="sourceLanguages"
            :services="services"
            :targetSelect="targetSelect"
            :sourceSelect="sourceSelect"
            :serviceSelect="serviceSelect"
            @setSourceFilter="setSourceFilter"
            @setTargetFilter="setTargetFilter"
            @setIndustryFilter="setIndustryFilter"
            @setServiceFilter="setServiceFilter"
        )
</template>

<script>
import Filters from "./Filters";
import { mapGetters } from "vuex";

export default {
    props: {
        services: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            targetSelect: ["All"],
            sourceSelect: ["All"],
            industriesSelect: [{name: "All"}],
            serviceSelect: ["Translation"],
        }
    },
    methods: {
        setSourceFilter({option}) {
            if(option === "All") return this.sourceSelect = ["All"];
            const position = this.sourceSelect.indexOf(option);
            if(position !== -1) {
                this.sourceSelect.splice(position, 1);
            } else {
                this.sourceSelect = this.sourceSelect.filter(item => item !== "All");
                this.sourceSelect.push(option);
            }
            if(!this.sourceSelect.length) return this.sourceSelect = ["All"];
        },
        setTargetFilter({option}) {
            if(option === "All") return this.targetSelect = ["All"];
            const position = this.targetSelect.indexOf(option);
            if(position !== -1) {
                this.targetSelect.splice(position, 1);
            } else {
                this.targetSelect = this.targetSelect.filter(item => item !== "All");
                this.targetSelect.push(option);
            }
            if(!this.targetSelect.length) return this.targetSelect = ["All"];
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
        }
    },
    components: {
        Filters
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo"
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
        }
    }
}
</script>

<style lang="scss" scoped>

</style>

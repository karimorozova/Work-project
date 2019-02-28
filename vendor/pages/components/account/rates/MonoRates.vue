<template lang="pug">
    .mono-rates
        Filters(form="mono" 
            :industriesList="industries"
            :industriesSelect="industriesSelect"
            :industryFilter="industriesNames"
            :targetLanguages="targetLanguages"
            :services="services"
            :targetSelect="targetSelect"
            :serviceSelect="serviceSelect"
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
            industriesSelect: [{name: "All"}],
            serviceSelect: ["Copywriting"],
        }
    },
    methods: {
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
            if(!this.serviceSelect.length) return this.serviceSelect = ["Copywriting"];
        }
    },
    components: {
        Filters
    },
    computed: {
        ...mapGetters({
            accountInfo: "getAccountInfo"
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
        }
    }
}
</script>

<style lang="scss" scoped>

</style>

<template lang="pug">
    .lqa-vendors
        .lqa-vendors__filters
            Filters(
                :isTarget="false"
                :languages="languages"
                :industryFilter="industryFilter"
                :tierFilter="tierFilter"
                :lqaFilter="lqaFilter"
                :nameFilter="nameFilter"
                @setNameFilter="(e) => setFilter(e, 'nameFilter')"
                @setIndustryFilter="(e) => setFilter(e, 'industryFilter')"
                @setTierFilter="(e) => setFilter(e, 'tierFilter')"
                @setLqaFilter="(e) => setFilter(e, 'lqaFilter')"
            )
        .lqa-vendors__table
            Table(:vendorsData="allVendors")
</template>

<script>
import Filters from "../Filters";
import Table from "./Table";
import { mapActions } from "vuex";

export default {
    props: {
        languages: {type: Array, default: () => []}
    },
    data() {
        return {
            reportData: [],
            nameFilter: "",
            industryFilter: "All",
            tierFilter: "All",
            lqaFilter: "All"
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/xtrf-lqa-report", { filters: this.filters });
                this.reportData = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting LQA report", isShow: true, type: "error"});
            }
        },
        async setFilter({value}, prop) {
            this[prop] = value;
            await this.getReport();
        },
    },
    computed: {
        allVendors() {
            let result = [];
            if(this.reportData.length) {
                for(let report of this.reportData) {
                    let vendors = [...report.financeVendors, ...report.gamingVendors];
                    vendors = vendors.filter(item => item.isLqa1 || item.isLqa2 || item.isLqa3);
                    result.push(...vendors);
                }
            }
            return result;
        },
        filters() {
            let result = {nameFilter: this.nameFilter};
            if(this.industryFilter !== 'All') {
                result.industryFilter = this.industryFilter;
            }
            if(this.tierFilter !== 'All') {
                result.tierFilter = +this.tierFilter;
            }
            if(this.lqaFilter !== 'All') {
                result.lqaFilter = this.lqaFilter;
            }
            return result;
        }
    },
    components: {
        Filters,
        Table
    },
    mounted() {
        this.getReport();
    }
}
</script>

<style lang="scss" scoped>

.lqa-vendors {
    box-sizing: border-box;
    padding: 40px;
}

</style>

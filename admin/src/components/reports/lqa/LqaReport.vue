<template lang="pug">
    .lqa
        .lqa__filters
            Filters(
                :languages="languages"
                :targetFilter="targetFilter"
                :industryFilter="industryFilter"
                :tierFilter="tierFilter"
                :nameFilter="nameFilter"
                @setNameFilter="(e) => setFilter(e, 'nameFilter')"
                @setTargetFilter="setTargetFilter"
                @setIndustryFilter="(e) => setFilter(e, 'industryFilter')"
                @setTierFilter="(e) => setFilter(e, 'tierFilter')"
            )
        .lqa__language(v-for="report in reportData")
            h3.lga__text Target Language: {{ report.target }}
            .lqa__industry(v-if="report.financeVendors.length")
                h4.lqa__text Industry: Finance,  Tier {{ report.finance }}
                Table(:vendorsData="report.financeVendors" field="Finance")
            .lqa__industry(v-if="report.gamingVendors.length")
                h4.lqa__text Industry: iGaming,  Tier {{ report.game }}
                Table(:vendorsData="report.gamingVendors" field="iGaming")
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
            reportData: null,
            nameFilter: "",
            targetFilter: ["All"],
            industryFilter: "All",
            tierFilter: "All"
        }
    },
    methods: {
        ...mapActions(['alertToggle']),
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/xtrf-lqa-report" ,{ type: "lqa", filters: this.filters});
                this.reportData = result.body;
            } catch(err) {
                this.alertToggle({message: "Error on getting LQA report", isShow: true, type: "error"});
            }
        },
        async setFilter({value}, prop) {
            this.nameFilter = value;
            await this.getReport();
        },
        async setFilter({value}, prop) {
            this[prop] = value;
            await this.getReport();
        },
        async setFilter({value}, prop) {
            this[prop] = value;
            await this.getReport();
        },
        async setTargetFilter({lang}) {
            if(lang !== 'All') {
                this.targetFilter = this.targetFilter.filter(item => item !== 'All');
                const position = this.targetFilter.indexOf(lang);
                if(position === -1) {
                    this.targetFilter.push(lang);
                    return await this.getReport();
                }
                this.targetFilter.splice(position, 1);
            }
            this.targetFilter = !this.targetFilter.length || lang === 'All' ? ["All"] : this.targetFilter;
            await this.getReport();
        },
    },
    computed: {
        filters() {
            let result = {nameFilter: this.nameFilter};
            if(this.targetFilter[0] !== 'All') {
                result.targetFilter = this.targetFilter;
            }
            if(this.industryFilter !== 'All') {
                result.industryFilter = this.industryFilter;
            }
            if(this.tierFilter !== 'All') {
                result.tierFilter = +this.tierFilter;
            }
            return result;
        },
        targetFilterSymbols() {
            return this.targetFilter.map(item => item.symbol);
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

h3, h4 {
    margin: 0;
    padding: 0;
}

.lqa {
    box-sizing: border-box;
    padding: 40px;
    &__text {
        margin: 10px 0 5px;
    }
    &__language {
        margin-top: 40px;
    }
}

</style>

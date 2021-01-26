<template lang="pug">
    .benchmark
        .benchmark__filters
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
                @showNewVendorForm="showNewVendorForm"
            )
        .benchmark__languages
            .benchmark__language(v-for="report in reportData")
                h3.benchmark__text Target Language: {{ report.target }}
                .benchmark__industry
                    h4.benchmark__text Industry: Finance,  Tier {{ report.industries.industry }}, Benchmark &euro; {{ getPrice(report.prices, 'report.industries.industry') }}
                    Table(:vendorsData="report.financeReports" :benchmarkPrice="getPrice(report.prices, 'Finance')" field="Finance")
                .benchmark__industry(v-if="report.gamingReports.length")
                    h4.benchmark__text Industry: iGaming,  Tier {{ report.game }}, Benchmark &euro; {{ getPrice(report.prices, 'iGaming') }}
                    Table(:vendorsData="report.gamingReports" :benchmarkPrice="getPrice(report.prices, 'iGaming')" field="iGaming")
        .benchmark__form(v-if="isNewVendorForm")
            NewVendor(:languages="allXtrfLangs" @close="closeForm" @saveVendor="saveVendor")
</template>

<script>
import Filters from "../Filters";
import Table from "./Table";
import NewVendor from "../NewVendor";
import newXtrfVendor from "@/mixins/newXtrfVendor";

export default {
    mixins: [newXtrfVendor],
    props: {
        allXtrfLangs: {type: Array, default: () => []}
    },
    data() {
        return {
            reportData: null,
            nameFilter: "",
            targetFilter: ["All"],
            industryFilter: "All",
            tierFilter: "All",
            languages: [],
            isLanguages: true
        }
    },
    methods: {
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/vendor-benchmark-cost" ,{ filters: this.filters});
              // console.log(result.body)
                this.reportData = result.body;
                if(this.isLanguages) {
                    this.languages = this.reportData.map(item => item.target);
                    this.languages.unshift("All");
                }
                this.isLanguages = false;
            } catch(err) {
                this.alertToggle({message: "Error on getting LQA report", isShow: true, type: "error"});
            }
        },
        getPrice(prices, prop) {
            return prices ? +prices[prop] : 0;
        },
        async setFilter({value}, prop) {
            this.nameFilter = value;
            await this.getReport();
        },
        // async setFilter({value}, prop) {
        //     this[prop] = value;
        //     await this.getReport();
        // },
        // async setFilter({value}, prop) {
        //     this[prop] = value;
        //     await this.getReport();
        // },
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
        }
    },
    components: {
        Filters,
        Table,
        NewVendor
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

.benchmark {
    box-sizing: border-box;
    padding: 40px;
    position: relative;
    &__text {
        margin: 10px 0 5px;
    }
    &__languages {
        width: 30%;
        max-height: 680px;
        overflow-y: auto;
        margin-top: 40px;
    }
    &__form {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
}

</style>

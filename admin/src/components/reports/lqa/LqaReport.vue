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
        .lqa__languages
            .lqa__language(v-for="report in reportData")
                div(v-if="report !== null")
                    h3.lga__text Target Language: {{ report.target }}
                    .lqa__group-industries(v-if="report.finance")
                        .lqa__industry(v-if="report.finance.vendors.length")
                            h4.lqa__text Industry: Finance
                            Table(:vendorsData="report.finance.vendors" field="Finance" :tier="String(report.finance.tier)")
                    .lqa__group-industries(v-if="report.gaming")
                        .lqa__industry(v-if="report.gaming.vendors.length")
                            h4.lqa__text Industry: iGaming
                            Table(:vendorsData="report.gaming.vendors" field="iGaming" :tier="String(report.gaming.tier)")
                    .lqa__group-industries(v-if="report.other")
                        .lqa__industry(v-if="report.other.vendors.length")
                            h4.lqa__text Industry: Others
                            Table(:vendorsData="report.other.vendors" field="Others" :tier="String(report.other.tier)")
            .lqa__form(v-if="false")
                NewVendor(:languages="allXtrfLangs" @close="closeForm" @saveVendor="saveVendor")
</template>

<script>
import Filters from "../Filters";
import NewVendor from "../NewVendor";
import Table from "./Table";
import { mapActions } from "vuex";
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
            allLangs: [],
            isLanguages: true
        }
    },
    methods: {
        ...mapActions(['alertToggle']),
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/xtrf-lqa-report", { filters: this.filters });
                this.reportData = result.data;
                
                const languages = await this.$http.get("/api/languages");
                this.allLangs = languages.data;

                if (this.isLanguages) {
                    this.languages = [...new Set(languages.data.map(item => item.group))];
                    this.languages.unshift("All");
                }

                this.isLanguages = false;
            } catch(err) {
                this.alertToggle({message: "Error on getting LQA report", isShow: true, type: "error"});
            }
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
        }
    }, 
    computed: {
        filters() {
            let result = { nameFilter: this.nameFilter };
            if (this.targetFilter[0] !== "All") {
                let languageArray = [];

                this.targetFilter.forEach(element => {
                    languageArray.push(
                        this.allLangs
                        .filter(item => item.group == element)
                        .map(item => item.lang)
                        .join()
                    );
                });
                result.targetFilter = languageArray.toString().split(',');
            }
            if (this.industryFilter !== "All") {
                result.industryFilter = this.industryFilter;
            }
            if (this.tierFilter !== "All") {
                result.tierFilter = +this.tierFilter;
            }
            return result;
        }
    },
    components: {
        Filters,
        NewVendor,
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
    position: relative;
    &__text {
        margin: 10px 0 5px;
    }
    &__languages {
        width: 70%;
        max-height: 680px;
        overflow-y: auto;
        margin-top: 40px;
    }
    &__language{
        padding-top: 20px;
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

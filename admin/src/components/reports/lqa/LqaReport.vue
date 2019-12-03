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
                @showNewVendorForm="showNewVendorForm"
            )
        .lqa__languages
            .lqa__language(v-for="report in reportData")
                h3.lga__text Target Language: {{ report.target }}
                .lqa__industry(v-if="report.financeVendors.length")
                    h4.lqa__text Industry: Finance,  Tier {{ report.finance }}
                    Table(:vendorsData="report.financeVendors" field="Finance")
                .lqa__industry(v-if="report.gamingVendors.length")
                    h4.lqa__text Industry: iGaming,  Tier {{ report.game }}
                    Table(:vendorsData="report.gamingVendors" field="iGaming")
            .lqa__form(v-if="isNewVendorForm")
                NewVendor(:languages="languages" @close="closeForm" @saveVendor="saveVendor")
</template>

<script>
import Filters from "../Filters";
import NewVendor from "../NewVendor";
import Table from "./Table";
import { mapActions } from "vuex";
import newXtrfVendor from "@/mixins/newXtrfVendor";

export default {
    mixins: [newXtrfVendor],
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
        ...mapActions(['alertToggle']),
        async getReport() {
            try {
                const result = await this.$http.post("/reportsapi/xtrf-lqa-report", { filters: this.filters });
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
    &__form {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
}

</style>

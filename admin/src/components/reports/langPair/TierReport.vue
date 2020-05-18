<template lang="pug">
    .tier
        .tier__filters
            Filters(
                :isLqa="false"
                :languages="languages"
                :targetFilter="targetFilter"
                :tierFilter="tierFilter"
                @setTierFilter="setTierFilter"
                @setTargetFilter="setTargetFilter"
            )
        .tier__table
            DataTable(
                :fields="fields"
                :tableData="reportData"
                bodyClass="height-700"
                @onRowClicked="showInfo"
            )
                .tier__header(slot="headerTarget" slot-scope="{ field }") {{ field.label }}
                .tier__header(slot="headerAll" slot-scope="{ field }") {{ field.label }}
                    img.tier__icon(
                        :class="{'tier_rotated': isAllSorted}"
                        src="../../../assets/images/open-arrow_white.png"
                        @click="sortData('allTier', 'isAllSorted')")
                .tier__header(slot="headerFin" slot-scope="{ field }") {{ field.label }}
                    img.tier__icon(
                        :class="{'tier_rotated': isFinanceSorted}"
                        src="../../../assets/images/open-arrow_white.png"
                        @click="sortData('financeTier', 'isFinanceSorted')")
                .tier__header(slot="headerGame" slot-scope="{ field }") {{ field.label }}
                    img.tier__icon(
                        :class="{'tier_rotated': isGamingSorted}"
                        src="../../../assets/images/open-arrow_white.png"
                        @click="sortData('gameTier', 'isGamingSorted')")
                .tier__data(slot="target" slot-scope="{ row }") {{ row.target }}
                template(slot="all" slot-scope="{ row, index }")
                    .tier__data(v-if="activeIndex !== index") Tier {{ row.allTier.tier }}
                    .tier__data.tier_orange(v-else) Clients - {{ row.allTier.clients }}; &nbsp; &nbsp; Words - {{ row.allTier.wordcount }}
                template(slot="fin" slot-scope="{ row, index }")
                    .tier__data(v-if="activeIndex !== index") Tier {{ row.financeTier.tier }}
                    .tier__data.tier_orange(v-else) Clients - {{ row.financeTier.clients }}; &nbsp; &nbsp; Words - {{ row.financeTier.wordcount }}
                template(slot="game" slot-scope="{ row, index }")
                    .tier__data(v-if="activeIndex !== index") Tier {{ row.gameTier.tier }}
                    .tier__data.tier_orange(v-else) Clients - {{ row.gameTier.clients }}; &nbsp; &nbsp; Words - {{ row.gameTier.wordcount }}
</template>

<script>
import DataTable from "@/components/DataTable";
import Filters from "../Filters";
import { mapActions } from "vuex";

export default {
    props: {
        allXtrfLangs: {type: Array, default: () => []}
    },
    data() {
        return {
            fields: [
                {label: "Target Language", headerKey: "headerTarget", key: "target", width: "25%"},
                {label: "All Industries", headerKey: "headerAll", key: "all", width: "25%"},
                {label: "Financial Industries", headerKey: "headerFin", key: "fin", width: "25%"},
                {label: "Gaming Industries", headerKey: "headerGame", key: "game", width: "25%"}
            ],
            reportData: [],
            isAllSorted: false,
            isFinanceSorted: false,
            isGamingSorted: false,
            tierFilter: "All",
            targetFilter: ["All"],
            activeIndex: -1,
            allLangs: [],
            languages: [],
            isLanguages: true,

        }
    },
    methods: {
        ...mapActions(['alertToggle']),
        async getReport() {
            this.activeIndex = -1;
            try {
                const result = await this.$http.post("/reportsapi/xtrf-tier-report", { filters: this.filters });
                this.reportData = result.body;

                const languages = await this.$http.get("/api/languages");
                this.allLangs = languages.data;

                if (this.isLanguages) {
                    this.languages = [...new Set(languages.data.map(item => item.group))];
                    this.languages.unshift("All");
                }

                this.isLanguages = false;
                
            } catch(err) {
                this.alertToggle({message: "Error on getting tier report", isShow: true, type: "error"});
            }
        },
        sortData(tierProp, prop) {
            this.activeIndex = -1;
            this[prop] = !this[prop];
            if(this[prop]) {
                this.reportData = this.reportData.sort((a,b) => a[tierProp].tier - b[tierProp].tier || b[tierProp].wordcount/6 - a[tierProp].wordcount/6);
            } else {
                this.reportData = this.reportData.sort((a,b) => b[tierProp].tier - a[tierProp].tier || a[tierProp].wordcount/6 - b[tierProp].wordcount/6);
            }
        },
        async setTierFilter({value}) {
            this.tierFilter = value;
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
        showInfo({index}) {
            this.activeIndex = this.activeIndex === index ? -1 : index;
        }
    },
    computed: {
        filters() {
            let result = {};
            if(this.targetFilter[0] !== 'All') {
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
            if(this.tierFilter !== 'All') {
                result.tierFilter = +this.tierFilter;
            }
            return result;
        }
    },
    components: {
        DataTable,
        Filters
    },
    mounted() {
        this.getReport();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.tier {
    box-sizing: border-box;
    padding: 40px;
    &__filters {
        margin-bottom: 20px;
    }
    &__table {
        width: 70%;
        position: relative;
    }
    &__icon {
        margin-left: 10px;
        cursor: pointer;
    }
    &__average {
        position: absolute;
        z-index: 20;
    }
    &_rotated {
        transform: rotate(180deg);
    }
    &_orange {
        color: $orange;
    }
}

</style>

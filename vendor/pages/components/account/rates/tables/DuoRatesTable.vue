<template lang="pug">
    .duo-table 
        DataTable(
            :fields="fields"
            :tableData="filteredRates"
            bodyClass="tbody_height-150"
            :isRateTable="true"
        )
            template(slot="headSource" slot-scope="{ field }")
                .duo-table__header {{ field.label }}
            template(slot="headTarget" slot-scope="{ field }")
                .duo-table__header {{ field.label }}
            template(slot="headIndustry" slot-scope="{ field }")
                .duo-table__header {{ field.label }}
            template(v-for="(step, stepIndex) in ratesSteps" :slot="'headStep'+(stepIndex+1)" slot-scope="{ field }")
                .duo-table__header {{ field.label }}
            template(slot="sourceLanguage" slot-scope="{ row, index }")
                .duo-table__data {{ row.source.lang }}
            template(slot="targetLanguage" slot-scope="{ row, index }")
                .duo-table__data {{ row.target.lang }}
            template(slot="industry" slot-scope="{ row, index }")
                .duo-table__data
                    .duo-table__industry-data(v-if="isAllIndusties(row.industries)") All
                    .duo-table__industry-data(v-else)
                        img.duo-table__image(v-for="elem of row.industries" :src="domain+elem.icon")
            template(v-for="step in ratesSteps" :slot="step.symbol" slot-scope="{ row, index }")
                .duo-table__data.duo-table_spaced
                    span.duo-table__rate(v-if="row.rates[step._id].value") {{ row.rates[step._id].value }} &euro;
                    span.duo-table__rate(v-else) - 
                    span.duo-table__rate min - {{ row.rates[step._id].min }} &euro;
                    span.duo-table__rate.duo-table_green(v-if="row.rates[step._id].active") active
                    span.duo-table__rate.duo-table_orange(v-else) inactive
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DataTable from "@/components/Tables/DataTable";

export default {
    props: {
        sourceFilter: {
            type: Array,
            default: () => []
        },
        industriesFilter: {
            type: Array,
            default: () => []
        },
        targetFilter: {
            type: Array,
            default: () => []
        },
        rates: {
            type: Array,
            default: () => []
        },
        unit: {
            type: String,
            default: "Words"
        }
    },
    data() {
        return {
            fields: [
                {label: "Source Language", headerKey: "headSource", key: "sourceLanguage", width: "188px", padding: "0"},
                {label: "Target Language", headerKey: "headTarget", key: "targetLanguage", width: "188px", padding: "0"},
                {label: "Industry", headerKey: "headIndustry", key: "industry", width: "163px", padding: "0"},
                {label: "", headerKey: "headStep1", key: "", width: "229px", padding: "0", isStepTitle: true}
            ],
            domain: ""
        }
    },
    methods: {
        ...mapActions(["alertToggle"]),
        isAllIndusties(rateIndustries) {
            const rateIndustriesIds = rateIndustries.map(item => item._id).sort();
            const accountIndustriesIds = this.vendor.industries.map(item => item._id).sort();
            return JSON.stringify(rateIndustriesIds) === JSON.stringify(accountIndustriesIds);
        }
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor",
            steps: "getSteps"
        }),
        filteredRates() {
            let result = this.rates;
            if(this.sourceFilter.length && this.sourceFilter[0] !== "All") {
                result = result.filter(item => this.sourceFilter.indexOf(item.source.lang) !== -1);
            }
            if(this.targetFilter.length && this.targetFilter[0] !== "All") {
                result = result.filter(item => this.targetFilter.indexOf(item.target.lang) !== -1);
            }
            if(this.industriesFilter.length && this.industriesFilter[0] !== "All") {
                result = result.filter(item => {
                    const industry = item.industries.find(indus => this.industriesFilter.indexOf(indus.name) !== -1);
                    return !!industry;
                });
            }
            return result;
        },
        ratesSteps() {
            return this.steps.filter(item => item.calculationUnit === this.unit);
        },
        stepsIds() {
            return this.steps.filter(item => item.calculationUnit === this.unit).map(item => item._id);
        },
        // tableFields() {
        //     let fields = this.fields.map(item => item);
        //     fields = fields.filter(item => !item.isStepTitle);
        //     for(let i = 0; i < this.ratesSteps.length; i++) {
        //         fields.push({
        //             label: this.ratesSteps[i].title,
        //             headerKey: `headStep${i+1}`,
        //             key: this.ratesSteps[i].symbol,
        //             width: "229px",
        //             padding: "0",
        //             isStepTitle: true
        //         })
        //     }
        //     return fields;
        // },
    },
    components: {
        DataTable
    },
    mounted() {
        this.domain = process.env.domain;
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors.scss";

.duo-table {
    &_flex {
        display: flex;
        justify-content: space-around;
    }
    &__data {
        height: 28px;
        padding: 0 5px; 
        display: flex;
        align-items: center;
        box-sizing: border-box;
    }
    &__industry-data {
        display: flex;
        align-items: center;
        position: relative;
    }
    &__image {
        max-width: 20px;
        margin-right: 3px
    }
    &__rate {
        width: 30%;
        text-align: right;
        &:first-child {
            width: 25%;
            text-align: left;
        }
    }
    &_orange {
        color: $orange;
    }
    &_green {
        color: $green;
    }
    &_spaced {
        justify-content: space-between;
    }
}

</style>

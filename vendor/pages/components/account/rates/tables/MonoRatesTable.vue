<template lang="pug">
    .mono-table 
        DataTable(
            :fields="fields"
            :tableData="filteredRates"
            bodyClass="tbody_height-150"
            :isRateTable="true"
        )
            template(slot="headLanguage" slot-scope="{ field }")
                .mono-table__header {{ field.label }}
            template(slot="headPackage" slot-scope="{ field }")
                .mono-table__header {{ field.label }}
            template(slot="headIndustry" slot-scope="{ field }")
                .mono-table__header {{ field.label }}
            template(v-for="(step, stepIndex) in packagesSteps" :slot="'headStep'+(stepIndex+1)" slot-scope="{ field }")
                .mono-table__header {{ field.label }}
            template(slot="language" slot-scope="{ row, index }")
                .mono-table__data {{ row.target.lang }}
            template(slot="package" slot-scope="{ row, index }")
                .mono-table__data {{ row.packageSize }}
            template(slot="industry" slot-scope="{ row, index }")
                .mono-table__data
                    .mono-table__industry-data(v-if="isAllIndusties(row.industries)") All
                    .mono-table__industry-data(v-else)
                        img.mono-table__image(v-for="elem of row.industries" :src="domain+elem.icon")
            template(v-for="step in packagesSteps" :slot="step.symbol" slot-scope="{ row, index }")
                .mono-table__data.mono-table_spaced
                    span.mono-table__rate(v-if="row.rates[step._id].value") {{ row.rates[step._id].value }} &euro;
                    span.mono-table__rate(v-else) - 
                    span.mono-table__rate min - {{ row.rates[step._id].min }} &euro;
                    span.mono-table__rate.mono-table_green(v-if="row.rates[step._id].active") active
                    span.mono-table__rate.mono-table_orange(v-else) inactive
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DataTable from "@/components/Tables/DataTable";

export default {
    props: {
        langFilter: {
            type: Array,
            default: () => []
        },
        industriesFilter: {
            type: Array,
            default: () => []
        },
        packagesFilter: {
            type: Array,
            default: () => []
        },
        rates: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            fields: [
                {label: "Language", headerKey: "headLanguage", key: "language", width: "188px", padding: "0"},
                {label: "Package", headerKey: "headPackage", key: "package", width: "200px", padding: "0"},
                {label: "Industry", headerKey: "headIndustry", key: "industry", width: "151px", padding: "0"},
                {label: "", headerKey: "headStep1", key: "copywriting", width: "229px", padding: "0", isStepTitle: true}
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
        },
    },
    computed: {
        ...mapGetters({
            vendor: "getVendor",
            steps: "getSteps"
        }),
        filteredRates() {
            let result = this.rates;
            if(this.langFilter.length && this.langFilter[0] !== "All") {
                result = result.filter(item => this.langFilter.indexOf(item.target.lang) !== -1);
            }
            if(this.industriesFilter.length && this.industriesFilter[0] !== "All") {
                result = result.filter(item => {
                    const industry = item.industries.find(indus => this.industriesFilter.indexOf(indus.name) !== -1);
                    return !!industry;
                });
            }
            if(this.packagesFilter.length && this.packagesFilter[0] !== "All") {
                result = result.filter(item => this.packagesFilter.indexOf(item.packageSize) !== -1);
            }
            return result;
        },
        // tableFields() {
        //     let fields = this.fields.map(item => item);
        //     fields = fields.filter(item => !item.isStepTitle);
        //     for(let i = 0; i < this.packagesSteps.length; i++) {
        //         fields.push({
        //             label: this.packagesSteps[i].title,
        //             headerKey: `headStep${i+1}`,
        //             key: this.packagesSteps[i].symbol,
        //             width: "229px",
        //             padding: "0",
        //             isStepTitle: true
        //         })
        //     }
        //     return fields;
        // },
        stepsIds() {
            return this.steps.filter(item => item.calculationUnit === "Packages").map(item => item._id);
        },
        packagesSteps() {
            return this.steps.filter(item => item.calculationUnit === "Packages");
        }
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

.mono-table {
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
        margin-right: 3px;
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

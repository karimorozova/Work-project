<template lang="pug">
    .lqa-table(v-if="vendorsData")
        h4.lqa-table__text Tier: {{tier}}
        DataTable(
            :fields="fields"
            :tableData="vendorsData"
            :bodyClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
            :tableheadRowClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
        )
            .lqa-table__header(slot="headerVendor" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerWords" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerTqi" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerLqa1" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerLqa2" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerLqa3" slot-scope="{ field }") {{ field.label }}

            .lqa-table__header(slot="vendor" slot-scope="{ row }") {{ row.name }}
            .lqa-table__header(slot="wordcount" slot-scope="{ row }") {{ presentWordcount(row.wordCount) }}

            .lqa-table__header(slot="tqi" slot-scope="{ row }")
                span(v-if="row.assessments")
                    span(v-if="row.assessments[0]")
                        span(v-if="row.assessments[0].TQI.length") {{ row.assessments[0].TQI[0].score }}

            .lqa-table__header(slot="lqa1" slot-scope="{ row }")
                span(v-if="row.assessments")
                    span(v-if="row.assessments[0]")
                        span(v-if="row.assessments[0].LQA1") {{ row.assessments[0].LQA1.score }}

            .lqa-table__header(slot="lqa2" slot-scope="{ row }")
                span(v-if="row.assessments")
                    span(v-if="row.assessments[0]")
                        span(v-if="row.assessments[0].LQA2") {{ row.assessments[0].LQA2.score }}

            .lqa-table__header(slot="lqa3" slot-scope="{ row }")
                span(v-if="row.assessments")
                    span(v-if="row.assessments[0]")
                        span(v-if="row.assessments[0].LQA3") {{ row.assessments[0].LQA3.score }}
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    props: {
        vendorsData: {type: Array, default: () => []},
        field: {type: String},
        tier:{
            type: String,
            default: '-',
        }
    },
    data() {
        return {
            fields: [
                {label: "Vendor Name", headerKey: "headerVendor", key: "vendor", width: "20%"},
                {label: "Wordcount", headerKey: "headerWords", key: "wordcount", width: "16%"},
                {label: "TQI", headerKey: "headerTqi", key: "tqi", width: "16%"},
                {label: "LQA 1", headerKey: "headerLqa1", key: "lqa1", width: "16%"},
                {label: "LQA 2", headerKey: "headerLqa2", key: "lqa2", width: "16%"},
                {label: "LQA 3", headerKey: "headerLqa3", key: "lqa3", width: "16%"}
            ]
        }
    },
    methods: {
        presentWordcount(words) {
            if(words.toString().indexOf(".") !== -1) {
                return words.toFixed(2);
            }
            return words;
        }
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>

.lqa-table {
    max-width: 1030px;
    margin: 10px 0 20px;
    &__text{
        margin: 10px 0 5px;
    }
}

</style>

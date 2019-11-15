<template lang="pug">
    .lqa-table(v-if="reportData")
        .lqa-table__main(v-for="langData in reportData")
            .lqa-table__block(v-for="(value, name) in langData")
                .lqa-table__lang-name Target Language: {{ name }}
                .lqa-table__lang-report(v-for="(industries, indName) in value")
                    .lqa-table__industry Industry: {{ indName }}
                    DataTable(
                        :fields="fields"
                        :tableData="industries"
                        :bodyClass="industries.length < 5 ? 'tbody_visible-overflow' : ''"
                        :tableheadRowClass="industries.length < 5 ? 'tbody_visible-overflow' : ''"
                    )
                        .lqa-table__header(slot="headerVendor" slot-scope="{ field }") {{ field.label }}
                        .lqa-table__header(slot="headerWords" slot-scope="{ field }") {{ field.label }}
                        .lqa-table__header(slot="headerTqi" slot-scope="{ field }") {{ field.label }}
                        .lqa-table__header(slot="headerLqa1" slot-scope="{ field }") {{ field.label }}
                        .lqa-table__header(slot="headerLqa2" slot-scope="{ field }") {{ field.label }}
                        .lqa-table__header(slot="headerLqa3" slot-scope="{ field }") {{ field.label }}
                        .lqa-table__header(slot="vendor" slot-scope="{ row }") {{ row.vendor.firstName }}
                        .lqa-table__header(slot="wordcount" slot-scope="{ row }") {{ row.wordcount }}
                        .lqa-table__header(slot="tqi" slot-scope="{ row }") {{ row.vendor.tqi }}
                        .lqa-table__header(slot="lqa1" slot-scope="{ row }") {{ row.lqa1 }}
                        .lqa-table__header(slot="lqa2" slot-scope="{ row }") {{ row.lqa2 }}
                        .lqa-table__header(slot="lqa3" slot-scope="{ row }") {{ row.lqa3 }}
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    props: {
        reportData: {type: Array, default: () => []}
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
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>

.lqa-table {
    width: 70%;
    max-width: 1030px;
    margin-top: 40px;
    &__industry {
        margin: 10px 0;
    }
}

</style>

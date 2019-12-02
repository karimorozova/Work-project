<template lang="pug">
    .lqa-table(v-if="vendorsData")
        DataTable(
            :fields="fields"
            :tableData="vendorsData"
            :bodyClass="vendorsData.length < 7 ? 'tbody_visible-overflow' : ''"
            :tableheadRowClass="vendorsData.length < 7 ? 'tbody_visible-overflow' : ''"
        )
            .lqa-table__header(slot="headerVendor" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerWords" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerTqi" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerLqa1" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerLqa2" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="headerLqa3" slot-scope="{ field }") {{ field.label }}
            .lqa-table__header(slot="vendor" slot-scope="{ row }") {{ row.vendor.name }}
            .lqa-table__header(slot="wordcount" slot-scope="{ row }") {{ row.wordcounts[field] }}
            .lqa-table__header(slot="tqi" slot-scope="{ row }") {{ row.vendor.tqis[field] }}
            .lqa-table__header(slot="lqa1" slot-scope="{ row }") {{ row.vendor.lqa1s[field] }}
            .lqa-table__header(slot="lqa2" slot-scope="{ row }") {{ row.vendor.lqa2s[field] }}
            .lqa-table__header(slot="lqa3" slot-scope="{ row }") {{ row.vendor.lqa3s[field] }}
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    props: {
        vendorsData: {type: Array, default: () => []},
        field: {type: String}
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
    max-width: 1030px;
    margin: 10px 0 20px;
}

</style>

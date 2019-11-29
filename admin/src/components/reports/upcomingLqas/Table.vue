<template lang="pug">
    .lqa-vendors-table(v-if="vendorsData")
        DataTable(
            :fields="fields"
            :tableData="vendorsData"
            :bodyClass="vendorsData.length < 24 ? 'tbody_visible-overflow height-700' : 'height-700'"
            :tableheadRowClass="vendorsData.length < 24 ? 'tbody_visible-overflow' : ''"
            @onRowClicked="selectVendor"
        )
            .lqa-vendors-table__header(slot="headerVendor" slot-scope="{ field }") {{ field.label }}
            .lqa-vendors-table__header(slot="headerWords" slot-scope="{ field }") {{ field.label }}
            .lqa-vendors-table__header(slot="headerIndustry" slot-scope="{ field }") {{ field.label }}
            .lqa-vendors-table__header(slot="headerTier" slot-scope="{ field }") {{ field.label }}
            .lqa-vendors-table__header(slot="headerLqa" slot-scope="{ field }") {{ field.label }}
            .lqa-vendors-table__data(slot="vendor" slot-scope="{ row }") {{ row.vendor.name }}
            .lqa-vendors-table__data(slot="words" slot-scope="{ row }") {{ row.wordcounts[row.industry] }}
            .lqa-vendors-table__data(slot="industry" slot-scope="{ row }") {{ row.industry }}
            .lqa-vendors-table__data(slot="tier" slot-scope="{ row }") {{ row.tier }}
            .lqa-vendors-table__data(slot="lqa" slot-scope="{ row }") {{ getLqaNumber(row) }}
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    props: {
        vendorsData: {type: Array, default: () => []}
    },
    data() {
        return {
            fields: [
                {label: "Vendor Name", headerKey: "headerVendor", key: "vendor", width: "40%"},
                {label: "Wordcount", headerKey: "headerWords", key: "words", width: "15%"},
                {label: "Industry", headerKey: "headerIndustry", key: "industry", width: "15%"},
                {label: "Tier", headerKey: "headerTier", key: "tier", width: "15%"},
                {label: "LQA#", headerKey: "headerLqa", key: "lqa", width: "15%"},
            ]
        }
    },
    methods: {
        getLqaNumber(row) {
            let result = 1;
            if(row.isLqa2) result = 2;
            result = row.isLqa3 ? 3 : result;
            return result;
        },
        selectVendor({index}) {
            this.$emit('selectVendor', {vendor: this.vendorsData[index]});
        }
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>

.lqa-vendors-table {
    width: 70%;
    max-width: 1030px;
    margin: 10px 0 20px;
    &_red {
        color: red;
    }
    &_green {
        color: green;
    }
}

</style>

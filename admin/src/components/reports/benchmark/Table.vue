<template lang="pug">
    .benchmark-table(v-if="vendorsData")
        DataTable(
            :fields="fields"
            :tableData="vendorsData"
            :bodyClass="vendorsData.length < 7 ? 'tbody_visible-overflow' : ''"
            :tableheadRowClass="vendorsData.length < 7 ? 'tbody_visible-overflow' : ''"
        )
            .benchmark-table__header(slot="headerVendor" slot-scope="{ field }") {{ field.label }}
            .benchmark-table__header(slot="headerPrice" slot-scope="{ field }") {{ field.label }}
            .benchmark-table__header(slot="headerMargin" slot-scope="{ field }") {{ field.label }}
            .benchmark-table__data(slot="vendor" slot-scope="{ row }") {{ row.vendor.name }}
            .benchmark-table__data(slot="basicPrice" slot-scope="{ row }") {{ row.vendor.basicPrice }}
            .benchmark-table__data(slot="margin" slot-scope="{ row }" :class="getMarginClass(row.vendor.basicPrice)") {{ getMargin(row.vendor.basicPrice) }}
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    props: {
        vendorsData: {type: Array, default: () => []},
        benchmarkPrice: {type: Number}
    },
    data() {
        return {
            fields: [
                {label: "Vendor Name", headerKey: "headerVendor", key: "vendor", width: "40%"},
                {label: "Basic Price", headerKey: "headerPrice", key: "basicPrice", width: "30%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "30%"}
            ]
        }
    },
    methods: {
        getMargin(vendorPrice) {
            return (this.benchmarkPrice - vendorPrice).toFixed(2);
        },
        getMarginClass(vendorPrice) {
            return this.getMargin(vendorPrice) < 0 ? 'benchmark-table_red' : 'benchmark-table_green';
        }
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>

.benchmark-table {
    width: 30%;
    max-width: 730px;
    margin: 10px 0 20px;
    &_red {
        color: red;
    }
    &_green {
        color: green;
    }
}

</style>

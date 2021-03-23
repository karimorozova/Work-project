<template lang="pug">
    .benchmark-table(v-if="vendorsData")
        DataTable(
            :fields="fields"
            :tableData="vendorsData"
            bodyRowClass="cursor-default"
            :bodyClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
            :tableheadRowClass="vendorsData.length < 6 ? 'tbody_visible-overflow' : ''"
        )
            .benchmark-table__header(slot="headerVendor" slot-scope="{ field }") {{ field.label }}
            .benchmark-table__header(slot="headerPrice" slot-scope="{ field }") {{ field.label }}
            .benchmark-table__header(slot="headerMargin" slot-scope="{ field }") {{ field.label }}
            .benchmark-table__data(slot="vendor" slot-scope="{ row }") {{ row.vendorName }}
            .benchmark-table__data(slot="basicPrice" slot-scope="{ row }") € {{ row.baseRate.toFixed(4) }}
            .benchmark-table__data(slot="margin" slot-scope="{ row }" :class="getMarginClass(row.margin)" ) € {{ row.margin.toFixed(4) }}
</template>

<script>
import DataTable from "@/components/DataTable";

export default {
    props: {
        vendorsData: {type: Array, default: () => []},
        benchmarkPrice: {type: Number},
        field: {type: String}
    },
    data() {
        return {
            fields: [
                {label: "Vendor Name", headerKey: "headerVendor", key: "vendor", width: "40%",padding: "0" },
                {label: "Basic Price", headerKey: "headerPrice", key: "basicPrice", width: "30%",padding: "0" },
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "30%",padding: "0" }
            ]
        }
    },
    methods: {
        getMargin(vendorPrice) {
            return (this.benchmarkPrice - vendorPrice).toFixed(2);
        },
        getMarginClass(margin) {
          if (margin === 0) return ''
          return 0 > + margin ? 'benchmark-table_red' : 'benchmark-table_green';
        }
    },
    components: {
        DataTable
    }
}
</script>

<style lang="scss" scoped>

.benchmark-table {
    &__data {
      height: 31px;
      overflow-x: hidden;
      padding: 0 5px;
      align-items: center;
      display: flex;
    }
    max-width: 55%;
    margin: 10px 0 20px;
    &_red {
        background: #e8afa2;
    }
    &_green {
        color: #4ca553;
    }
}

</style>

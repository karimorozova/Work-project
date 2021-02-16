<template lang="pug">
  SettingsTable(:fields="fields", :tableData="tableData")
    template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
      .overallTable__head-title {{ field.label }}
    template(slot="receivables", slot-scope="{ row, index }")
      .overallTable__data {{ row.receivables | roundTwoDigit }} &#8364;
    template(slot="payables", slot-scope="{ row, index }")
      .overallTable__data {{ row.payables | roundTwoDigit }} &#8364;
    template(slot="margin", slot-scope="{ row, index }")
      .overallTable__data {{ row.margin | roundTwoDigit }} &#8364;
</template>
<script>
import SettingsTable from "../../Table/SettingsTable";

export default {
  props: {
    tableData: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      fields: [
        {
          label: "Receivables",
          headerKey: "headerReceivables",
          key: "receivables",
          width: "34%",
          padding: "0",
        },
        {
          label: "Payable",
          headerKey: "headerPayable",
          key: "payables",
          width: "33%",
          padding: "0",
        },
        {
          label: "Margin",
          headerKey: "headerMargin",
          key: "margin",
          width: "33%",
          padding: "0",
        },
      ],
    };
  },
  components: {
    SettingsTable,
  },
};
</script>
<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable";
.overallTable {
  padding: 20px;
  &__data {
    @extend %table-data;
    overflow-x: hidden;
  }
}
</style>
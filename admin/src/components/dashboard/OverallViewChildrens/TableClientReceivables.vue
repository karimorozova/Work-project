<template lang="pug">
.overallTable
  SettingsTable(:fields="fields", :tableData="tableData")
    template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
      .overallTable__head-title {{ field.label }}
    template(slot="client", slot-scope="{ row, index }")
      .overallTable__data {{ row.client }}
    template(slot="receivables", slot-scope="{ row, index }")
      .overallTable__data {{ row.receivables }} &#8364;
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
          label: "Client",
          headerKey: "headerClient",
          key: "client",
          width: "70%",
          padding: "0",
        },
        {
          label: "Receivables",
          headerKey: "headerReceivables",
          key: "receivables",
          width: "30%",
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
  box-shadow: 0 0 10px #67573e9d;
  &__data {
    @extend %table-data;
    overflow-x: hidden;
  }
}
</style>
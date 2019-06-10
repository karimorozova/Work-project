<template lang="pug">
  .step-finance
    StepInfoTitle(title="Finance" :isIconReversed="isInfoShown" @titleClick="toggleInfoShow")
    .step-finance__info(:class="{'step-finance_flex-display': isInfoShown}")
      .step-finance__table
        DataTable(
        :fields="fields"
          :tableData="financeData_PlusRate"
          :tableheadClass="'table__header'"
          :tableheadRowClass="'table__header-row'"
          :bodyRowClass="'table__body-row-custom'"
        )
          template(slot="headerTitle" slot-scope="{ field }")
          template(slot="headerReceivables" slot-scope="{ field }")
            span.step-finance__label {{ field.label }}
          template(slot="headerPayables" slot-scope="{ field }")
            span.step-finance__label {{ field.label }}
          template(slot="title" slot-scope="{ row }")
            span.step-finance__value {{ row.title }}
          template(slot="receivables" slot-scope="{ row }")
            span.step-finance__value {{ row.receivables }}
            span.step-finance__money(v-if="showMoney(row, 'receivables')") &nbsp;&euro;
          template(slot="payables" slot-scope="{ row }")
            span.step-finance__value {{ row.payables }}
            span.step-finance__money(v-if="showMoney(row, 'payables')") &nbsp;&euro;
      Results(:financeData="financeData")
    InfoBlock(
      :isInfoShown="isInfoShown"
      :financeData="financeData"
      :financeDataRate="financeDataRate"
      )
</template>

<script>
  import DataTable from "../../../DataTable";
  import StepInfoTitle from "./StepInfoTitle";
  import ValidationErrors from "../../../ValidationErrors";
  import ApproveModal from "../../../ApproveModal";
  import Results from "./Results";
  import InfoBlock from "./InfoBlock";

  export default {
    props: {
      financeData: {
        type: Array
      },
      financeDataRate: {
        type: Object
      }
    },
    data() {
      return {
        fields: [
          {label: "Title", headerKey: "headerTitle", key: "title", width: "33.33%"},
          {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "33.33%"},
          {label: "Payables", headerKey: "headerPayables", key: "payables", width: "33.33%"},
        ],
        isInfoShown: false,
      }
    },
    methods: {
      toggleInfoShow() {
        this.isInfoShown = !this.isInfoShown;
      },
      showMoney(row, key) {
        return row.title !== "Wordcount" && row[key]
      }
    },
    components: {
      DataTable,
      StepInfoTitle,
      ValidationErrors,
      ApproveModal,
      Results,
      InfoBlock
    },
    mounted() {
      this.financeData_PlusRate = [...this.financeData];
      this.financeData_PlusRate.splice(this.financeData_PlusRate.length - 1, 0, {
        title: 'Rate',
        receivables: this.financeDataRate.clientRate,
        payables: this.financeDataRate.vendorRate
      });
    },
  }
</script>

<style lang="scss" scoped>
  @import "../../../../assets/scss/colors";

  .step-finance {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;


    &__info {
      margin-top: 20px;
      display: none;
      transition: all 0.3s;
    }
    &_flex-display {
      display: flex;
    }
    &__table {
      width: 430px;
      height: 130px;
      margin-right: 20px;
    }
  }
</style>

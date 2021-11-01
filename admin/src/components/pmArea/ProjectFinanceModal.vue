<template lang="pug">
  .edit-finance
    .edit-finance__title Finance
    .edit-finance__status-bar
      .info StepId: {{step.stepId}}
      .info Step: {{step.name}}
      .info Profit: 10t
      .info Margin: 12t
      .info ROI: 15%

    .edit-finance__table
      .table
        GeneralTable(
          :fields="fields"
          :tableData="currentDataTo"
        )
          template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
            .table__header {{ field.label }}

          template(slot="title" slot-scope="{ row, index }")
            .table__data {{ row.title }}

          template(slot="receivables" slot-scope="{ row, index }")
            .table__data(v-if="row.title === 'Unit'") {{ row.receivables }}
            .table__data(v-else)
              input(type="number" @keyup="setReceivables($event, row.title)" v-model="row.receivables")

          template(slot="payables" slot-scope="{ row, index }")
            .table__data(v-if="row.title === 'Unit'") {{ row.payables }}
            .table__data(v-else)
              input(type="number" @keyup="setPayables($event, row.title)" v-model="row.payables" :disabled="!step.vendor")

    .edit-finance__buttons
      Button(value="Update" @clicked="saveFinance" :isDisabled="isEdited")
      Button(value="Cancel" :outline="true" @clicked="cancelEditing")
</template>

<script>
import GeneralTable from "../GeneralTable"
import Button from "../Button"
import { mapGetters } from "vuex"

export default {
  name: "ProjectFinanceModal",
  props: {
    step: {
      type: Object,
      default: {}
    },
    projectCurrency: {
      type: String,
      default: 'EUR'
    }
  },
  data() {
    return {
      fields: [
        { label: "", headerKey: "headerTitle", key: "title", style: { width: "50%" } },
        { label: "Receivables", headerKey: "headerReceivables", key: "receivables", style: { width: "25%" } },
        { label: "Payables", headerKey: "headerPayables", key: "payables", style: { width: "25%" } }
      ],

      quantityReceivables: 0,
      quantityPayables: 0,
      rateReceivables: 0,
      ratePayables: 0,
      totalReceivables: 0,
      totalPayables: 0,

      isEdited: true
    }
  },
  methods: {
    saveFinance() {
      const data = {
        stepId: this.step.stepId,
        quantityReceivables: this.quantityReceivables,
        quantityPayables: this.quantityPayables,
        rateReceivables: this.rateReceivables,
        ratePayables: this.ratePayables,
        totalReceivables: this.totalReceivables,
        totalPayables: this.totalPayables
      }
      this.$http.post(`/pm-manage/step-finance-edit/${ this.$route.params.id }`, data)
    },
    cancelEditing() {
      return this.$emit('closeFinanceEditing')
    },
    setFinanceData() {
      const { finance, vendorRate, clientRate, receivablesUnit, payablesUnit } = this.step

      if (receivablesUnit.type === 'CAT Wordcount') {
        this.quantityReceivables = finance.Wordcount.receivables
        this.quantityPayables = finance.Wordcount.payables
      } else {
        this.quantityReceivables = finance.Quantity.receivables
        this.quantityPayables = finance.Quantity.payables
      }

      this.rateReceivables = clientRate || 0
      this.ratePayables = vendorRate || 0

      this.totalReceivables = +finance.Price.receivables || 0
      this.totalPayables = +finance.Price.payables || 0
    },
    setReceivables(event, title) {
      this.isEdited = false
      this['current' + title + 'Receivables'] = event.target.value
    },
    setPayables(event, title) {
      this.isEdited = false
      this['current' + title + 'Payables'] = event.target.value
    }
  },
  watch: {
    quantityReceivables: function (val) {
      this.totalReceivables = +(+this.rateReceivables * +val).toFixed(2)
    },
    rateReceivables: function (val) {
      this.totalReceivables = +(+this.quantityReceivables * +val).toFixed(2)
    },
    totalReceivables: function (val) {
      this.rateReceivables = +(+val / +this.quantityReceivables).toFixed(4)
    },
    quantityPayables: function (val) {
      this.totalPayables = +(+this.ratePayables * +val).toFixed(2)
    },
    ratePayables: function (val) {
      this.totalPayables = +(+this.quantityPayables * +val).toFixed(2)
    },
    totalPayables: function (val) {
      this.ratePayables = +(+val / +this.quantityPayables).toFixed(4)
    }
  },
  computed: {
    ...mapGetters({
      units: "getAllUnits"
    }),
    currentDataTo() {
      return [
        { title: 'Unit', receivables: this.step.receivablesUnit.type, payables: this.step.payablesUnit.type },
        { title: 'Quantity', receivables: this.quantityReceivables, payables: this.quantityPayables },
        { title: `Rate`, receivables: this.rateReceivables, payables: this.ratePayables },
        { title: `Total`, receivables: this.totalReceivables, payables: this.totalPayables }
      ]
    }
  },
  created() {
    this.setFinanceData()
  },
  components: {
    GeneralTable,
    Button
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

//.edit-finance {
//  width: 800px;
//  padding: 25px;
//  background: white;
//  position: absolute;
//  box-shadow: $box-shadow;
//  top: 50%;
//  left: 50%;
//  transform: translate(-50%, -50%);
//  z-index: 501;
//
//  &__title {
//    font-size: 19px;
//    font-family: Myriad600;
//    margin-bottom: 10px;
//  }
//
//  &__status-bar {
//    display: flex;
//    margin: 10px 0;
//    padding: 10px;
//    border: 2px solid $light-border;
//    border-radius: 4px;
//
//    gap: 30px;
//  }
//
//  &__buttons {
//    display: flex;
//    justify-content: center;
//    margin-top: 20px;
//    gap: 20px;
//  }
//}


.table {
  &__header,
  &__data {
    padding: 0 7px;
    width: 100%;
    text-align: left;
  }

  &__icon {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

</style>
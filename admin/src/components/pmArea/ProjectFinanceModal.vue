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
        { label: "Payables", headerKey: "headerPayables", key: "payables", style: { width: "25%" } },
      ],

      currentQuantityReceivables: 0,
      currentQuantityPayables: 0,
      currentRateReceivables: 0,
      currentRatePayables: 0,
      currentTotalReceivables: 0,
      currentTotalPayables: 0,

      isEdited: true,

    }
  },
  methods: {
    saveFinance() {
      const data = {
        stepId: this.step.stepId,
        currentQuantityReceivables: this.currentQuantityReceivables,
        currentQuantityPayables: this.currentQuantityPayables,
        currentRateReceivables: this.currentRateReceivables,
        currentRatePayables: this.currentRatePayables,
        currentTotalReceivables: this.currentTotalReceivables,
        currentTotalPayables: this.currentTotalPayables,
      }
      this.$http.post(`/pm-manage/step-finance-edit/${this.$route.params.id}` , data)
    },
    cancelEditing() {
      return this.$emit('closeFinanceEditing')
    },
    setFinanceData({ finance,  vendorRate, clientRate,  }) {
      if (this.getUnit.type === 'CAT Wordcount' ) {
        this.currentQuantityReceivables = finance.Wordcount.receivables
        this.currentQuantityPayables = finance.Wordcount.payables
      } else {
        this.currentQuantityReceivables = finance.Quantity.receivables
        this.currentQuantityPayables = finance.Quantity.payables
      }

      this.currentRateReceivables = clientRate.value || 0
      this.currentRatePayables = vendorRate.value || 0
      this.currentTotalReceivables = Number.isNaN(finance.Price.receivables) ? +finance.Price.receivables : 0
      this.currentTotalPayables =  Number.isNaN(finance.Price.payables) ? +finance.Price.payables : 0
    },
    setReceivables( event, title) {
      this.isEdited = false
      this['current' + title + 'Receivables'] = event.target.value
    },
    setPayables( event, title) {
      this.isEdited = false
      this['current' + title + 'Payables'] = event.target.value
    }
  },
  watch: {
    currentQuantityReceivables: function (val) {
      this.currentTotalReceivables = +(+this.currentRateReceivables * +val).toFixed(2)
    },
    currentRateReceivables: function (val) {
      this.currentTotalReceivables = +(+this.currentQuantityReceivables * +val).toFixed(2)
    },
    currentTotalReceivables: function (val) {
      this.currentRateReceivables = +(+val / +this.currentQuantityReceivables).toFixed(4)
    },
    currentQuantityPayables: function (val) {
      this.currentTotalPayables = +(+this.currentRatePayables * +val).toFixed(2)
    },
    currentRatePayables: function (val) {
      this.currentTotalPayables = +(+this.currentQuantityPayables * +val).toFixed(2)
    },
    currentTotalPayables: function (val) {
      this.currentRatePayables = +(+val / +this.currentQuantityPayables).toFixed(4)
    }
  },
  computed: {
    ...mapGetters({
      units: "getAllUnits",
    }),
    getUnit() {
      const {serviceStep : {unit}} = this.step
      return this.units.find(({_id}) => _id === unit)
    },
    currentDataTo() {
      return [
        {title: 'Unit', receivables: this.getUnit.type, payables: this.getUnit.type},
        {title: 'Quantity', receivables: this.currentQuantityReceivables, payables: this.currentQuantityPayables},
        {title: `Rate`, receivables: this.currentRateReceivables, payables: this.currentRatePayables},
        {title: `Total`, receivables: this.currentTotalReceivables, payables: this.currentTotalPayables},
      ]
    }
  },
  created() {
    this.setFinanceData(this.step)
  },
  components: {
    GeneralTable,
    Button
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
.edit-finance {
  width: 800px;
  padding: 25px;
  background: white;
  position: absolute;
  box-shadow: $box-shadow;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 501;

  &__title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }

  &__status-bar {
    display: flex;
    margin: 10px 0;
    padding: 10px;
    border: 2px solid $light-border;
    border-radius: 4px;

    gap: 30px;
  }

  &__buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    gap: 20px;
  }
}


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
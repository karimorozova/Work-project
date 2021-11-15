<template lang="pug">
  .finance
    .finance__title Finance
    .finance__close(@click.stop="cancelEditing") &#215;

    .info
      .info__link(@click="openDetailsModal") View details
      .info__title {{ step.step.title }}
      .info__value {{ step.stepId }}
      .info__value {{ step.sourceLanguage === step.targetLanguage ? step.fullTargetLanguage.lang : step.fullSourceLanguage.lang + ' to ' + step.fullTargetLanguage.lang }}
      .info__right(v-if="step.vendor") Discount/Surcharge: {{discounts}}%
      .info__value(v-if="step.vendor") {{ step.vendor.firstName }} {{  step.vendor.surname || '' }}

    .stats
      .multi-graph
        .graph( :style="{'--percentage' : 100, '--fill': '#d15f45'}")
        .graph( :style="{'--percentage' : chartMargin, '--fill': '#47A6A6'}")
      .stats__details
        .details__row
          .details__row-color1
          .details__row-title Margin:
          .details__row-value {{ getMargin }} %
        .details__row
          .details__row-color2
          .details__row-title Payables:
          .details__row-value {{ getPayables }}%
      .stats__details
        .details__row
          .details__row-title Profit:
          .details__row-value
            span {{ getProfit }}
            span(v-html="returnIconCurrencyByStringCode(projectCurrency)")
        .details__row
          .details__row-title ROI:
          .details__row-value {{ getROI }} %

    .finance__table
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
              input(v-if="!isMinimumChargeUsed && step.status !== 'Cancelled'" @keyup="setReceivables($event, row.title)" v-model="row.receivables")
              span(v-else) -

          template(slot="payables" slot-scope="{ row, index }")
            .table__data(v-if="row.title === 'Unit'") {{ row.payables }}
            .table__data(v-else)
              input(v-if="step.status !== 'Cancelled'" @keyup="setPayables($event, row.title)" v-model="row.payables" :disabled="!step.vendor")
              span(v-else) -

    .finance__buttons
      Button(value="Save" @clicked="saveFinance" :isDisabled="isEdited")
      Button(value="Cancel" :outline="true" @clicked="cancelEditing")

</template>

<script>
import GeneralTable from "../GeneralTable"
import Button from "../Button"
import { mapActions, mapGetters } from "vuex"
import currencyIconDetected from "../../mixins/currencyIconDetected"

export default {
  name: "ProjectFinanceModal",
  mixins: [ currencyIconDetected ],
  props: {
    step: {
      type: Object,
      default: {}
    },
    index: {
      type: [ Number, String ]
    },
    projectCurrency: {
      type: String,
      default: 'EUR'
    }
  },
  data() {
    return {
      fields: [
        { label: "", headerKey: "headerTitle", key: "title", style: { width: "30%" } },
        { label: "Receivables", headerKey: "headerReceivables", key: "receivables", style: { width: "35%" } },
        { label: "Payables", headerKey: "headerPayables", key: "payables", style: { width: "35%" } }
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
    ...mapActions([ 'setCurrentProject' ]),
    openDetailsModal() {
      const { closeFinanceEditing, showStepDetails } = this.$parent
      closeFinanceEditing()
      showStepDetails(this.index)
    },
    async saveFinance() {
      const data = {
        stepId: this.step._id,
        quantityReceivables: this.quantityReceivables,
        quantityPayables: this.quantityPayables,
        rateReceivables: this.rateReceivables,
        ratePayables: this.ratePayables,
        totalReceivables: this.totalReceivables,
        totalPayables: this.totalPayables
      }
      const updatedProject = await this.$http.post(`/pm-manage/step-finance-edit/${ this.$route.params.id }`, data)
      this.setCurrentProject(updatedProject.data)
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
      let value = isNaN(parseFloat(event.target.value)) ? 0 : parseFloat(event.target.value)
      this.isEdited = false
      this[title.toLowerCase() + 'Receivables'] = value
    },
    setPayables(event, title) {
      let value = isNaN(parseFloat(event.target.value)) ? 0 : parseFloat(event.target.value)
      this.isEdited = false
      this[title.toLowerCase() + 'Payables'] = value
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
      if (this.quantityReceivables === 0 ) return
      this.rateReceivables = +(+val / +this.quantityReceivables).toFixed(4)
    },
    quantityPayables: function (val) {
      this.totalPayables = +(+this.ratePayables * +val).toFixed(2)
    },
    ratePayables: function (val) {
      this.totalPayables = +(+this.quantityPayables * +val).toFixed(2)
    },
    totalPayables: function (val) {
      if (this.quantityPayables === 0 ) return
      this.ratePayables = +(+val / +this.quantityPayables).toFixed(4)
    }
  },
  computed: {
    ...mapGetters({
      units: "getAllUnits",
      currentProject: "getCurrentProject",

    }),
    isMinimumChargeUsed() {
      return this.currentProject.minimumCharge.isUsed
    },
    discounts() {
      return this.currentProject.discounts.reduce((acc, {value})=> acc += value, 0)
    },
    // totalRecWithDiscount() {
    //   return this.isMinimumChargeUsed ? this.totalReceivables : this.totalReceivables +this.totalReceivables/100* this.discounts
    // },
    getProfit() {
      return +(this.totalReceivables - this.totalPayables).toFixed(2)
    },
    getMargin() {
      return Math.round(100 - (this.totalPayables / this.totalReceivables) * 100)
    },
    getPayables() {
      return Math.round((this.totalPayables / this.totalReceivables) * 100)
    },
    getROI() {
      return Math.round(((this.totalReceivables - this.totalPayables) / this.totalPayables) * 100)
    },
    chartMargin() {
      return this.getMargin < 0 ? 0 : this.getMargin > 100 ? 100 : this.getMargin
    },
    currentDataTo() {
      return [
        {
          title: 'Unit',
          receivables: this.step.receivablesUnit.type,
          payables: this.step.payablesUnit.type
        },
        {
          title: 'Quantity',
          receivables: this.quantityReceivables,
          payables: this.quantityPayables
        },
        {
          title: `Rate`,
          receivables: this.rateReceivables,
          payables: this.ratePayables
        },
        {
          title: `Total`,
          receivables: this.totalReceivables,
          payables: this.totalPayables
        }
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

.details {
  &__row {
    display: flex;
    margin-bottom: 12px;
    align-items: center;

    &-value {
      width: 70px;
    }

    &-title {
      width: 100px;
    }

    &-color1 {
      height: 6px;
      min-width: 6px;
      background: $green;
      margin-right: 10px;
    }

    &-color2 {
      height: 6px;
      min-width: 6px;
      background: $red;
      margin-right: 10px;
    }
  }
}

.stats {
  display: flex;
  justify-content: space-evenly;
  background: $table-list;
  align-items: center;
  padding: 15px 0;

  &__details {
    margin-top: 20px;
    width: 140px;
  }
}

.multi-graph {
  margin-right: 25px;
  margin-left: 10px;
  width: 140px;
  height: 70px;
  position: relative;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;

  .graph {
    width: 140px;
    height: 70px;
    border: 6px solid var(--fill);
    border-top: none;
    position: absolute;
    transform-origin: 50% 0% 0;
    border-radius: 0 0 140px 140px;
    left: 0;
    top: 100%;
    z-index: 5;
    animation: 1s fillGraphAnimation ease-in;
    transform: rotate(calc(1deg * (var(--percentage) * 1.8)));
    box-sizing: border-box;

    &:after {
      counter-reset: varible var(--percentage);
      background: var(--fill);
      box-sizing: border-box;
      border-radius: 2px;
      color: #fff;
      font-weight: 200;
      font-size: 12px;
      height: 20px;
      padding: 3px 5px;
      top: 0px;
      position: absolute;
      left: 0;
      transform: rotate(calc(-1deg * var(--percentage) * 1.8)) translate(-30px, 0px);
      transition: 0.2s ease-in;
      transform-origin: 0 50% 0;
      opacity: 0;
    }
  }
}

.info {
  border-radius: 4px;
  padding: 12px 20px;
  margin-bottom: 20px;
  border: 1px solid $light-border;
  position: relative;

  &__link {
    position: absolute;
    right: 12px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
  &__right {
    position: absolute;
    right: 12px;
  }

  &__title {
    font-size: 24px;
    font-family: Myriad300;
    color: $red;
    margin-bottom: 10px;
  }

  &__value {
    font-size: 14px;
    font-family: Myriad300;
    margin-top: 6px;
  }
}

.finance {
  &__title {
    font-size: 19px;
    font-family: Myriad600;
    margin-bottom: 20px;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 22px;
    cursor: pointer;
    height: 22px;
    width: 22px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad900;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }

  &__buttons {
    display: flex;
    justify-content: center;
    margin-top: 25px;
    gap: 20px;
  }
}

//.finance {
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
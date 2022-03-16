<template lang="pug">
  .finance
    .finance__close(@click.stop="cancelEditing") &#215;
    .tabs(style="margin-top: 5px;")
      Tabs(
        :tabs="mainTabs"
        selectedTab="Finance"
        @setTab="showMainTab"
      )
    .info
      .info__title {{ step.step.title }}
      .info__value {{ step.stepId }}
      .info__value {{ step.sourceLanguage === step.targetLanguage ? step.fullTargetLanguage.lang : step.fullSourceLanguage.lang + ' to ' + step.fullTargetLanguage.lang }}
      .info__right
        span Discount/Surcharge:
        span(style="margin-left: 5px;") {{discounts}}%

    .stats
      .multi-graph
        .graph( :style="{'--percentage' : 100, '--fill': '#EAC0BB'}")
        .graph( :style="{'--percentage' : chartMargin, '--fill': '#A9D3D1'}")
      .stats__details
        .details__row
          .details__row-color1
          .details__row-title Margin:
          .details__row-value {{ getMargin }} %
        .details__row
          .details__row-color2
          .details__row-title Payables:
          .details__row-value {{ getPayables }} %
      .stats__details
        .details__row
          .details__row-title Profit:
          .details__row-value
            span {{ getProfit }}
            span(style="margin-left: 4px;" v-html="returnIconCurrencyByStringCode(projectCurrency)")
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
              input(
                v-if="!isMinimumChargeUsed && step.status !== 'Cancelled' && step.isReceivableVisible"
                @keyup="setReceivables($event, row.title)"
                :value="row.receivables"
              )
              .disabled(v-else) Disabled

          template(slot="payables" slot-scope="{ row, index }")
            .table__data(v-if="row.title === 'Unit'") {{ row.payables }}
            .table__data(v-else)
              input(
                v-if="step.status !== 'Cancelled'"
                @keyup="setPayables($event, row.title)"
                :value="row.payables"
                :disabled="!step.vendor"
              )
              .disabled(v-else) Disabled

    .finance__buttons
      Button(value="Save" @clicked="saveFinance" :isDisabled="isEdited")
      Button(value="Cancel" :outline="true" @clicked="cancelEditing")

</template>

<script>
import GeneralTable from "../GeneralTable"
import Button from "../Button"
import { mapActions, mapGetters } from "vuex"
import currencyIconDetected from "../../mixins/currencyIconDetected"
import Tabs from "../Tabs"

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
    },
    currentProject: {
      type: Object,
      default: {}
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
    showMainTab({ index }) {
      switch (this.mainTabs[index]) {
        case 'Step Information':
          this.openDetailsModal()
          break
        case 'Vendor Details':
          this.openVendorModal()
          break
      }
    },
    openDetailsModal() {
      const { closeFinanceEditing, showStepDetails } = this.$parent
      closeFinanceEditing()
      showStepDetails(this.index)
    },
    openVendorModal() {
      const { closeFinanceEditing, openVendorDetailsModal } = this.$parent
      closeFinanceEditing()
      openVendorDetailsModal(this.step.vendor, this.step, this.index)
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
      const updatedProject = await this.$http.post(`/pm-manage/step-finance-edit/${ this.currentProject._id }`, data)
      this.$emit('approve', updatedProject.data)
      this.cancelEditing()
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
    totalRecWithDiscount(total) {
      return this.isMinimumChargeUsed ? total : total + total / 100 * this.discounts
    },
    setReceivables(event, title) {
      let value = isNaN(parseFloat(event.target.value)) ? 0 : parseFloat(event.target.value)
      this.isEdited = false
      this[title.toLowerCase() + 'Receivables'] = value
      switch (title.toLowerCase()) {
        case 'quantity':
          this.totalReceivables = +(this.totalRecWithDiscount(+this.rateReceivables * +value)).toFixed(2)
          break
        case 'rate':
          this.totalReceivables = +(this.totalRecWithDiscount(+this.quantityReceivables * +value)).toFixed(2)
          break
        case 'total' :
          this.rateReceivables = +(+(+(+value / (this.discounts + 100)) * 100) / +this.quantityReceivables).toFixed(4)
          break
      }
    },
    setPayables(event, title) {
      let value = isNaN(parseFloat(event.target.value)) ? 0 : parseFloat(event.target.value)
      this.isEdited = false
      this[title.toLowerCase() + 'Payables'] = value

      switch (title.toLowerCase()) {
        case 'quantity':
          this.totalPayables = +(+this.ratePayables * +value).toFixed(2)
          break
        case 'rate':
          this.totalPayables = +(+this.quantityPayables * +value).toFixed(2)
          break
        case 'total' :
          this.ratePayables = +(+value / +this.quantityPayables).toFixed(4)
          break
      }
    }
  },
  computed: {
    mainTabs() {
      if (!Object.keys(this.step).length) return []
      return [ "Step Information", "Vendor Details", "Finance" ].filter(i => !this.step.vendor ? i !== 'Vendor Details' : true)
    },
    // isProjectFinished() {
    //   const { status } = this.currentProject
    //   return status === 'Closed' || status === 'Cancelled Halfway' || status === 'Cancelled'
    // },
    // isInReceivablesInvoicing() {
    //   return false
    // },
    // isInPayablesInvoicing() {
    //   return false
    // },
    isMinimumChargeUsed() {
      return this.currentProject.minimumCharge.isUsed
    },
    discounts() {
      return this.currentProject.discounts.reduce((acc, { value }) => acc += value, 0)
    },
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
      const num = Math.round(((this.totalReceivables - this.totalPayables) / this.totalPayables) * 100)
      return !isFinite(num) ? 0 : num
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
    Tabs,
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
      width: 80px;
    }

    &-title {
      width: 100px;
    }

    &-color1 {
      height: 6px;
      min-width: 6px;
      background: $medium-green;
      margin-right: 10px;
    }

    &-color2 {
      height: 6px;
      min-width: 6px;
      background: $medium-red;
      margin-right: 10px;
    }
  }
}

.stats {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin-bottom: 20px;

  &__details {
    margin-top: 20px;
    width: 140px;
  }
}

.multi-graph {
  margin-right: 25px;
  width: 130px;
  height: 65px;
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
    width: 130px;
    height: 65px;
    border: 7px solid var(--fill);
    border-top: none;
    position: absolute;
    transform-origin: 50% 0% 0;
    border-radius: 0 0 130px 130px;
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
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid $border;
  position: relative;

  &__link {
    position: absolute;
    right: 12px;
    cursor: pointer;
    color: $dark-border;
    transition: .2s ease-out;

    &:hover {
      color: $text;
      text-decoration: underline;
    }
  }

  &__link2 {
    position: absolute;
    right: 12px;
    top: 35px;
    cursor: pointer;
    color: $dark-border;
    transition: .2s ease-out;

    &:hover {
      color: $text;
      text-decoration: underline;
    }
  }

  &__right {
    position: absolute;
    right: 15px;
    bottom: 15px;
  }

  &__title {
    font-size: 16px;
    margin-bottom: 10px;
    font-family: 'Myriad600';
  }

  &__value {
    font-size: 14px;
    margin-top: 6px;
    height: 16px;
  }
}

.finance {
  box-sizing: border-box;
  background-color: white;
  box-shadow: $box-shadow;
  border-radius: 2px;
  width: 600px;
  padding: 25px;

  &__title {
    font-size: 16px;
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

.disabled {
  opacity: 0.4;
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
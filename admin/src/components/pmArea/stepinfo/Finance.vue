<template lang="pug">
.step-finance
    StepInfoTitle(title="Finance" :isIconReversed="isInfoShown" @titleClick="toggleInfoShow")
    .step-finance__info(:class="{'step-finance_flex-display': isInfoShown}")
        .step-finance__table
            DataTable(
                :fields="fields"
                :tableData="financeData"
            )
                template(slot="headerTitle" slot-scope="{ field }")
                template(slot="headerReceivables" slot-scope="{ field }")
                    span.step-finance__label {{ field.label }}
                template(slot="headerPayables" slot-scope="{ field }")
                    span.step-finance__label {{ field.label }}
                template(slot="headerMargin" slot-scope="{ field }")
                    span.step-finance__label {{ field.label }}
                template(slot="title" slot-scope="{ row }")
                    span.step-finance__value {{ row.title }}
                template(slot="receivables" slot-scope="{ row }")
                    span.step-finance__value {{ row.receivables }}
                    span.step-finance__money(v-if="showMoney(row, 'receivables')") &euro;
                template(slot="payables" slot-scope="{ row }")
                    span.step-finance__value {{ row.payables }}
                    span.step-finance__money(v-if="showMoney(row, 'payables')") &euro;
                template(slot="margin" slot-scope="{ row }")
                    span.step-finance__value {{ row.margin }}
                    span.step-finance__money(v-if="showMoney(row, 'receivables')") &euro;
        .step-finance__results
            .step-finance__summary
              .step-finance__summary-value Profit:
                span.step-finance__money {{ this.financeData[1].receivables- this.financeData[1].payables }} &euro;
            .step-finance__summary
              .step-finance__summary-value Margin:
                span.step-finance__money + {{ ((this.financeData[1].receivables- this.financeData[1].payables)/this.financeData[1].receivables).toFixed(2) }} %
            .step-finance__summary
              .step-finance__summary-value Roi:
                span.step-finance__money + {{ 0 }} %
    .step-finance__toggler(v-if="isInfoShown")
      .step-finance__toggle-option(@click="refreshFinance('receivables')" :class="{'step-finance_active-option': matrixOption === 'receivables'}") Receivables
      .step-finance__toggle-option(@click="refreshFinance('payables')" :class="{'step-finance_active-option': matrixOption === 'payables'}") Payables
    .step-finance__info-block(v-if="isInfoShown")
      .step-finance__info-block-content
        .step-finance__top-controls
          span.step-finance__icons
            img.step-finance__icon(@click.stop="makeAction(key)" v-for="(icon, key) in icons" :src="icon.icon" :class="{'finance-icon_opacity': (key === 'save' && readonly) || (key === 'edit' && !readonly) }")
        .step-finance__info-body
          .step-finance__left-body-block
            .step-finance__rate._row
              div Rate
              input(type="text" :value="infoBlockData.rate" :readonly="readonly" :class="{focus: !readonly}")
            .step-finance__quantity-R._row
              div Quantity[Relative]:
              input(type="text" :value="infoBlockData.quantity_R" :readonly="readonly" :class="{focus: !readonly}")
            .step-finance__subtotal._row
              div Subtotal
              input(type="text" :value="infoBlockData.subtotal" :readonly="readonly" :class="{focus: !readonly}")
          .step-finance__right-body-block
            .step-finance__charge._row
              div Minimum charge
              input(type="text" :value="infoBlockData.charge" :readonly="readonly" :class="{focus: !readonly}")
            .step-finance__quantity-T._row
              div Quantity [Total]:
              input(type="text" :value="infoBlockData.quantity_total" :readonly="readonly" :class="{focus: !readonly}")
            .step-finance__discounts._row
              div Discounts/Surcharges
              input(type="text" :value="infoBlockData.discounts" :readonly="readonly" :class="{focus: !readonly}")
        .step-finance__info-total
              div Total:
              input(type="text" :value="infoBlockData.total" :readonly="readonly" :class="{focus: !readonly}")
</template>

<script>
import DataTable from "../../DataTable";
import StepInfoTitle from "./StepInfoTitle";

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
                {label: "Title", headerKey: "headerTitle", key: "title", width: "25%"},
                {label: "Receivables", headerKey: "headerReceivables", key: "receivables", width: "25%"},
                {label: "Payables", headerKey: "headerPayables", key: "payables", width: "25%"},
                {label: "Margin", headerKey: "headerMargin", key: "margin", width: "25%"},
            ],
          icons: {
            save: {icon: require('../../../assets/images/Other/save-icon-qa-form.png')},
            edit: {icon: require('../../../assets/images/Other/edit-icon-qa.png')},
          },
            isInfoShown: false,
            matrixOption: "receivables",
            isTooltipShow: false,
            isMatrixShown: true,
            readonly: true,
          infoBlockData: {
              rate: '0.08 €',
              quantity_R: '12000',
              subtotal: '960.00 €',
              charge: '0.00 €',
              quantity_total: '13000',
              discounts: '+240 €',
              total: '1200 €'
          },
        }
    },
    methods: {
      makeAction(key){
        if (key === 'edit') {
          this.readonly = false;
          console.log('finance data: ', this.financeData);
        } else if (key ===  'save') {
          this.readonly = true;
        }
      },
      refreshFinance(value) {
        console.log('value refresh: ', value);
        if(this.matrixOption === value) {
          return
        }
        // if(value === 'payables' && !this.step.vendor) {
        //   return this.noVendorToolTip()
        // }
        this.matrixOption = value;
        this.$emit("refreshFinance", {costs: value});
        if (value === 'payables') {
          this.infoBlockData.rate = this.financeDataRate.vendorRate + ' €';
          this.infoBlockData.quantity_R = this.financeData[0].payables;
          this.infoBlockData.quantity_total = this.financeData[0].payables;
          this.infoBlockData.total = this.financeData[1].payables;
          this.infoBlockData.subtotal = (this.infoBlockData.quantity_R * this.financeDataRate.vendorRate).toFixed(2) + '';
          this.infoBlockData.discounts =  '0 €';
          this.infoBlockData.charge = '0.00 €';
        } else if (value === 'receivables') {
          this.infoBlockData.rate = this.financeDataRate.clientRate  + ' €';
          this.infoBlockData.quantity_R = this.financeData[0].receivables;
          this.infoBlockData.quantity_total = this.financeData[0].receivables;
          this.infoBlockData.total = this.financeData[1].receivables;
          this.infoBlockData.subtotal = (this.infoBlockData.quantity_R * this.financeDataRate.clientRate).toFixed(2) + '';
          this.infoBlockData.discounts =  '0 €';
          this.infoBlockData.charge = '0.00 €';
        }



      },
        toggleInfoShow() {
            this.isInfoShown = !this.isInfoShown;
        },
        showMoney(row, key) {
            return row.title !== "Wordcount" && row[key]
        }
    },
    computed: {
        totalSum() {
            const price = this.financeData.find(item => {
                return item.title === "Price"
            })
            return {total: price.receivables, margin: price.receivables - price.payables};
        }
    },
    components: {
        DataTable,
        StepInfoTitle
    },
    mounted() {
      console.log('financeData: ',this.financeData);
      console.log('financeDataRate: ',this.financeDataRate);
      this.infoBlockData.rate = this.financeDataRate.clientRate  + ' €';
      this.infoBlockData.quantity_R = this.financeData[0].receivables;
      this.infoBlockData.quantity_total = this.financeData[0].receivables;
      this.infoBlockData.total = this.financeData[1].receivables;
      this.infoBlockData.subtotal = (this.infoBlockData.quantity_R * this.financeDataRate.clientRate).toFixed(2) + '';
      this.infoBlockData.discounts =  '0 €';
      this.infoBlockData.charge = '0.00 €';
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.step-finance {
    box-shadow: 0 0 5px $brown-shadow;
    padding: 10px;

    &__info-total {
      padding: 20px;
      display: flex;
      align-items: center;
      div {
        &:first-child{
          margin-right: 116px;
        }
      }
    }
   .finance-icon_opacity {
       opacity: 0.5;
       pointer-events: none;
   }
    &__icon{
      margin-right: 10px;
      cursor:pointer;
    }
    &__info-block {
      width: calc(100% - 40px);

      height: 295px;
      padding: 20px;
      box-shadow: 1px 1px 11px $cell-background;

      &-content {
        height: 100%;
      }
    }
    &__top-controls{
      height: 10%;
      text-align: right;
    }
    &__info-body {
      display: flex;
      width:100%;
      height:70%;
      border-bottom: 2px solid $cell-background;
      ._row {
        padding:20px;
        display:flex;
        align-items: center;
        div {
          width: 50%;
        }

      }
    }
    input[type="text"] {
      color:inherit;
      font-family: inherit;
      border: none;
      outline: none;
      text-align: left;
      width: 100px;
      border-radius: 18px;
      padding: 5px;
      &.focus {
        border: 2px solid rgba(153, 142, 126, 0.8);
      }
    }
    input[type="text"]:focus {
      box-shadow: none;
    }
    &__left-body-block {
      width: 50%;
      height: 100%;
    }
    &__right-body-block {
      width: 50%;
      height: 100%;
    }
    &__toggler {
      display: flex;
      margin-top: 10px;
      position: relative;
    }
    &__toggle-option {
      padding: 5px;
      width: 10%;
      font-size: 14px;
      border: 1px solid $brown-border;
      border-bottom: none;
      border-top-right-radius: 10px;
      border-top-left-radius: 3px;
      background-color: $table-row-zebra-background;
      box-shadow: inset 0 0 3px $brown-shadow;
      cursor: pointer;
      opacity: 0.6;
      z-index: 0;
    }
    &_active-option {
      background-color: $white;
      opacity: 1;
    }
    &__info {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        display: none;
        transition: all 0.3s;
    }
    &_flex-display {
       display: flex;
    }
    &__table {
        width: 70%;
    }
    &__results {
        width: 25%;
        font-size: 18px;
        padding: 10px;

        box-shadow: 1px 1px 11px $cell-background;
    }
    &__summary-value {
        display: flex;
        width: 70%;
        justify-content: space-between;
        margin-bottom: 5px;
    }
}
</style>

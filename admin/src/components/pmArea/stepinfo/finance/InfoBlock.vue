<template lang="pug">
  div(v-if="isInfoShown")
    .step-finance__toggler
      .step-finance__toggle-option(@click="refreshFinance('receivables')" :class="{'step-finance_active-option': matrixOption === 'receivables'}") Receivables
      .step-finance__toggle-option(@click="refreshFinance('payables')" :class="{'step-finance_active-option': matrixOption === 'payables'}") Payables
    .step-finance__info-block
      .step-finance__info-block-content
        .step-finance__top-controls
          span.step-finance__icons
            img.step-finance__icon(@click.stop="makeAction(key)" v-for="(icon, key) in icons" :src="icon.icon" :class="{'finance-icon_opacity': (key === 'save' && readonly) || (key === 'edit' && !readonly) }")
        .step-finance__info-body
          .step-finance__left-body-block
            .step-finance__rate._row
              div Rate
              .input-wrapper
                input(type="text" v-model="infoBlockData['Rate']" :readonly="readonly" :class="{focus: !readonly}")
                span  &nbsp;€
            .step-finance__quantity-R._row
              div Quantity[Relative]:
              .input-wrapper
                input(type="text" v-model="infoBlockData['Quantity[Relative]']" :readonly="readonly" :class="{focus: !readonly}")
            .step-finance__subtotal._row
              div Subtotal
              .input-wrapper
                input(type="text" v-model="infoBlockData['Subtotal']" :readonly="readonly" :class="{focus: !readonly}")
                span  &nbsp;€
          .step-finance__right-body-block
            .step-finance__charge._row
              div Minimum charge
              .input-wrapper
                input(type="text" v-model="infoBlockData['Minimum charge']" :readonly="readonly" :class="{focus: !readonly}")
                span  &nbsp;€
            .step-finance__quantity-T._row
              div Quantity [Total]:
              .input-wrapper
                input(type="text" v-model="infoBlockData['Quantity [Total]']" :readonly="readonly" :class="{focus: !readonly}")
            .step-finance__discounts._row
              div Discounts/Surcharges
              .input-wrapper
                input(type="text" v-model="infoBlockData['Discounts/Surcharges']" :readonly="readonly" :class="{focus: !readonly}")
                span  &nbsp;€
        .step-finance__info-total
          .step-finance__left-body-block
            .step-finance__rate._row
              div Total:
              .input-wrapper
                input(type="text" v-model="infoBlockData['Total']" :readonly="readonly" :class="{focus: !readonly}")
                span  &nbsp;€
        .step-finance__approve-action(v-if="selectedAction")
          ApproveModal(
            :text="customizedModalText"
            approveValue="Yes"
            notApproveValue="Cancel"
            @approve="approveAction"
            @notApprove="closeModal"
            @close="closeModal"
          )
    ValidationErrors(v-if="areErrorsExist" :errors="errors" @closeErrors="closeErrorsBlock")
</template>

<script>
  import ValidationErrors from "../../../ValidationErrors";
  import ApproveModal from "../../../ApproveModal";
    export default {
      props: {
        isInfoShown: {
          type: Boolean
        },
        financeData: {
          type: Array
        },
        financeDataRate: {
          type: Object
        }
      },
      data() {
        return {
          icons: {
            save: {icon: require('../../../../assets/images/Other/save-icon-qa-form.png')},
            edit: {icon: require('../../../../assets/images/Other/edit-icon-qa.png')},
          },
          matrixOption: "receivables",
          readonly: true,
          infoBlockData: {
            'Rate': '',
            'Quantity[Relative]': '',
            'Subtotal': '',
            'Minimum charge': '',
            'Quantity [Total]': '',
            'Discounts/Surcharges': '',
            'Total': ''
          },
          infoBlockDataCopy: {},
          errors: [],
          areErrorsExist: false,
          selectedAction: "",
          customizedModalText: ''
        }
      },
      methods:{
        setPayablesValues() {
          this.infoBlockData['Rate'] = this.financeDataRate.vendorRate;
          this.infoBlockData['Quantity[Relative]'] = this.financeData[0].payables;
          this.infoBlockData['Quantity [Total]'] = this.financeData[0].payables;
          this.infoBlockData['Total'] = this.financeData[1].payables;
          this.infoBlockData['Subtotal'] = (this.infoBlockData['Quantity[Relative]'] * this.financeDataRate.vendorRate).toFixed(2);
          this.infoBlockData['Discounts/Surcharges'] = '0';
          this.infoBlockData['Minimum charge'] = '0.00';
        },
        setReceivablesValues() {
          this.infoBlockData['Rate'] = this.financeDataRate.clientRate;
          this.infoBlockData['Quantity[Relative]'] = this.financeData[0].receivables;
          this.infoBlockData['Quantity [Total]'] = this.financeData[0].receivables;
          this.infoBlockData['Total'] = this.financeData[1].receivables;
          this.infoBlockData['Subtotal'] = (this.infoBlockData['Quantity[Relative]'] * this.financeDataRate.clientRate).toFixed(2);
          this.infoBlockData['Discounts/Surcharges'] = '0';
          this.infoBlockData['Minimum charge'] = '0.00';
        },

        closeModal() {
          this.selectedAction = "";
        },
        approveAction() {
          if (this.selectedAction === "save") {
            this.updateFinanceDataAtServer();
          }
          this.closeModal();
        },
        updateFinanceDataAtServer() {
          this.readonly = true;
          // console.log('Data to update at the server: ', this.infoBlockData);
        },
        checkForErrors() {
          Object.keys(this.infoBlockData).map((key) => {
            this.infoBlockData[key] = String(this.infoBlockData[key]).replace(/[^0-9.,]/g, '').replace(/,/g, '.');
            if ((!parseFloat(this.infoBlockData[key]) && parseFloat(this.infoBlockData[key]) !== 0) || String(this.infoBlockData[key]).includes(',')) {
              this.errors.push(`Field '${key}' is invalid`);
              this.infoBlockData[key] = this.infoBlockDataCopy[key];
            } else {
              this.infoBlockData[key] = parseFloat(this.infoBlockData[key]);
            }
          });
          if (this.errors.length) {
            this.areErrorsExist = true;
          }
        },
        closeErrorsBlock() {
          this.areErrorsExist = false;
          this.errors = [];
        },
        makeAction(key) {
          if (key === 'edit') {
            this.customizedModalText = `Do you want to save changed rate value in ${this.matrixOption === "receivables" && "client's" || "vendor's" } rates?`;
            this.infoBlockDataCopy = {...this.infoBlockData};
            this.readonly = false;
          } else if (key === 'save') {
            this.checkForErrors();
            if (!this.areErrorsExist) {
              if (this.infoBlockDataCopy['Rate'] !== this.infoBlockData['Rate']) {
                this.selectedAction = 'save';
              } else {
                this.updateFinanceDataAtServer();
              }
            } else {
              // console.log('There are errors!');
            }

          }
        },
        refreshFinance(value) {
          this.readonly = true;
          if (this.matrixOption === value) {
            return
          }
          this.matrixOption = value;
          // this.$emit("refreshFinance", {costs: value});
          if (value === 'payables') {
            this.setPayablesValues();
          } else if (value === 'receivables') {
            this.setReceivablesValues();
          }
          this.closeModal();
        },
      },
      components: {
        ValidationErrors,
        ApproveModal,
      },
      mounted() {
        this.setReceivablesValues();
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
    &__approve-action {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 30;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .finance-icon_opacity {
      opacity: 0.5;
      pointer-events: none;
    }
    &__icon {
      margin-right: 10px;
      cursor: pointer;
    }
    &__info-block {
      width: calc(100% - 40px);
      height: 255px;
      padding: 20px;
      box-shadow: 1px 1px 11px $cell-background;
      position: relative;
      &-content {
        height: 100%;
      }
    }
    &__top-controls {
      height: 10%;
      text-align: right;
    }
    &__info-body {
      display: flex;
      width: 100%;
      height: 70%;
      border-bottom: 2px solid $cell-background;
      ._row {
        padding: 10px 20px;
        display: flex;
        align-items: center;
        min-height: 32px;
        div:first-child {
          width: 50%;
          font-weight: 600;
        }
        .input-wrapper {
          width: 25%;
          display: flex;
          align-items: center;
          span {
            opacity: 0.6;
          }
        }
      }
    }
    &__info-total {
      display: flex;
      width: 100%;
      ._row {
        padding: 10px 20px;
        display: flex;
        align-items: center;
        min-height: 32px;
        div:first-child {
          width: 50%;
          font-weight: 600;
        }
        .input-wrapper {
          width: 25%;
          display: flex;
          align-items: center;
          span {
            opacity: 0.6;
          }
        }
      }
    }
    input[type="text"] {
      color: inherit;
      width: 100%;
      font-family: inherit;
      border: none;
      outline: none;
      text-align: left;
      border-radius: 18px;
      padding: 5px;
      opacity: 0.6;
      &.focus {
        border: 1px solid rgba(153, 142, 126, 0.8);
        opacity: 1;
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
  }
</style>

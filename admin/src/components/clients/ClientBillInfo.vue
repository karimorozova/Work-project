<template lang="pug">
    .billing-info
        .names-info
            .names-info__item
                label.names-info__label Official Company Name:
                input(type="text" :value="client.billingInfo.officialCompanyName" @change="(e) => changeProperty(e, 'officialCompanyName')")

            .names-info__item
                label.names-info__label Contact Name:
                input(type="text" :value="client.billingInfo.contactName" @change="(e) => changeProperty(e, 'contactName')")

            .names-info__item
                label.names-info__label.names-info_asterisk Email:
                input(type="text" :value="client.billingInfo.email" @change="(e) => changeProperty(e, 'email')" :class="{'names-info_error-shadow': errorFields.indexOf('email') !== -1}")
            
            .names-info__item
                label.names-info__label VAT: 
                span.checkbox
                    input(type="checkbox" id="vat" :checked="client.billingInfo.vat" @change="setVAT")
                    label(for="vat")

            .names-info__item
                label.names-info__label Due Date:
                .names-info__dueDate
                    input(type="text" id="dueDate" :value="client.billingInfo.dueDate" @change="(e) => changeProperty(e, 'dueDate')")
                    .dueDate-date days since issue date
            
            .names-info__item
                label.names-info__label 
                    p Starting balance
                    p (for prepaid):
                input(type="number" :value="client.billingInfo.startingBalance" @change="(e) => changeProperty(e, 'startingBalance')")
  
        .names-info
            .names-info__item-address
                label.names-info__label Address: 
                textarea(type="text" placeholder="Text here" :value="client.billingInfo.address" @change="(e) => changeProperty(e, 'address')")

            .names-info__item
                label.names-info__label Automated invoice sending: 
                span.checkbox
                    input(type="checkbox" id="invoiceSending" :checked="client.billingInfo.invoiceSending" @change="setInvoiceSending")
                    label(for="invoiceSending")

            .names-info__item
                label.names-info__label Payment type:
                .names-info__drop
                    SelectSingle(
                        placeholder="Select"
                        :selectedOption="client.billingInfo.paymentType"
                        :options="['PPP','Pre-Payment','Monthly','50%/50%']"
                        @chooseOption="setPayment"                   
                    )

            .names-info__item
                label.names-info__label
                    p Balance
                    p (for prepaid):
                input(type="number" :value="client.billingInfo.balance" @change="(e) => changeProperty(e, 'balance')")           

            .names-info__item
                label.names-info__label
                    p Minimum balance
                    p (for prepaid):
                input(type="number" :value="client.billingInfo.minimumBalance" @change="(e) => changeProperty(e, 'minimumBalance')")
</template>

<script>
import SelectSingle from "../SelectSingle";
export default {
  props: {
    client: {
      type: Object
    },
    errorFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  methods: {
    changeProperty(e, prop) {
      this.$emit("changeProperty", { prop, value: e.target.value });
    },
    setInvoiceSending(e) {
      this.$emit("changeProperty", {
        prop: "invoiceSending",
        value: event.target.checked
      });
    },
    setVAT(e) {
      this.$emit("changeProperty", {
        prop: "vat",
        value: event.target.checked
      });
    },
    setPayment({ option }) {
      this.$emit("changeProperty", {
        prop: "paymentType",
        value: option
      });
    }
  },
  components: {
    SelectSingle
  }
};
</script>

<style lang="scss" scoped>
.billing-info {
  display: flex;
  justify-content: space-between;
}

.names-info {
  width: 40%;
  textarea {
    color: rgba(103, 87, 62, 0.5);
    height: 71px;
    width: 185px;
    border: 1px solid #67573e;
    border-radius: 5px;
    outline: none;
    resize: none;
    &:focus {
      color: #67573e;
    }
    &::-webkit-input-placeholder {
      opacity: 0.5;
    }
  }
  &__dueDate {
    width: 190px;
    display: flex;
    .dueDate-date {
      width: 110px;
      margin-left: 10px;
    }
  }
  &__drop {
    position: relative;
    width: 191px;
    height: 28px;
  }
  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    &-address {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    &:last-child {
      margin-bottom: 0;
    }
    label {
      margin-bottom: 0;
    }
    input {
      color: rgba(103, 87, 62, 0.5);
      border: 1px solid #67573e;
      border-radius: 5px;
      padding: 0 5px;
      outline: none;
      width: 191px;
      height: 30px;
      box-sizing: border-box;
      &:focus {
        color: #67573e;
      }
    }
  }
  &_error-shadow {
    box-shadow: 0 0 5px red;
  }
  &_asterisk {
    position: relative;
    &:after {
      position: absolute;
      content: "*";
      top: -3px;
      right: -8px;
      color: red;
      font-size: 14px;
    }
  }
  .checkbox {
    display: flex;
    height: 28px;
    width: 191px;
    input[type="checkbox"] {
      opacity: 0;
      + {
        label {
          &::after {
            content: none;
          }
        }
      }
      &:checked {
        + {
          label {
            &::after {
              content: "";
            }
          }
        }
      }
    }
    label {
      position: relative;
      display: inline-block;
      margin-top: 4px;
      &::before {
        position: absolute;
        content: "";
        display: inline-block;
        height: 16px;
        width: 16px;
        border: 1px solid;
        left: 0px;
        top: 3px;
      }
      &::after {
        position: absolute;
        content: "";
        display: inline-block;
        height: 5px;
        width: 9px;
        border-left: 2px solid;
        border-bottom: 2px solid;
        transform: rotate(-45deg);
        left: 4px;
        top: 7px;
      }
    }
  }
}
#dueDate {
  width: 70px;
}
#vat,
#invoiceSending {
  width: 0;
}
p {
  margin: 0;
}
</style>

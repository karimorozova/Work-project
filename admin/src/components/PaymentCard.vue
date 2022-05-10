<template lang="pug">
  .payment-card
    .payment-card__close(@click="closePaymentCard") &#215;
    .payment-card__title Payment
    .payment-card__header
      .payment-card__header-block
        .drop-title Payment Method:
        .drop
          SelectSingle(
            :selectedOption="paymentMethod.name || ''"
              :options="paymentMethods || []"
              placeholder="Option"
              @chooseOption="setPaymentMethod"
          )
      .payment-card__header-block
        .drop-title Payment Date:
        .drop
          DatePicker(
            :value="paymentDate"
            @confirm="(e) => setFromDate(e)"
            format="MMM D, HH:mm"
            type="datetime"
            ref="deadline"
            :clearable="false"
            :confirm="true"
            confirm-text="Set date"
            prefix-class="xmx"
          )
      .payment-card__header-block(v-if="!isNotes" @click="isNotes = true")
        .payment-card__link Add Note
      .payment-card__header-block(v-else style="margin-top: 10px; width: 100%;")
        .drop-title Notes:
        textarea(type="text" rows="4" v-model="notes")
    .payment-card__body
      .payment-card__body-block
        .drop-title Amount:
        input(v-model="paymentAmount" ref="input" @click="selectInput" :class="'payment-card__input'" type="number" style="background-color: white;")
      .payment-card__body-block
        .drop-title Unpaid Amount:
        input(:value="unpaidAmount" :class="'payment-card__input'" :disabled="true")
      .payment-card__body-block
        .payment-card__link(@click="approvePaidFull") Pay Full Amount
    .payment-card__buttons {{abilityToSubmitPayment}}
      Button(
        :isDisabled="!abilityToSubmitPayment"
        :value="`${abilityToSubmitPayment ? 'Submit ' + paymentAmount + ' €' : 'Cannot be confirmed' }`"
        @clicked="reportToPayment"
      )
      Button(:value="'Cancel'" :outline="true" @clicked="closePaymentCard")

</template>

<script>
import Button from "./Button"
import SelectSingle from "./SelectSingle"
import '../assets/scss/datepicker.scss'
import DatePicker from 'vue2-datepicker'


export default {
  name: "PaymentCard",
  components: {Button, SelectSingle, DatePicker},
  props: {
    invoiceId: {
      type: String
    },
    totalAmount: {
      type: Number
    },
    unpaidAmount: {
      type: Number
    },
    paymentMethods: {
      type: Array,
    }
  },
  data() {
    return {
      isNotes: false,
      amount: 0,

      paymentMethod: {  },
      paymentAmount: 0,
      paymentDate: new Date(),
      notes: "",
    }
  },
  methods: {
    closePaymentCard() {
      this.$emit('closePaymentCard')
    },
    setPaymentMethod({ option }) {
      this.paymentMethod = option
    },
    selectInput() {
      this.$refs.input.select()
    },
    setFromDate(e) {
      this.paymentDate = e
    },
    approvePaidFull() {
      this.paymentAmount = this.unpaidAmount
    },
    reportToPayment() {
      this.$emit('reportToPayment', {  paymentMethod: this.paymentMethod, paymentAmount: this.paymentAmount, paymentDate: this.paymentDate, notes: this.notes,})
    },
  },
  computed: {
    abilityToSubmitPayment() {
      return this.paymentAmount !== 0
          && this.paymentAmount !== '0'
          && this.paymentAmount > 0
          && this.paymentAmount <= this.unpaidAmount
    },
  }

}
</script>

<style scoped lang="scss">
@import "../assets/scss/colors";

.payment-card {
  background-color: white;
  padding: 25px;
  box-shadow: $box-shadow;
  border-radius: 2px;
  height: fit-content;
  z-index: 500;
  width: 510px;
  box-sizing: border-box;
  position: absolute;
  top: 10%;
  left: 485px;
  transform: translate(0%, -50%);

  &__buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 25px;
  }

  &__input {
    font-size: 14px;
    border: 1px solid $border;
    border-radius: 2px;
    box-sizing: border-box;
    padding: 0 7px;
    outline: none;
    width: 220px;
    height: 32px;
    transition: .1s ease-out;

    &:focus {
      border: 1px solid $border-focus;
    }
  }

  &__link {
    transition: .2s ease-out;
    margin-top: 10px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  &__body {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    margin: 15px 0;
    padding: 15px 0;
    border-top: 1px solid $light-border;
    border-bottom: 1px solid $light-border;
    flex-wrap: wrap;
  }

  &__title {
    text-align: center;
    font-family: 'Myriad900';
    text-transform: uppercase;
  }

  &__close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    cursor: pointer;
    height: 24px;
    width: 24px;
    justify-content: center;
    display: flex;
    align-items: center;
    font-family: Myriad600;
    opacity: 0.8;
    transition: ease 0.2s;

    &:hover {
      opacity: 1
    }
  }
}
.drop {
  height: 32px;
  position: relative;
  width: 220px;
  background-color: white;
  border-radius: 2px;

  &-title {
    margin-bottom: 3px;
  }
}
textarea {
  width: 100%;
  border-radius: 2px;
  border: 1px solid $border;
  padding: 5px;
  color: $text;
  outline: none;
  box-sizing: border-box;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>
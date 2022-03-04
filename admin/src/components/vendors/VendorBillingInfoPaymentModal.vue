<template lang="pug">
  .payment-methods-modal
    ValidationErrors(
      v-if="errors.length"
      :errors="errors"
      :isAbsolute="true"
      @closeErrors="closeErrors"
    )

    .modalRow
      .modalRow__key Payment Method Name:
      .modalRow__value
        input(v-model="currentName" placeholder="Value")

    .modalRow
      .modalRow__key Payment Method Type:
      .modalRow__value
        .selectSingle
          SelectSingle(
            :isDisabled="reports.some(item => item.paymentDetails.paymentMethod && item.paymentDetails.paymentMethod.name === editablePaymentMethod.name)"
            placeholder="Option"
            :options="paymentMethods.map(i => i.name)"
            :selectedOption="currentType"
            @chooseOption="setPaymentType"
          )

    .modalRow(v-if="isAvailableExtraFields" v-for="item in getKeys" )
      .modalRow__key {{item}}:
      .modalRow__value
        input(
          v-on:keyup="(e) => setPropVal(item, e.target.value)"
          :value="rest[item]"
          placeholder="Value"
        )

    .modalRow(v-if="isAvailableExtraFields")
      .modalRow__key Threshold amount:
      .modalRow__value
        input(v-model="currentMinimumAmount" type="number" placeholder="Value")

    .modalButton
      Button(@clicked="saveState" value="Save")
      Button(@clicked="closeModal" value="Cancel" :outline="true")

</template>
<script>
import SelectSingle from "../SelectSingle"
import Button from "../Button"
import ValidationErrors from "../ValidationErrors"
import { mapActions } from "vuex"

export default {
  name: "VendorBillingInfoPaymentModal",
  components: { ValidationErrors, Button, SelectSingle },
  props: {
    editablePaymentMethod: {
      type: Object,
      default: () => ({})
    },
    reports: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      currentType: '',
      currentName: '',
      currentMinimumAmount: 0,
      rest: {},
      paymentMethods: [],

      errors: []
    }
  },
  methods: {
    ...mapActions([ 'alertToggle' ]),
    closeModal() {
      this.$emit('closePaymentMethod')
    },
    saveState() {
      this.errors = []
      const values = Object.values(this.rest).filter(Boolean)
      if (!values.length) this.errors.push('All fields are required')
      if (values.some(i => !i)) this.errors.push('All fields are required')
      if (!this.currentName) this.errors.push("Please, enter a payment method name")
      if (this.errors.length) return

      this.$emit('savePaymentMethod', {
        paymentType: this.currentType,
        name: this.currentName,
        minimumAmount: this.currentMinimumAmount < 0 ? 0 : this.currentMinimumAmount,
        otherStatement: this.rest
      })
    },
    closeErrors() {
      this.errors = []
    },
    setPropVal(prop, value) {
      this.$set(this.rest, prop, value)
    },
    setPaymentType({ option }) {
      this.currentType = option
      const { minimumAmount, keys } = this.paymentMethods.find(item => item.name === option)
      this.currentMinimumAmount = minimumAmount
      this.rest = {}
      keys.forEach(elem => this.rest[elem.key] = '')
    },
    async getPaymentsMethods() {
      try {
        const result = await this.$http.get("/api-settings/payment-methods")
        this.paymentMethods = result.data
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Methods", isShow: true, type: "error" })
      }
    },
    setEditableDefaultData() {
      if (this.editablePaymentMethod.name) {
        const { paymentType, name, minimumAmount, otherStatement } = this.editablePaymentMethod
        this.currentType = paymentType
        this.currentName = name
        this.currentMinimumAmount = minimumAmount
        this.rest = otherStatement
      }
    }
  },
  computed: {
    isAvailableExtraFields() {
      return this.currentType && this.paymentMethods.length
    },
    getKeys() {
      if (!this.isAvailableExtraFields) return []
      const method = this.paymentMethods.find(j => j.name === this.currentType)
      if (!method) return []
      return method.keys.map(i => i.key)
    }
  },
  created() {
    this.getPaymentsMethods()
    this.setEditableDefaultData()
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.modalButton {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 25px;
}

.selectSingle {
  width: 220px;
  height: 32px;
  position: relative;
}

.modalRow {
  display: flex;
  height: 32px;
  align-items: center;
  margin-bottom: 10px;

  &__key {
    width: 190px;
    margin-right: 10px;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  width: 220px;
  font-family: 'Myriad400';
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>
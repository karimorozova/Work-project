<template lang="pug">
  .wrapper
    .approve(v-show="isDeletingModal")
      .approve__modal
        ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="No"
          @approve="deletePaymentMethod"
          @close="closeApproveModal"
          @notApprove="closeApproveModal"
        )

    .modal(v-if="isModal")
      VendorBillingInfoPaymentModal(
        :editablePaymentMethod="editablePaymentMethod"
        @closePaymentMethod="closeModal"
        @savePaymentMethod="savePaymentMethod"
      )

    .billing-info(v-if="currentVendor.billingInfo")
      .billing-info__col
        .colRow
          .colRow__key Same as in Profile:
          .colRow__value
            CheckBox(:isChecked="isSameAsInGeneralInformation" @check="toggleCheck(true)" @unCheck="toggleCheck(false)")

        .colRow
          .colRow__key Official Name:
          .colRow__value
            input(
              :value='billingInfo.officialName'
              @change="(e) => changeBillingProp('officialName', e.target.value)"
              @mouseleave="(e) => changeBillingProp('officialName', e.target.value)"
            )

        .colRow
          .colRow__key Email:
          .colRow__value
            input(
              :value='billingInfo.email'
              @change="(e) => changeBillingProp('email', e.target.value)"
              @mouseleave="(e) => changeBillingProp('email', e.target.value)"
            )

        .colRow
          .colRow__key Payment term:
          .colRow__value
            .selectSingle
              SelectSingle(
                :isDisabled="true"
                placeholder="Select"
                :options="paymentTerms.map(i => i.name)"
                :selectedOption="billingInfo.paymentTerm.name || ''"
                @chooseOption="({option}) => changeBillingProp('paymentTerm', paymentTerms.find(i => i.name === option))"
              )

        .billing-info__buttons(v-if="someChanged")
          Button(value="Save" @clicked="checkErrors")
          Button(value="Cancel" :outline="true" @clicked="cancelChanges")

      .billing-info__col
        .addressRow
          .addressRow__key Address:
          .addressRow__value
            textarea(
              @change="(e) => changeBillingProp('address', e.target.value)"
              @mouseleave="(e) => changeBillingProp('address', e.target.value)"
              :value="billingInfo.address"
              wrap="hard"
            )

    .payment-methods
      .payment-methods__header
        .payment-methods__header--title Payment methods
        .payment-methods__header--add
          Add(@add="isModal = true")

      .payment-methods__body
        .item(v-for="(item, index) in billingInfo.paymentMethods")
          .item__header

            .item__header--icons(v-if="deletingIndex === null && editingIndex === null")
              .item__header--icon(@click="openModalForEdition(item, index)")
                i(class="fas fa-pen")
              .item__header--icon(@click="openApproveModal(item, index)")
                i(class="fas fa-trash")
            .item__header--icons(v-else)
              .item__header--icon
                i(class="fas fa-pen")
              .item__header--icon
                i(class="fas fa-trash")

          .item__body(v-for="[key, value] in Object.entries(allFieldsOutput(item))" )
            .item__body--key {{ replaceKeyName(key) }}:
            .item__body--value {{ value }}

</template>

<script>
import CheckBox from "../../../../../components/general/CheckBox"
import SelectSingle from "../../../../../components/general/SelectSingle"
import Button from "../../../../../components/general/Button"
import Add from "../../../../../components/general/Add"
import ApproveModal from "../../../../../components/general/ApproveModal"
import { mapActions } from "vuex"
import VendorBillingInfoPaymentModal from "./VendorBillingInfoPaymentModal"


export default {
  props: {
    currentVendor: {
      type: Object
    }
  },
  watch: {
    currentVendor: function (updatedVendor) {
      this.billingInfo = JSON.parse(JSON.stringify(updatedVendor.billingInfo))
    }
  },
  data() {
    return {
      editablePaymentMethod: {},
      paymentTerms: [],
      billingInfo: JSON.parse(JSON.stringify(this.currentVendor.billingInfo)),
      isModal: false,

      editingIndex: null,
      deletingIndex: null,
      isDeletingModal: false,
      reports: []
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    allFieldsOutput(item, result = {}) {
      for (const key in item) {
        if (typeof item[key] === 'object') {
          return this.allFieldsOutput(item[key], result)
        } else {
          result = {
            ...result,
            [key]: item[key]
          }
        }
      }
      delete result._id
      return result
    },
    replaceKeyName(key) {
      if (key === 'paymentType') return 'Payment Type'
      if (key === 'minimumAmount') return 'Minimum Payment Amount'
      if (key === 'name') return 'Name'
      return key
    },
    async savePaymentMethod(paymentMethod) {
      try {
        const result = await this.$axios.post("/vendor/manage-payment-methods", {
          index: this.editingIndex,
          vendorId: this.currentVendor._id,
          paymentTypeObj: paymentMethod
        })
        await this.$emit('updateData')
      } catch (err) {
        this.alertToggle({ message: "Error on updating payment methods", isShow: true, type: "error" })
      } finally {
        this.closeModal()
      }
    },
    closeApproveModal() {
      this.deletingIndex = null
      this.isDeletingModal = false
    },
    async deletePaymentMethod() {
      try {
        const result = await this.$axios.post(`/vendor/manage-payment-methods/${ this.currentVendor._id }/${ this.deletingIndex }/delete`)
        await this.$emit('updateData')
        this.alertToggle({ message: "Removed", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on removing!", isShow: true, type: "error" })
      } finally {
        this.closeModal()
        this.closeApproveModal()
      }
    },
    // isPaymentMethodInInvoice({ name }) {
    //   const reports = this.reports.filter(item => item.paymentDetails.paymentMethod)
    //   if (!reports.length) return false
    //   return reports.some(item => item.paymentDetails.paymentMethod.name === name)
    // },
    openApproveModal(item, index) {
      // if (this.isPaymentMethodInInvoice(item)) {
      //   alert('Payment method in invoice!')
      //   return
      // }
      this.deletingIndex = index
      this.isDeletingModal = true
    },
    openModalForEdition(item, index) {
      // if (this.isPaymentMethodInInvoice(item)) {
      //   alert('Payment method in invoice!')
      //   return
      // }
      this.editingIndex = index
      this.isModal = true
      this.editablePaymentMethod = item
    },
    closeModal() {
      this.editingIndex = null
      this.isModal = false
      this.editablePaymentMethod = {}
    },
    changeBillingProp(key, value) {
      this.billingInfo[key] = value
    },
    toggleCheck(bool) {
      if (bool) {
        const { firstName, surname, email } = this.currentVendor
        this.billingInfo.email = email
        this.billingInfo.officialName = `${ firstName } ${ surname || '' }`
      }
    },
    async getAndSetPaymentTerms() {
      try {
        const result = await this.$axios.get(`/vendor/payment-terms`)
        this.paymentTerms = result.data.filter(i => !!i.isActive)
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Terms in Billing Information", isShow: true, type: "error" })
      }
    },
    isEqualBillingInfo(billingInfo, secondBillingInfo) {
      return billingInfo.email === secondBillingInfo.email
          && billingInfo.address === secondBillingInfo.address
          && billingInfo.officialName === secondBillingInfo.officialName
    },
    checkErrors() {
      this.saveChanges()
    },
    async saveChanges() {
      try {
        await this.$axios.post(`/vendor/payment-terms/${ this.currentVendor._id }/update`, { billingInfo: this.billingInfo })
        await this.$emit('updateData')
        this.alertToggle({ message: "Saved", isShow: true, type: "success" })
      } catch (e) {
        this.alertToggle({ message: "Error on saving changes Billing Information", isShow: true, type: "error" })
      }
    },
    cancelChanges() {
      this.billingInfo = JSON.parse(JSON.stringify(this.currentVendor.billingInfo))
    },
    async getVendorReports() {
      try {
        const result = await this.$axios.get(`/vendor/reports?token=${ this.$store.state.token }`)
        const decode = window.atob(result.data)
        this.reports = JSON.parse(decode)
      } catch (err) {
      }
    }
  },
  computed: {
    isSameAsInGeneralInformation() {
      if (this.currentVendor.hasOwnProperty('firstName')) {
        const { firstName, surname, email } = this.currentVendor
        const name = `${ firstName } ${ surname || '' }`
        return name === this.billingInfo.officialName && email === this.billingInfo.email
      }
    },
    someChanged() {
      if (this.currentVendor.hasOwnProperty('firstName')) {
        return !this.isEqualBillingInfo(this.billingInfo, this.currentVendor.billingInfo)
      }
    }
  },
  async created() {
    await this.getAndSetPaymentTerms()
    await this.getVendorReports()
  },
  components: { VendorBillingInfoPaymentModal, CheckBox, SelectSingle, Button, ApproveModal, Add }

}
</script>

<style scoped lang="scss">
@import "../../../../../assets/scss/colors";

.payment-methods {
  margin-top: 15px;
  padding-top: 25px;
  border-top: 1px solid $light-border;

  &__body {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
  }

  &__header {
    display: flex;
    justify-content: space-between;

    &--title {
      font-size: 14px;
      font-family: Roboto600;
    }

    &--add {
      margin-top: -17px;
    }
  }
}

.modal {
  padding: 25px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  box-shadow: $box-shadow;
  z-index: 20;
}

.wrapper {
  position: relative;
}

.approve {
  &__modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.item {
  width: 307px;
  box-sizing: border-box;
  border-radius: 4px;
  margin-top: 20px;
  border: 1px solid $light-border;
  height: fit-content;

  &__body {
    padding: 6px 15px;
    display: flex;
    gap: 8px;
  }

  &__header {
    display: flex;
    justify-content: end;
    border-bottom: 1px solid $light-border;
    background-color: $light-background;
    padding: 5px 10px;
    margin-bottom: 10px;
    min-height: 18px;

    &--name {
      font-size: 14px;
      font-family: 'Roboto600';
      width: 200px;
    }

    &--icons {
      display: flex;
      gap: 10px;
    }

    &--icon {
      font-size: 14px;
      border-radius: 4px;
      height: 30px;
      width: 30px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: .2s ease-out;
      justify-content: center;
      border: 1px solid $border;
      color: $dark-border;
      box-sizing: border-box;
      background-color: white;

      &:hover {
        color: $text;
      }
    }
  }
}

.billing-info {
  display: flex;
  justify-content: space-between;

  &__buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
}

.colRow {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
  height: 32px;

  &__value {
    width: 220px;
  }

  &__key {
    width: 220px;
  }
}

.addressRow {
  display: flex;
  margin-top: 45px;

  &__key {
    width: 70px;
    height: 20px;
    margin-top: 6px;
  }

  &__value {
    width: 320px;
  }
}

.selectSingle {
  width: 220px;
  height: 32px;
  position: relative;
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  width: 220px;
  font-family: 'Roboto400';
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

textarea {
  color: $text;
  height: 80px;
  width: 310px;
  border: 1px solid $border;
  border-radius: 4px;
  outline: none;
  transition: .1s ease-out;
  padding: 5px;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>
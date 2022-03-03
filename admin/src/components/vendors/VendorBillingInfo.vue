<template lang="pug">
  .wrapper
    .approve(v-show="isDeletingModal")
      .approve__modal
        ApproveModal(
          text="Are you sure?"
          approveValue="Yes"
          notApproveValue="Cancel"
          @approve="deletePaymentMethod"
          @close="closeApproveModal"
          @notApprove="closeApproveModal"
        )

    .modal(v-if="isModal")
      VendorBillingInfoPaymentModal(
        :editablePaymentMethod="editablePaymentMethod"
        @closePaymentMethod="closeModal"
        @savePaymentMethod="savePaymentMethod"
        :reports="reports"
      )

    .billing-info
      .billing-info__col
        .colRow
          .colRow__key Same as in General Information:
          .colRow__value
            CheckBox(:isChecked="isSameAsInGeneralInformation" @check="toggleCheck(true)" @uncheck="toggleCheck(false)")

        .colRow
          .colRow__key Official Name:
          .colRow__value
            input(
              :value='currentVendor.billingInfo.officialName'
              @change="(e) => changeBillingProp('officialName', e.target.value)"
              @mouseleave="(e) => changeBillingProp('officialName', e.target.value)"
            )

        .colRow
          .colRow__key Email:
          .colRow__value
            input(
              :value='currentVendor.billingInfo.email'
              @change="(e) => changeBillingProp('email', e.target.value)"
              @mouseleave="(e) => changeBillingProp('email', e.target.value)"
            )

        .colRow
          .colRow__key Payment Term:
          .colRow__value
            .selectSingle
              SelectSingle(
                placeholder="Select"
                :options="paymentTerms.map(i => i.name)"
                :selectedOption="currentVendor.billingInfo.paymentTerm.name || ''"
                @chooseOption="({option}) => changeBillingProp('paymentTerm', paymentTerms.find(i => i.name === option))"
              )

      .billing-info__col
        .addressRow
          .addressRow__key Address:
          .addressRow__value
            textarea(
              :value="currentVendor.billingInfo.address"
              @change="(e) => changeBillingProp('address', e.target.value)"
              @mouseleave="(e) => changeBillingProp('address', e.target.value)"
              wrap="hard"
            )

    .payment-methods
      .payment-methods__header
        .payment-methods__header--title Payment methods
        .payment-methods__header--add
          Add(@add="isModal = true")

      .payment-methods__body
        .item(v-for="(item, index) in currentFullVendor.billingInfo.paymentMethods")
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
import CheckBox from "../CheckBox"
import SelectSingle from "../SelectSingle"
import { mapActions, mapGetters } from "vuex"
import Add from "../Add"
import Button from "../Button"
import ApproveModal from "../ApproveModal"
import VendorBillingInfoPaymentModal from "./VendorBillingInfoPaymentModal"

export default {
  data() {
    return {
      editablePaymentMethod: {},
      paymentTerms: [],
      isModal: false,

      editingIndex: null,
      deletingIndex: null,
      isDeletingModal: false,
      reports: []
    }
  },
  methods: {
    ...mapActions({
      updateCurrentVendorGeneralDataBillingInfo: 'updateCurrentVendorGeneralDataBillingInfo',
      alertToggle: 'alertToggle',
      storeCurrentVendor: "storeCurrentVendor"
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
    async savePaymentMethod(paymentMethod) {
      try {
        const result = await this.$http.post("/vendorsapi/manage-payment-methods", {
          index: this.editingIndex,
          vendorId: this.$route.params.id,
          paymentTypeObj: paymentMethod
        })
        await this.storeCurrentVendor(result.data)
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
        const result = await this.$http.delete(`/vendorsapi/manage-payment-methods/${ this.$route.params.id }/${ this.deletingIndex }`)
        await this.storeCurrentVendor(result.data)
        this.alertToggle({ message: "Removed", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Error on removing!", isShow: true, type: "error" })
      } finally {
        this.closeModal()
        this.closeApproveModal()
      }
    },
    isPaymentMethodInInvoice({ name }) {
      const reports = this.reports.filter(item => item.paymentDetails.paymentMethod)
      if (!reports.length) return false
      return reports.some(item => item.paymentDetails.paymentMethod.name === name)
    },
    openApproveModal(item, index) {
      if (this.isPaymentMethodInInvoice(item)) {
        alert('Payment method in invoice!')
        return
      }
      this.deletingIndex = index
      this.isDeletingModal = true
    },
    openModalForEdition(item, index) {
      // if (this.isPaymentMethodInInvoice(item)) {
      //   alert('Payment method in invoice!')
      //   return
      // }
      this.editablePaymentMethod = item
      this.isModal = true
      this.editingIndex = index
    },
    closeModal() {
      this.editingIndex = null
      this.isModal = false
      this.editablePaymentMethod = {}
    },

    changeBillingProp(key, value) {
      this.updateCurrentVendorGeneralDataBillingInfo({ key, value })
    },
    toggleCheck(bool) {
      if (bool) {
        const { firstName, surname, email } = this.currentVendor
        this.updateCurrentVendorGeneralDataBillingInfo({ key: 'officialName', value: `${ firstName } ${ surname || '' }` })
        this.updateCurrentVendorGeneralDataBillingInfo({ key: 'email', value: `${ email }` })
      }
    },
    replaceKeyName(key) {
      if (key === 'paymentType ') return 'Payment Type '
      if (key === 'minimumAmount') return 'Threshold amount'
      if (key === 'name') return 'Name'
      return key
    },
    async getAndSetPaymentTerms() {
      try {
        const result = await this.$http.get("/api-settings/payment-terms")
        const { paymentTerms } = result.data
        this.paymentTerms = paymentTerms.filter(i => !!i.isActive)
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Terms in Billing Information", isShow: true, type: "error" })
      }
    },
    async getVendorReport() {
      try {
        const result = await this.$http.get(`/invoicing-payables/vendor-reports/${ this.$route.params.id }`)
        this.reports = result.data
      } catch (err) {
        this.alertToggle({ message: "Error on getting Payment Reports", isShow: true, type: "error" })
      }
    },
    async getValue() {
      try {
        this.value = (await this.$http.get('/api-settings/vendor-payment-benchmark')).data.value
      } catch (err) {
        this.alertToggle({ message: "Error on getting Value", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendorGeneralData",
      currentFullVendor: "getCurrentVendor"
    }),
    isSameAsInGeneralInformation() {
      if (this.currentVendor.hasOwnProperty('firstName')) {
        const { firstName, surname, email, billingInfo } = this.currentVendor
        const name = `${ firstName } ${ surname || '' }`
        return name === billingInfo.officialName && email === billingInfo.email
      }
    }
  },
  created() {
    this.getAndSetPaymentTerms()
    this.getVendorReport()
    this.getValue()
  },
  components: { VendorBillingInfoPaymentModal, ApproveModal, Button, Add, CheckBox, SelectSingle }

}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.payment-methods {
  margin-top: 15px;
  padding-top: 25px;
  border-top: 1px solid $light-border;

  &__body {
    display: flex;
    flex-wrap: wrap;
    gap: 25px;
  }

  &__header {
    display: flex;
    justify-content: space-between;

    &--title {
      font-size: 14px;
      font-family: Myriad600;
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
  transform: translate(-50%, -49%);
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
    transform: translate(-50%, -49%);
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
      font-family: 'Myriad600';
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
  font-family: 'Myriad400';
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
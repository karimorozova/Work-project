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

    .payment-methods__modal(v-if="isModal")
      .modalRow
        .modalRow__key Payment type:
        .modalRow__value
          .selectSingle
            SelectSingle(
              placeholder="Select"
              :options="paymentTypes"
              :selectedOption="currentPaymentType"
              @chooseOption="setPaymentType"
            )

      template(v-if="currentPaymentType === 'PayPal'")
        .modalRow
          .modalRow__key Payment Type Name:
          .modalRow__value
            input(v-model="paypalType.name" placeholder="Name")
        .modalRow
          .modalRow__key Email:
          .modalRow__value
            input(v-model="paypalType.email" placeholder="Email")

      template(v-if="currentPaymentType === 'Bank Details'")
        .modalRow
          .modalRow__key Payment Type Name:
          .modalRow__value
            input(v-model="bankType.name" placeholder="Name")
        .modalRow
          .modalRow__key Bank Account Name:
          .modalRow__value
            input(v-model="bankType.accountName" placeholder="Account Name")
        .modalRow
          .modalRow__key IBAN:
          .modalRow__value
            input(v-model="bankType.IBAN" placeholder="IBAN")
        .modalRow
          .modalRow__key SWIFT/BIC:
          .modalRow__value
            input(v-model="bankType.SWIFT" placeholder="SWIFT/BIC")

      .buttons
        Button(@clicked="manageModalState" :isDisabled="!bankType.name && !paypalType.name" value="Save")
        Button(@clicked="closeModal" value="Cancel" :outline="true")

    .billing-info
      .billing-info__col
        .colRow
          .colRow__key Same as in General Information:
          .colRow__value
            CheckBox(:isChecked="isSameAsInGeneralInformation" @check="toggleCheck(true)" @uncheck="toggleCheck(false)")

        .colRow
          .colRow__key Official Name:
          .colRow__value
            input(:value='currentVendor.billingInfo.officialName' @change="(e) => changeBillingProp('officialName', e.target.value)")

        .colRow
          .colRow__key Email:
          .colRow__value
            input(:value='currentVendor.billingInfo.email' @change="(e) => changeBillingProp('email', e.target.value)")

        .colRow
          .colRow__key Payment term:
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
            textarea(:value="currentVendor.billingInfo.address" @change="(e) => changeBillingProp('address', e.target.value)")

    .payment-methods
      .payment-methods__header
        .payment-methods__header--title Payment methods:
        .payment-methods__header--add
          Add(@add="isModal = true")

      .payment-methods__body
        .item(v-for="(item, index) in currentFullVendor.billingInfo.paymentMethod")
          .item__header
            .item__header--name {{ item.name }}

            .item__header--icons(v-if="deletingIndex === null && editingIndex === null")
              .item__header--icon(@click="openModalForEdition(item, index)")
                i(class="fas fa-pen")
              .item__header--icon(@click="openApproveModal(index)")
                i(class="fas fa-trash")
            .item__header--icons(v-else)
              .item__header--icon
                i(class="fas fa-pen")
              .item__header--icon
                i(class="fas fa-trash")

          template(v-if="item.type === 'Bank Details'")
            .item__body
              .item__body--key Bank Account Name:
              .item__body--value {{ item.accountName || '-' }}
            .item__body
              .item__body--key IBAN:
              .item__body--value {{ item.IBAN || '-' }}
            .item__body
              .item__body--key SWIFT/BIC:
              .item__body--value {{ item.SWIFT || '-' }}

          template(v-if="item.type === 'PayPal'")
            .item__body
              .item__body--key Email:
              .item__body--value {{item.email || '-'}}

          .item__footer
            .item__footer--title {{ item.type  }}


</template>

<script>
	import CheckBox from "../CheckBox"
	import SelectSingle from "../SelectSingle"
	import { mapActions, mapGetters } from "vuex"
	import Add from "../Add"
	import Button from "../Button"
	import ApproveModal from "../ApproveModal"

	export default {
		data() {
			return {
				paymentTerms: [],
				paymentTypes: [ 'Bank Details', 'PayPal' ],
				currentPaymentType: '',
				isModal: false,

				paypalType: {},
				bankType: {},
				editingIndex: null,
				deletingIndex: null,
				isDeletingModal: false
			}
		},
		methods: {
			...mapActions({
				updateCurrentVendorGeneralDataBillingInfo: 'updateCurrentVendorGeneralDataBillingInfo',
				alertToggle: 'alertToggle',
				storeCurrentVendor: "storeCurrentVendor"
			}),
			async manageModalState() {
				const [ neededPaymentTypeObj ] = [ this.paypalType, this.bankType ].filter(i => !!Object.keys(i).length)
				Object.assign(neededPaymentTypeObj, { type: this.currentPaymentType })
				try {
					const result = await this.$http.post("/vendorsapi/manage-payment-methods", {
						index: this.editingIndex,
						vendorId: this.$route.params.id,
						paymentTypeObj: neededPaymentTypeObj
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
			openApproveModal(index) {
				this.deletingIndex = index
				this.isDeletingModal = true
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
			openModalForEdition(item, index) {
				this.editingIndex = index
				this.isModal = true
				const { type, ...rest } = item
				this.currentPaymentType = type

				item.type === 'PayPal'
						? this.paypalType = { ...rest }
						: this.bankType = { ...rest }
			},
			closeModal() {
				this.editingIndex = null
				this.isModal = false
				this.currentPaymentType = ''
				this.setDefaultPaymentObjectsState()
			},
			setPaymentType({ option }) {
				this.currentPaymentType = option
				this.setDefaultPaymentObjectsState()
			},
			setDefaultPaymentObjectsState() {
				this.paypalType = {}
				this.bankType = {}
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
			async getAndSetPaymentTerms() {
				try {
					const result = await this.$http.get("/api-settings/payment-terms")
					this.paymentTerms = result.data.filter(i => !!i.isActive)
				} catch (err) {
					this.alertToggle({ message: "Error on getting Payment Terms in Billing Information", isShow: true, type: "error" })
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
		},
		components: { ApproveModal, Button, Add, CheckBox, SelectSingle }

	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

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

    &__footer {
      border-top: 1px solid $light-border;
      padding: 6px 20px;
      background: $table-list;
      text-align: center;
      color: #666;
      font-family: 'Myriad300';
      letter-spacing: 0.3px;
      font-size: 14px;
      margin-top: 10px;
    }

    &__body {
      padding: 6px 15px;
      display: flex;
      gap: 8px;
    }

    &__header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid $border;
      padding: 15px 15px 10px 15px;
      margin-bottom: 10px;
      min-height: 18px;

      &--name {
        font-size: 14px;
        font-family: 'Myriad600';
        width: 210px;
      }

      &--icons {
        display: flex;
        gap: 10px;
      }

      &--icon {
        color: $border-focus;
        font-size: 15px;
        cursor: pointer;

        &:hover {
          color: $text;
        }
      }
    }
  }

  .modalRow {
    display: flex;
    height: 32px;
    align-items: center;
    margin-bottom: 10px;

    &__key {
      width: 140px;
    }
  }

  .payment-methods {
    margin-top: 15px;
    padding-top: 25px;
    border-top: 1px solid $border;

    &__modal {
      padding: 20px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      box-shadow: $box-shadow;
      z-index: 20;
    }

    &__body {
      display: flex;
      flex-wrap: wrap;
      gap: 19px;
    }

    &__header {
      display: flex;
      justify-content: space-between;

      &--add {
        margin-top: -17px;
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
      width: 210px;
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

  .buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 10px;
  }
</style>
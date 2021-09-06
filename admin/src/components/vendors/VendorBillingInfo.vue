<template lang="pug">
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


</template>

<script>
	import CheckBox from "../CheckBox"
	import SelectSingle from "../SelectSingle"
	import { mapActions, mapGetters } from "vuex"

	export default {
		data() {
			return {
				paymentTerms: []
			}
		},
		methods: {
			...mapActions({
				updateCurrentVendorGeneralDataBillingInfo: 'updateCurrentVendorGeneralDataBillingInfo'
			}),
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
				currentVendor: "getCurrentVendorGeneralData"
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
		components: { CheckBox, SelectSingle }

	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

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
    /*resize: none;*/
    transition: .1s ease-out;
    padding: 5px;

    &:focus {
      border: 1px solid $border-focus;
    }
  }
</style>
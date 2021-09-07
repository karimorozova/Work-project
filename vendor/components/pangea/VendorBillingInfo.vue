<template lang="pug">
  .billing-info(v-if="currentVendor.billingInfo")
    .billing-info__col
      .colRow
        .colRow__key Same as in General Information:
        .colRow__value
          CheckBox(:isChecked="isSameAsInGeneralInformation" @check="toggleCheck(true)" @unCheck="toggleCheck(false)")

      .colRow
        .colRow__key Official Name:
        .colRow__value
          input(:value='billingInfo.officialName' @change="(e) => changeBillingProp('officialName', e.target.value)")

      .colRow
        .colRow__key Email:
        .colRow__value
          input(:value='billingInfo.email' @change="(e) => changeBillingProp('email', e.target.value)")

      .colRow
        .colRow__key Payment term:
        .colRow__value
          .selectSingle
            SelectSingle(
              placeholder="Select"
              :options="paymentTerms.map(i => i.name)"
              :selectedOption="billingInfo.paymentTerm.name || ''"
              @chooseOption="({option}) => changeBillingProp('paymentTerm', paymentTerms.find(i => i.name === option))"
            )

      //.colRow(v-if="someChanged")
      //  Button.colRow__key(value="Save" @clicked="checkErrors")
      //  Button.colRow__value(value="Cancel" @clicked="cancelChanges")

      .billing-info__buttons(v-if="someChanged")
        Button(value="Save" @clicked="checkErrors")
        Button(value="Cancel" @clicked="cancelChanges")

    .billing-info__col
      .addressRow
        .addressRow__key Address:
        .addressRow__value
          textarea(@change="(e) => changeBillingProp('address', e.target.value)") {{billingInfo.address}}


</template>

<script>
	import CheckBox from "../CheckBox"
	import SelectSingle from "./SelectSingle"
	import Button from "./Button"
  import { setVendorProp } from "../../store/actions"
  import { mapActions } from "vuex"
  import { setVendorBillingInfo } from "../../store/actions/vendors/set"


	export default {
	  props: {
	    currentVendor: {
          type: Object
      }
    },
		data() {
			return {
				paymentTerms: [],
        billingInfo: JSON.parse(JSON.stringify( this.currentVendor.billingInfo)),
			}
		},
		methods: {
      ...mapActions({
        setVendorBillingInfo: "setVendorBillingInfo"
      }),
			changeBillingProp(key, value) {
        console.log({key, value})
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
      isEqualBillingInfo (billingInfo, secondBillingInfo) {
			  return billingInfo.email === secondBillingInfo.email
            && billingInfo.address === secondBillingInfo.address
            && billingInfo.officialName === secondBillingInfo.officialName
            && billingInfo.paymentTerm.name === secondBillingInfo.paymentTerm.name
      },
      checkErrors() {
        this.saveChanges()
      },
      async saveChanges() {
        try{
          await this.$axios.post(`/vendor/payment-terms/${this.currentVendor._id}/update`, {billingInfo: this.billingInfo})

          this.setVendorBillingInfo({billingInfo:  JSON.parse(JSON.stringify( this.billingInfo))})
        }catch (e) {
          console.log({e})
        }
      },
      cancelChanges () {
			  this.billingInfo = JSON.parse(JSON.stringify( this.currentVendor.billingInfo))
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
		created() {
			this.getAndSetPaymentTerms()
    },
		components: { CheckBox, SelectSingle, Button }

	}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";

  .billing-info {
    display: flex;
    justify-content: space-between;

    &__buttons {
      display: flex;
      gap: 20px;
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
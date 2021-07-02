<template lang="pug">
  .all-billing-info
    .same-info
      .same-info__row
        .same-info__block
          .same-info__block-title Same as in General Information:
          .same-info__block-checkbox
            span.checkbox#same-checkbox
              input(type="checkbox" id="same" :checked="isSame" @change="setSame")
              label(for="same")
    .billing-info
      .names-info
        //.names-info__item
        //  label.names-info__label Contact Name:-
        //  input(type="text" :value="client.billingInfo.contactName" @change="(e) => changeProperty(e, 'contactName')")

        .names-info__item
          label.names-info__label Official Company Name:
          input(type="text" :value="client.billingInfo.officialCompanyName" @change="(e) => changeProperty(e, 'officialCompanyName')")

        //.names-info__item
        //  label.names-info__label.names-info_asterisk Email:-
        //  input(type="text" :value="client.billingInfo.email" @change="(e) => changeProperty(e, 'email')" :class="{'names-info_error-shadow': errorFields.indexOf('email') !== -1}")

        .names-info__item
          label.names-info__label VAT:
          .vat-fields
            span.checkbox.vatbox
              input(type="checkbox" id="vat" :checked="client.billingInfo.vat" @change="setVAT")
              label(for="vat")

            input(
              type="text"
              v-if="client.billingInfo.vat"
              id="vatId"
              :value="client.billingInfo.vatId"
              @change="(e) => changeProperty(e, 'vatId')"
              :class="{'names-info_error-shadow': errorFields.indexOf('vatId') !== -1}"
            )

        .names-info__item
          label.names-info__label.names-info_asterisk Payment type:
          .names-info__drop
            SelectSingle(
              :class="{'names-info_error-shadow': errorFields.indexOf('payment') !== -1}"
              placeholder="Select"
              :selectedOption="client.billingInfo.paymentType"
              :options="['PPP','Pre-Payment','Monthly','50%/50%']"
              @chooseOption="setPayment"
            )

        .names-info__item
          label.names-info__label Payment Terms:
          .names-info__dueDate
            input(type="text" id="dueDate" :value="client.billingInfo.dueDate" @change="(e) => changeProperty(e, 'dueDate')")
            //.dueDate-date days since issue date

        //.names-info__item
        //  label.names-info__label
        //    p Starting balance
        //    p (for prepaid):
        //  input(type="number" :value="client.billingInfo.startingBalance" @change="(e) => changeProperty(e, 'startingBalance')")

      .names-info
        .names-info__item-address
          label.names-info__label Address:
          textarea(type="text" placeholder="Text here" :value="client.billingInfo.address" @change="(e) => changeProperty(e, 'address')")

        .names-info__item
          label.names-info__label Automated invoice sending:
          span.checkbox
            input(type="checkbox" id="invoiceSending" :checked="client.billingInfo.invoiceSending" @change="setInvoiceSending")
            label(for="invoiceSending")

        //.names-info__item
        //  label.names-info__label
        //    p Balance
        //    p (for prepaid):
        //  input(type="number" :value="client.billingInfo.balance" @change="(e) => changeProperty(e, 'balance')")
        //
        //.names-info__item
        //  label.names-info__label
        //    p Minimum balance
        //    p (for prepaid):
        //  input(type="number" :value="client.billingInfo.minimumBalance" @change="(e) => changeProperty(e, 'minimumBalance')")
</template>

<script>
	import SelectSingle from "../SelectSingle"
	import { mapGetters } from "vuex"

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
			return {
				isSame: false
			}
		},
		methods: {
			changeProperty(e, prop) {
				this.$emit("changeProperty", { prop, value: e.target.value })
			},
			setInvoiceSending(e) {
				this.$emit("changeProperty", {
					prop: "invoiceSending",
					value: e.target.checked
				})
			},
			isSetSame(currentEnum) {
				this.client.billingInfo.officialCompanyName = currentEnum.officialCompanyName
			},
			setSame(e) {
				this.isSame = e.target.checked
				if (this.isSame) {
					if (Object.keys(this.currentClient).length === 0) {
						this.isSetSame(this.client)
					} else {
						this.isSetSame(this.currentClient)
					}
				} else {
					this.client.billingInfo.officialCompanyName = ""
				}
			},
			setVAT(e) {
				this.$emit("changeProperty", {
					prop: "vat",
					value: e.target.checked
				})
			},
			setPayment({ option }) {
				this.$emit("changeProperty", {
					prop: "paymentType",
					value: option
				})
			},
			isSameInformation() {
				if (this.client.officialCompanyName) {
					this.isSame = this.client.billingInfo.officialCompanyName === this.client.officialCompanyName
				}
			}
		},
		created() {
			this.isSameInformation()
		},
		computed: {
			...mapGetters({
				currentClient: "currentClientOverallData"
			})
		},
		components: {
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";

  .same-info {
    &__row {
      height: 55px;
    }

    &__block {
      display: flex;
      border-bottom: 1px solid #c5bfb5;
      padding-bottom: 10px;

      &-title {
        margin-right: 5px;
      }
    }
  }

  .billing-info {
    display: flex;
    justify-content: space-between;
  }

  .names-info {
    width: 41%;

    textarea {
      color: $text;
      height: 70px;
      width: 310px;
      border: 1px solid $border;
      border-radius: 4px;
      outline: none;
      resize: none;
      transition: .1s ease-out;
      padding: 5px;

      &:focus {
        border: 1px solid $border-focus;
      }
    }

    &__dueDate {
      width: 220px;
      display: flex;

      .dueDate-date {
        width: 110px;
        margin-left: 10px;
      }
    }

    &__drop {
      position: relative;
      width: 220px;
      height: 32px;
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
        font-size: 14px;
        color: $text;
        border: 1px solid $border;
        border-radius: 4px;
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
  }

  .checkbox {
    display: flex;
    height: 32px;
    width: 220px;

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
        border: 1px solid $border;
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

  #dueDate {
    width: 220px;
  }

  #vatId {
    width: 192px;
  }

  #same-checkbox {
    margin-top: -6px;
  }

  #vat,
  #invoiceSending {
    width: 0;
  }

  .vatbox {
    width: 28px;
  }

  .vat-fields {
    display: flex;
    width: 220px;
    height: 30px;
  }

  p {
    margin: 0;
  }
</style>

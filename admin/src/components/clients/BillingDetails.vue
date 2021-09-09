<template lang="pug">
  .billing-info
    .billing-info__body
      .billing-info__field
        label Company Name:
        input(class="long" v-model="billingInfoCopy.officialName")
      .billing-info__field-row
        .billing-info__field
          label Payment Type:
          .field__select-single
            SelectSingle(
              placeholder="Select"
              :options="['PPP', 'Pre-Payment', 'Monthly', 'Custom']"
              :selectedOption="billingInfoCopy.paymentType"
              @chooseOption="setPaymentType"
            )
        .billing-info__field
          label Payment Terms:
          .field__select-single
            SelectSingle(
              placeholder="Select"
              :options="paymentTerms.map(({name}) => name)"
              :selectedOption="(billingInfoCopy.paymentTerms && billingInfoCopy.paymentTerms.name) || ''"
              @chooseOption="setPaymentTerms"
            )
      .billing-info__title Billing Address
      .billing-info__field-row
        .billing-info__field
          label Country/Region:
          .field__select-single
            SelectSingle(
              placeholder="Select"
              :options="['PPP', 'MONTHLY']"
              :selectedOption="billingInfoCopy.address.country"
              @chooseOption="setCountry"
            )
        .billing-info__field
          .billing-info__label-group
            label VAT:
            CheckBox(customClass="size-small" :isChecked="isVat" @check="toggleVat" @uncheck="toggleVat")
          input(v-model="billingInfoCopy.address.vat" :disabled="isVat")
      .billing-info__field
        label Address:
        .billing-info__row
          input(v-model="billingInfoCopy.address.street1")
          input(v-model="billingInfoCopy.address.street2")
      .billing-info__field-row
        .billing-info__field
          label City:
          input(class="middle" v-model="billingInfoCopy.address.city")
        .billing-info__field
          label State:
          .field__select-single.small
            SelectSingle(
              placeholder="Select"
              :options="['test1', 'test2']"
              :selectedOption="billingInfoCopy.address.state"
              @chooseOption="setState"
            )
        .billing-info__field
          label Zip-code:
          input(class="small" v-model="billingInfoCopy.address.zipCode")

      .billing-info__title
        span Billing Contact
        Add(:isDefaultMargin="false")

      .item(v-for="(item, index) in billingInfoCopy.contacts")
        .item__header
          .item__header--name {{ item.firstName }}

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

        .item__body
          .item__body--key Email:
          .item__body--value {{ item.email || '-' }}
        .item__body
          .item__body--key leadContact:
          .item__body--value {{ item.leadContact || '-' }}
    .billing-info__buttons
      Button(value="Continue" @clicked="checkErrors")
      Button(value="Cancel" @clicked="closeModal")
</template>

<script>
import SelectSingle from "../SelectSingle"
import Add from "../Add"
import Button from "../Button"
import CheckBox from "../CheckBox"


export default {
  props: {
    billingInfo: {
      type: Object,
      default: {
        address: {}
      }
    }
  },
  data() {
    return {
      isVat: true,
      paymentTerms: [],
      billingInfoCopy: JSON.parse(JSON.stringify(this.billingInfo))
    }
  },
  name: "BillingDetails",
  methods: {
    toggleVat() {
      this.isVat = !this.isVat
      if(this.isVat) {
        this.billingInfoCopy.address.vat = ''
      }
    },
    setPaymentType({option}) {
      this.$set(this.billingInfoCopy, 'paymentType', option)
    },
    setCountry({option}) {
      this.$set(this.billingInfoCopy.address, 'country', option)
    },
    setState({option}) {
      this.$set(this.billingInfoCopy.address, 'state', option)
    },
    setPaymentTerms({option}) {
      console.log(this.paymentTerms.find(i => i.name === option))
      this.$set(this.billingInfoCopy, 'paymentTerms', this.paymentTerms.find(i => i.name === option))
    },
    closeModal() {
      this.billingInfoCopy = JSON.parse(JSON.stringify(this.billingInfo))
      this.$emit('closeBillingInfo')
    },
    checkErrors() {
      this.createBillingInfo()
    },
    createBillingInfo() {
      this.$http.post(`/clientsapi/update-billing-info/${this.$route.params.id}`, {billingInfo: this.billingInfoCopy})
      this.$emit('updateBillingInfo')
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
  async created() {
    await this.getAndSetPaymentTerms()
  },
  components: {
    SelectSingle,
    Add,
    Button,
    CheckBox,
  }
}
</script>

<style scoped lang="scss">
  @import "../../assets/scss/colors";
  .billing-info {
    box-sizing: border-box;
    margin-bottom: 20px;
    box-shadow: 0 1px 2px 0 rgba(99,99,99,.3),0 1px 3px 1px rgba(99,99,99,.15);
    position: relative;
    border-radius: 4px;
    background-color: #fff;
    padding: 15px;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }

    &__label-group {
      display: flex;
      justify-content: space-between;
    }

    &__title {
      font-family: 'Myriad600';
      font-size: 18px;
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      align-items: center;
    }


    label {
      display: block;
    }
    .field__select-single {
      position: relative;
      height: 30px;
      width: 220px;
    }
    &__field-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;

    }
    &__row {
      display: flex;
      justify-content: space-between;
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

    .long {
      width: 460px;
    }
    .small {
      width: 140px;
    }
    .middle {
      width: 150px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 5px 0;
    }

  }
  .mt10 {
    margin-top: 10px;
  }
  .item {
    width: 220px;
    box-sizing: border-box;
    border-radius: 4px;
    margin-top: 10px;
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
      font-size: 13px;
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
</style>
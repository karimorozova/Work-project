<template lang="pug">
  .billing-info
    .billing-info__input
      label Same as in General Information:
      CheckBox(:isChecked="vendor.billingInfo.isSameInfo" :isWhite="true"  @check="() => changeBillingProp( 'isSameInfo', true )" @uncheck="() => changeBillingProp('isSameInfo', false)")
    .billing-info__input
      label Official Company Name:
      input(:value='vendor.billingInfo.officialCompanyName' @change="(e) => changeBillingProp('officialCompanyName', e.target.value)")
    .billing-info__input
      label Payment term:
      .billing-info__select-wrapper
        SelectSingle(
          placeholder="Select"
          :options="['test1','test2','test3']"
          :selectedOption="vendor.billingInfo.paymentTerm"
          @chooseOption="({option}) => changeBillingProp('paymentTerm', option)"
        )
    .billing-info__input
      label Payment Address:
      textarea(@change="(e) => changeBillingProp('address', e.target.value)") {{vendor.billingInfo.address}}
</template>

<script>
import CheckBox from "../CheckBox"
import SelectSingle from "../SelectSingle"
export default {
  name: "VendorBillingInfo",
  components: { CheckBox, SelectSingle },
  props: {
    vendor: {},
  },
  data() {
    return {
    }
  },
  methods: {
    changeBillingProp( key, value) {
      this.$emit('changeBillingProp', {key, value})
    },
  }
}
</script>

<style scoped lang="scss">
.billing-info {
  &__input {
    display: flex;
    align-items: center;
    margin: 20px;
  }
  &__select-wrapper {
    position: relative;
    width: 220px;
    height: 30px;
  }
}
</style>
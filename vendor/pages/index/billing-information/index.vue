<template lang="pug">
  .billing-info
    .billing-info__title Billing Information
    .billing-info__table
      VendorBillingInfo(v-if="currentVendor.billingInfo" :currentVendor="currentVendor")
</template>

<script>
import VendorBillingInfo from "../../../components/pangea/VendorBillingInfo"
import { mapGetters } from "vuex"

export default {
  name: "index",
  computed: {
    ...mapGetters({
      currentVendor: "getVendor"
    }),
  },
  components: {
    VendorBillingInfo
  }
}
</script>

<style scoped lang="scss">
  .billing-info {
    &__title {
      font-size: 18px;
      font-family: Myriad600;
      margin-bottom: 10px;
    }

    &__table {
      width: 1040px;
      height: auto;
      -webkit-box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
      box-shadow: rgba(103, 87, 62, .3) 0px 2px 5px, rgba(103, 87, 62, .15) 0px 2px 6px 2px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      padding: 20px 20px 20px 20px;
      position: relative;
    }
  }
</style>
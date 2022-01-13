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
    })
  },
  components: {
    VendorBillingInfo
  }
}
</script>

<style scoped lang="scss">
@import "../../../assets/scss/colors";

.billing-info {
  &__title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 10px;
  }

  &__table {
    width: 1000px;
    height: auto;
    box-shadow: $box-shadow;
    box-sizing: border-box;
    padding: 25px;
    position: relative;
    border-radius: 4px;
    background-color: white;
  }
}
</style>
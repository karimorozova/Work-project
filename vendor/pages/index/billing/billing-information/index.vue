<template lang="pug">
  .billing-info
    .billing-info__table
      VendorBillingInfo(
        v-if="currentVendor._id && vendorExtra._id"
        :currentVendor="{...vendorExtra, ...currentVendor}"
        @updateData="getVendorExtra"
      )
</template>

<script>
import VendorBillingInfo from "./sub-components/VendorBillingInfo"
import { mapActions, mapGetters } from "vuex"

export default {
  name: "index",
  data() {
    return {
      vendorExtra: {}
    }
  },
  methods: {
    ...mapActions([ 'setCurrentVendor' ]),
    async getVendorExtra() {
      try {
        const result = await this.$axios.get(`/vendor/portal-vendor-extra-info?token=${ this.$store.state.token }`)
        const result2 = await this.$axios.get(`/vendor/portal-vendor-info?token=${ this.$store.state.token }`)
        this.setCurrentVendor(result2.data)
        this.vendorExtra = result.data
      } catch (err) {
      }
    }
  },
  computed: {
    ...mapGetters({
      currentVendor: "getVendor"
    })
  },
  components: {
    VendorBillingInfo
  },
  created() {
    this.getVendorExtra()
  }
}
</script>

<style scoped lang="scss">
@import "../../../../assets/scss/colors";

.billing-info {
  //&__title {
  //  font-size: 18px;
  //  font-family: Roboto600;
  //  margin-bottom: 10px;
  //}

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
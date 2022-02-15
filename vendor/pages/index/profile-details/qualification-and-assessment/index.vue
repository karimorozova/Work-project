<template lang="pug">
  .profile-layout(v-if="vendorExtra._id")
    Tabs(
      :tabs="tabs"
      :selectedTab="selectedTab"
      @setTab="setTab"
    )

</template>

<script>
import Tabs from "../../../../components/general/Tabs"

export default {
  name: "index",
  components: { Tabs },
  data() {
    return {
      vendorExtra: {},
      tabs: [ 'foo', 'boo' ],
      selectedTab: 'foo'
    }
  },
  methods: {
    setTab({ index }) {
      this.selectedTab = this.tabs[index]
    },
    async getVendorExtra() {
      try {
        const result = await this.$axios.get(`/vendor/portal-vendor-extra-info?token=${ this.$store.state.token }`)
        this.vendorExtra = result.data
      } catch (err) {
      }
    }
  },
  async created() {
    await this.getVendorExtra()
  }
}
</script>

<style lang="scss" scoped>
@import "assets/scss/colors";

.profile-layout {
  padding: 25px;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  width: 1000px;
  box-sizing: border-box;
}

</style>
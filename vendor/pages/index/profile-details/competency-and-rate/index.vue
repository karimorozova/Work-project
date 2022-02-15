<template lang="pug">
  .profile-layout(v-if="vendorExtra._id")
    Tabs(
      :tabs="tabs"
      :selectedTab="selectedTab"
      @setTab="setTab"
    )
    div(v-if="selectedTab === 'Competencies'" )
      Competencies(
        :arr="vendorExtra.competencies"
      )
    div(v-if="selectedTab === 'Pending Competencies'" )
      PendingCompetencies(
        :arr="vendorExtra.pendingCompetencies"
        @updateProp="getVendorExtra"
      )
    div(v-if="selectedTab === 'Rates'" )
      Rates(
        :arr="vendorExtra.rates.pricelistTable.filter(i => !!i.isActive)"
      )
    div(v-if="selectedTab === 'Discount Chart'" )
      DiscountChart(
        :arr="vendorExtra.matrix"
      )
    //Button(value="Add Competency" @clicked="redirectToModal")

</template>

<script>
import Tabs from "../../../../components/general/Tabs"
import Competencies from "./sub-components/Competencies"
import DiscountChart from "./sub-components/DiscountChart"
import Rates from "./sub-components/Rates"
import PendingCompetencies from "./sub-components/PendingCompetencies"
import Button from "../../../../components/general/Button"

export default {
  name: "index",
  components: { Button, PendingCompetencies, Rates, DiscountChart, Competencies, Tabs },
  data() {
    return {
      vendorExtra: {},
      tabs: [ 'Competencies', 'Pending Competencies', 'Rates', 'Discount Chart' ],
      selectedTab: 'Competencies'
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
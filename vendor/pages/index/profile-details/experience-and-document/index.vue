<template lang="pug">
  .profile-layout(v-if="vendorExtra._id")
    Tabs(
      :tabs="tabs"
      :selectedTab="selectedTab"
      @setTab="setTab"
    )
    div(v-if="selectedTab === 'Documents'" )
      Documents(
        :arr="vendorExtra.documents"
      )
    div(v-if="selectedTab === 'Professional Experience'" )
      ProfessionalExperience(
        :arr="vendorExtra.profExperiences"
      )
    div(v-if="selectedTab === 'Education'" )
      Education(
        :arr="vendorExtra.educations"
      )

</template>

<script>
import Tabs from "../../../../components/general/Tabs"
import Documents from "./sub-components/Documents"
import ProfessionalExperience from "./sub-components/ProfessionalExperience"
import Education from "./sub-components/Education"

export default {
  name: "index",
  components: { Education, ProfessionalExperience, Documents, Tabs },
  data() {
    return {
      vendorExtra: {},
      tabs: [ 'Documents', 'Professional Experience', 'Education' ],
      selectedTab: 'Documents'
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
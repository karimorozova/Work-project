<template lang="pug">
  .services-wrapper
    .tabs
      Tabs(:tabs="tabs" @setTab="setTab" :selectedTab="selectedTab")
    .table(v-if="selectedTab === 'Payment Methods'")
      TableMethods
    .table(v-if="selectedTab === 'Fields'")
      TableKeys
    //  StepsTable(
    //    :steps="steps"
    //    @setStepsWithId="setStepsWithId"
    //    @updateSteps="updateSteps"
    //  )
</template>

<script>
import { mapActions } from "vuex"
import Tabs from "../../Tabs"
import TableMethods from "./TableMethods"
import TableKeys from "./TableKeys"

export default {
  data() {
    return {
      tabs: [ "Payment Methods", "Fields" ],
      selectedTab: "Payment Methods"
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle"
    }),
    setTab({ index }) {
      this.selectedTab = this.tabs[index]
    }
  },
  components: {
    TableKeys,
    TableMethods,
    Tabs
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.services-wrapper {
  background-color: $white;
  padding: 25px;
  box-shadow: $box-shadow;
  position: relative;

  width: 900px;
  box-sizing: border-box;
  border-radius: 4px;
  margin: 50px;
}

</style>

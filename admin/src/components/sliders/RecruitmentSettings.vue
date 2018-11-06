<template lang="pug">
.recruitment
  Sidebar(title="RECRUITMENT" :links="sideBarLinks")
  .recruitment__main
    .recruitment__table
      VendorsTable(
        filterStatus="Potential"
      )
</template>

<script>
import Sidebar from "../Sidebar";
import VendorsTable from "../vendors/VendorsTable";

export default {
  data() {
    return {
      sideBarLinks: ["Vendors"],
    }
  },
  methods: {

  },
  components: {
    Sidebar,
    VendorsTable
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.recruitment {
  position: relative;
  display: flex;
  min-height: 94vh;
  &__main {
    padding: 20px;
  }
  &__table {
    padding: 20px;
    width: 1100px;
    min-height: 150px;
  }
}
</style>

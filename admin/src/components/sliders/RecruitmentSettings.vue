<template lang="pug">
.recruitment
  Sidebar(title="RECRUITMENT" :links="sideBarLinks" @onLinkClick="onLinkClick")
  .recruitment__main
    AllVendorsInfo(v-if="isAllVendorsShow"
      statusExcluded="Potential"
    )
  .cucu
    button(@click="cucuClick") Click on me
</template>

<script>
import AllVendorsInfo from "../vendors/AllVendorsInfo";
import Sidebar from "../Sidebar";
import VendorsTable from "../vendors/VendorsTable";
import Vendordetails from "../vendors/Vendordetails";
import VendorFilters from "../vendors/VendorFilters";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      sideBarLinks: ["Vendors"],
      isAllVendorsShow: true
    }
  },
  methods: {
    onLinkClick({index}) {
      if(this.sideBarLinks[index] === "Vendors") {
        this.isAllVendorsShow = true;
      }
    },
    async cucuClick() {
      await this.cucu();
    },
    ...mapActions({
      cucu: "cucu"
    })
  },
  components: {
    Sidebar,
    VendorsTable,
    Vendordetails,
    VendorFilters,
    AllVendorsInfo
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
}

</style>

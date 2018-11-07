<template lang="pug">
.recruitment
  Sidebar(title="RECRUITMENT" :links="sideBarLinks" @onLinkClick="onLinkClick")
  .recruitment__main
    .recruitment__table(v-if="!isVendorDetails")
      VendorFilters(
        statusFilter="Potential"
        :industryFilter="industryFilter"
        :leadFilter="leadFilter"
        @setNameFilter="(option) => setFilter(option, 'nameFilter')"
        @setStatusFilter="(option) => setFilter(option, 'statusFilter')"
        @setLeadFilter="(option) => setFilter(option, 'leadFilter')"
        @setIndustryFilter="(option) => setFilter(option, 'industryFilter')"
      )
      VendorsTable(
        :nameFilter="nameFilter"
        :industryFilter="industryFilter"
        :leadFilter="leadFilter"
        statusFilter="Potential"
        @showVendorDetails="showVendorDetails"
      )
    .recruitmet__table(v-if="isVendorDetails")
      Vendordetails(
        :vendor="currentVendor"
        @cancelVendor="closeVendorDetails"
      )
</template>

<script>
import Sidebar from "../Sidebar";
import VendorsTable from "../vendors/VendorsTable";
import Vendordetails from "../vendors/Vendordetails";
import VendorFilters from "../vendors/VendorFilters";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      sideBarLinks: ["Vendors"],
      isVendorDetails: false,
      statusFilter: "",
      industryFilter: "",
      leadFilter: "",
      nameFilter: ""
    }
  },
  methods: {
    onLinkClick({index}) {
      if(this.sideBarLinks[index] === "Vendors") {
        this.isVendorDetails = false;
      }
    },
    showVendorDetails({vendor}) {
      this.isVendorDetails = true;
      this.storeCurrentVendor(vendor);
    },
    closeVendorDetails() {
      this.isVendorDetails = false;
      this.storeCurrentVendor({});
    },
    setFilter({option}, prop) {
      this[prop] = option;
    },
    ...mapActions({
      storeCurrentVendor: "storeCurrentVendor"
    })
  },
  computed: {
    ...mapGetters({
      currentVendor: "getCurrentVendor"
    })
  },
  components: {
    Sidebar,
    VendorsTable,
    Vendordetails,
    VendorFilters
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
    box-shadow: 0 0 10px $brown-shadow;
  }
}
</style>

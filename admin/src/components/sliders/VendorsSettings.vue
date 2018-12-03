<template lang="pug">
.vendors
  .vendors__sidebar(v-if="sidebarShow")
    Sidebar(title="Vendors" :links="sidebarLinks")
  .all-vendors(v-if="allVendors")
    Allvendors(@vendorDetails="vendorDetailsShow" @cancelVendor="cancelVendor")
</template>

<script>
import Allvendors from '../vendors/Allvendors';
import Sidebar from '../Sidebar';
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      sidebarShow: false,
      allVendors: true,
      sidebarLinks: ["General Information"]
    }
  },
  methods: {
    vendorDetailsShow(data) {
      this.sidebarShow = true;
    },
    cancelVendor(data) {
      this.sidebarShow = false;
    },
    ...mapActions({
      loadingToggle: "loadingToggle"
    })
  },
  components: {
    Allvendors,
    Sidebar
  },
  mounted() {
  }
};
</script>

<style lang="scss" scoped>

.vendors {
  display: flex;
  width: calc(100% - 150px);
}

</style>

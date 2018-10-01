<template lang="pug">
.vendors
  .adminNavbar__slider(v-if="sidebarShow")
    span VENDORS
    .slider-inner
      .slider-col General Information
  .all-vendors(v-if="allVendors")
    Allvendors(@vendorDetails="vendorDetailsShow" @cancelVendor="cancelVendor")
</template>

<script>
import Allvendors from '../vendors/Allvendors'
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      sidebarShow: false,
      allVendors: true
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
    Allvendors
  },
  mounted() {
    this.loadingToggle(true);
  }
};
</script>

<style lang="scss" scoped>
.vendors {
  display: flex;
}

.adminNavbar {
  position: relative;
  display: flex;
  min-height: 94vh;
  &__slider {
    background-color: #fff;
    width: 175px;
    box-shadow: 7px 1px 10px rgba(103, 87, 62, 0.4);
    display: flex;
    flex-direction: column;
    font-family: MyriadPro;
    color: #67573e;
    font-size: 22px;
    transition: all 1s;
    span {
      display: flex;
      justify-content: center;
      padding: 44px 0;
      font-weight: 700;
    }
    .slider-inner {
      display: flex;
      flex-direction: column;

      .slider-col {
        display: flex;
        justify-content: center;
        border-top: 1px solid #c4beb6;
        border-bottom: 1px solid #c4beb6;
        background-color: #c4beb6;
        font-size: 18px;
        padding: 5px 0;
        &:nth-child(2) {
          border: none;
        }
      }
    }
  }
}
</style>

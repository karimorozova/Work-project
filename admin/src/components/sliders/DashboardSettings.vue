<template lang="pug">
.dashboard
  .dashboard__sidebar
    Sidebar(
      title="DASHBOARD", 
      :links="sidebarLinks", 
      :activeIndex="currentIndex", 
      @onLinkClick="toggleLink"
    )
  router-view
</template>

<script>
import Sidebar from "../Sidebar";
import defaultSidebarLinks from "@/mixins/defaultSidebarLinks";
import { mapGetters, mapActions } from "vuex";

export default {
  mixins: [defaultSidebarLinks],
  data() {
    return {
      sidebarLinks: [
        { title: "Overall View", routeName: "overall-view" },
        { title: "Sales Performance", routeName: "sales-perfomance" },
        // { title: "Operations", routeName: "" },
      ],
      currentIndex: -1,
      defaultRouteName: "overall-view",
    };
  },
  components: {
    Sidebar,
  },
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.dashboard {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  min-height: 95vh;
  &__sidebar {
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
  }
}
</style>

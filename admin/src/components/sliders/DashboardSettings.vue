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
  min-height: 94vh;
  &__sidebar {
    box-shadow: -10px 0 10px 10px $brown-shadow;
  }
}
</style>

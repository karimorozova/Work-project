<template lang="pug">
.vendors
  .vendors__sidebar
    Sidebar(
        title="VENDORS" 
        :links="sidebarLinks"
        :activeIndex="currentIndex"
        @onLinkClick="toggleLink"
        )
  .vendors__all
    router-view
</template>

<script>
import Sidebar from '../Sidebar';
import defaultSidebarLinks from "@/mixins/defaultSidebarLinks";

export default {
  mixins: [defaultSidebarLinks],
  data() {
    return {
      sidebarLinks: [
          {title: "All", routeName: "all-vendors"}, 
          {title: "Active", routeName: "active-vendors"}, 
          {title: "Inactive", routeName: "inactive-vendors"}, 
          {title: "Potential", routeName: "potential-vendors"}
        ],
      currentIndex: 0,
      defaultRouteName: "vendors"
    }
  },
  methods: {
    
  },
  components: {
    Sidebar
  }
};
</script>

<style lang="scss" scoped>

.vendors {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    min-height: 94vh;
    &__all {
        width: 100%;
    }
}

</style>

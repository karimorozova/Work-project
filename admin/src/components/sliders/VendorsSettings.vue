<template lang="pug">
.vendors
  .vendors__sidebar
    Sidebar(
        @onLinkClickMulti="toggleLink"
        :isMultiLinks="true"
        :multiLinks="sidebarLinksMulti"
        :multiActiveIndex="currentIndex"
    )
  .vendors__all
    router-view
</template>

<script>
import Sidebar from "../Sidebar";

export default {
  data() {
    return {
      sidebarLinksMulti: [
        {
          title: "VENDORS",
          links: [
            { arrayIndex: 0, title: "All", routeName: "all-vendors" },
            { arrayIndex: 0, title: "Active", routeName: "active-vendors" },
            { arrayIndex: 0, title: "Inactive", routeName: "inactive-vendors" }
          ]
        },
        {
          title: "CANDIDATES",
          links: [
            {
              arrayIndex: 1,
              title: "Potential",
              routeName: "potential-vendors"
            },
            { arrayIndex: 1, title: "Tests", routeName: "tests-vendors" }
          ]
        }
      ],
      currentIndex: [0, 0],
      defaultRouteName: "vendors"
    };
  },
  methods: {
    toggleLink({ arrayIndex, index }) {
      this.currentIndex = [arrayIndex, index];
      const { routeName } = this.sidebarLinksMulti[arrayIndex].links[index];
      this.$router.push({ name: routeName });
    }
  },
  components: {
    Sidebar
  },
  mounted() {},
  updated() {}
};
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.vendors {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  min-height: 94vh;
  &__sidebar {
    box-shadow: -10px 0 10px 10px $brown-shadow;
  }
  &__all {
    width: 100%;
  }
}
</style>

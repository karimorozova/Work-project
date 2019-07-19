<template lang="pug">
  .settings
    .settings__sidebar
      Sidebar(
        :title="sidebarTitle"
        :links="fullSideLinks"
        :activeIndex="activeLinkIndex"
        @onLinkClick="onLinkClick"
      )
    .settings__inner
      .settings__table
        router-view
</template>

<script>
import Sidebar from "../Sidebar";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      openQuotes: true,
      sidebarLinks: [
          {title: "Languages"}, {title: "Services"}, {title: "Industries"}, {title: "Lead Sources"}, {title: "Packages"}, 
          {title: "Pricelists"}, {title: "Instructions"}, {title: "Groups"}
          ],
      sidebarTitle: "SETTINGS",
      activeLinkIndex: -1
    };
  },
  methods: {
    onLinkClick({index}) {
      const { title } = this.sidebarLinks[index];
      this.activeLinkIndex = index;
      switch(title) {
        case "Languages": 
          this.$router.push("/settings/langs");
          break;
        case "Services":
          this.$router.push("/settings/services");
          break;
        case "Industries":
          this.$router.push("/settings/industries");
          break;
        case "Lead Sources":
          this.$router.push("/settings/leadsources");
          break;
        case "Packages":
          this.$router.push("/settings/packages");
          break;
        case "Pricelists":
          this.$router.push("/settings/pricelists");
          break;
        case "Instructions":
          this.$router.push("/settings/instructions");
          break;
        case "Groups":
          this.$router.push("/settings/groups");
          break;
        case "Users":
          if(this.userGroup.name === "Administrators" || this.userGroup.name === "Developers") {
            this.$router.push("/settings/users");
          }
      }
    }
  },
  computed: {
    ...mapGetters({
      userGroup: "getUserGroup"
    }),
    fullSideLinks() {
      let result = this.sidebarLinks;
      if(this.userGroup.name === "Administrators" || this.userGroup.name === "Developers") {
        result.push({title: "Users"});
      }
      return result;
    }
  },
  components: {
    Sidebar
  }
};
</script>

<style lang="scss" scoped>

.settings {
  display: flex;
  min-height: 94vh;
  position: relative;
  width: 100%;
  &__table {
    margin: 40px;
  }
  &__inner {
    width: 100%;
  }
}

</style>

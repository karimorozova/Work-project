<template lang="pug">
  .settings
    .settings__sidebar(:class="{'settings_visible': isSidebar}")
      Sidebar(
        :title="sidebarTitle"
        :links="fullSideLinks"
        :activeIndex="activeLinkIndex"
        @onLinkClick="onLinkClick"
      )
    .settings__inner(v-if="isSidebar" :class='{"settings__open": slidebarVisible}')
      .settings__table
        router-view
    Blanket(title='Welcome to the Pangea Admin' v-if="!isSidebar")    
</template>

<script>
import Sidebar from "../Sidebar";
import Blanket from "../Blanket/Blanket";
import { mapGetters } from "vuex";

export default {
  props: {
    isSidebar: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      openQuotes: true,
      sidebarLinks: ["Languages", "Services", "Industries", "Lead Sources", "Packages"],
      sidebarTitle: "SETTINGS",
      activeLinkIndex: -1
    };
  },
  methods: {
    onLinkClick({index}) {
      const link = this.sidebarLinks[index];
      this.activeLinkIndex = index;
      switch(link) {
        case "Languages": 
          this.$router.push("/dashboard/langs");
          break;
        case "Services":
          this.$router.push("/dashboard/services");
          break;
        case "Industries":
          this.$router.push("/dashboard/industries");
          break;
        case "Lead Sources":
          this.$router.push("/dashboard/leadsources");
          break;
        case "Packages":
          this.$router.push("/dashboard/packages");
          break;
        case "Users":
          if(this.userGroup === "Administrators" || this.userGroup === "Developers") {
            this.$router.push("/dashboard/users");
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
      if(this.userGroup === "Administrators" || this.userGroup === "Developers") {
        result.push("Users");
      }
      return result;
    }
  },
  components: {
    Sidebar,
    Blanket
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
  &__sidebar {
    transform: translateX(-100%);
    transition: all 0.2s;
  }
  &_visible {
    transform: translateX(0);
  }
  &__inner {
    width: 60%;
  }
  &__open {
    transform: translate(15px);
  }
}

@font-face {
  font-family: MyriadPro;
  src: url("../../assets/fonts/MyriadPro-Regular.otf");
}
@font-face {
  font-family: MyriadBold;
  src: url("../../assets/fonts/MyriadPro-Bold.otf");
}

</style>

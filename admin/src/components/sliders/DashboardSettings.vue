<template lang="pug">
  .settings
    .settings__sidebar(:class="{'settings_visible': isSidebar}")
      Sidebar(
        :title="sidebarTitle"
        :links="sidebarLinks"
        :activeIndex="activeLinkIndex"
        @onLinkClick="onLinkClick"
      )
    .settings__inner(v-if="isSidebar" :class='{"settings__open": slidebarVisible}')
      .settings__table(v-if="islanguages")
        TableLanguages
      .settings__table(v-if="isServices")
        TableServices
      .settings__table(v-if="isIndusties") 
        TableIndustries
      .settings__table(v-if="isLeadsource")
        TableLeadsources
    Blanket(title='Welcome to the Pangea Admin' v-if="!isSidebar")    
</template>

<script>
import Sidebar from "../Sidebar";
import Blanket from "../Blanket/Blanket";
import TableLanguages from "../Table/TableLanguages";
import TableServices from "../Table/TableServices.vue";
import TableIndustries from "../Table/TableIndustries";
import TableLeadsources from "../Table/TableLeadsources";

export default {
  props: {
    isSidebar: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      islanguages: false,
      isServices: false,
      isIndusties: false,
      isLeadsource: false,
      openQuotes: true,
      sidebarLinks: ["Languages", "Services", "Industries", "Lead Sources"],
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
          this.islanguages = true;
          this.isIndusties = false;
          this.isServices = false;
          this.isLeadsource = false;
          break;
        case "Services":
          this.islanguages = false;
          this.isIndusties = false;
          this.isServices = true;
          this.isLeadsource = false;
          break;
        case "Industries":
          this.islanguages = false;
          this.isIndusties = true;
          this.isServices = false;
          this.isLeadsource = false;
          break;
        case "Lead Sources":
          this.islanguages = false;
          this.isIndusties = false;
          this.isServices = false;
          this.isLeadsource = true;
      }
    }
  },
  components: {
    Sidebar,
    Blanket,
    TableLanguages,
    TableServices,
    TableIndustries,
    TableLeadsources
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

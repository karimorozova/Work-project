<template lang="pug">
    .admminportalWrapper
        .adminTop
            .adminTop__adminName
                a(href="/main") 
                  h2.adminPortal ADMIN PORTAL
            .adminTop__searchBlock
                .dropdownWrapper
                  .sel_project_block
                    .sel_project_block__proj
                      span New Project
                    .sel_project_block__imgWrapper(@click="showDropdown")
                      img(src="../assets/images/white-arrow.png" :class="{rotate: dropdownVisible}")
                  .clientsTop__dropdown
                    .additional(v-if="dropdownVisible" v-click-outside="hideAdditional")
                      .additional__listItem(target="_newtab" v-for='(proj, ind) in newProject' @click='dataForRequest(ind)') {{ proj.title }}
                .womanWrapper
                  img.womanWrapper__photo(src="../assets/images/client-icon_image.png")
                  .accountMenuWrapper(v-if="accountMenuVisible" v-click-outside="hideAccountMenu")
                    .accountBlock
                      .accountBlock__info
                        .icon
                          img(src="../assets/images/man.png")
                        .personal_data
                          .name {{ user.name }}
                          .email {{ user.email }}
                      .accountBlock__myaccount(@click="showAccountInfo")
                        .human_icon
                          img(src="../assets/images/man.png")
                        .my_account My Account
                      .accountBlock__exit(@click="signOut")
                        .icon_exit
                          img(src="../assets/images/sign-out.png")
                        .sign_out Sign Out
                .chevronWrapper
                  .chevron(@click="showAccountMenu")
        .adminMainWrapper
            .adminNavbar
              .adminNavbar__sideBar
                ul.navbar__ulist
                  li.navbar__ulist_item(@click="switchInfo(index)" v-for="(note, index) in navbarList" :class="{active: note.active}")
                    .image
                      img(v-if="!note.active" :src="note.imgWhite") 
                      img(v-else :src="note.imgBrown")
                    .title(:class="{showTitle: true}")
                      span {{ note.title }}
                .logoImage(v-if="expander")
                .balloons(v-else)
            .adminMainWrapper__inner
              .breadCrumbs 
                span.accountName {{ user.name }} 
                span.arrows(v-if="user.name") >> 
                span {{ path }}
                span.arrows(v-if="clientRequestShow") >>
                span(v-if="clientRequestShow") {{ serviceType }}
              .maininfoWrapper
                .mainInfo(v-if="visibleChecker == false")
                  .adminAll
                      .quotesComponent
                        .adminAll__dropMenu.openQuotes(:class="{borderAngle: openQuotes}") 
                          .adminAll__dropMenu_select(@click="showQuotes" :class="{bottomLine: openQuotes}") Open Quotes
                            img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openQuotes}")
                          .adminAll__dropMenu_item.quotesTable(v-if="openQuotes")
                            Quotesinfo(@quoteDetails="quoteDetails" :quotes="quotes")
                      .projectsComponent
                        .adminAll__dropMenu.openProjects(:class="{borderAngle: openProjects}")
                          .adminAll__dropMenu_select(@click="showProjects" :class="{bottomLine: openProjects}") Open Projects
                            img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openProjects}")
                          .adminAll__dropMenu_item.projectsTable(v-if="openProjects")
                            projectsInfo(@projectDetails="projectDetails" :projects="projects")
              .detailedInfoWrapper
                QuotesInfoDetailed
              recruitment(v-if="recruitmentShow")
              vendors(v-if="vendorsShow")
              documents(v-if="documentsShow")
              Accountinfo(v-if="accountInfo" :client='client' :user="user" :projects="projects" :quotes="quotes")
</template>

<script>
import Quotesinfo from "../components/quotes/Qoutesinfo";
import QuotesInfoDetailed from "../components/quotes/QuotesInfoDetailed";
import Accountinfo from "../components/account/Accountinfo";
import vendors from "../components/vendors/vendors";
import recruitment from "../components/recruitment/recruitment";
import documents from "../components/documents/documents";
import ClickOutside from "vue-click-outside";

export default {
  data() {
    return {
      user:{
        name: 'Test',
        email: 'test@test.com'
      },
      adminPortal: "ADMIN PORTAL",
      navbarList: [
        {
          title: "DASHBOARD",
          imgWhite: require("../assets/images/CATEGORIES/dashboard.png"),
          imgBrown: require("../assets/images/CATEGORIES/dashboard-brown.png"),
          active: true
        },
        {
          title: "RECRUITMENT",
          imgWhite: require("../assets/images/CATEGORIES/recruitment-white.png"),
          imgBrown: require("../assets/images/CATEGORIES/recruitment.png"),
          active: false
        },
        {
          title: "VENDORS",
          imgWhite: require("../assets/images/CATEGORIES/vendors white.jpg"),
          imgBrown: require("../assets/images/CATEGORIES/vendors.jpg"),
          active: false
        },
        {
          title: "LANGUAGES",
          imgWhite: require("../assets/images/CATEGORIES/languages white.png"),
          imgBrown: require("../assets/images/CATEGORIES/languages.png"),
          active: false
        },
        {
          title: "CLIENTS",
          imgWhite: require("../assets/images/CATEGORIES/clients white.png"),
          imgBrown: require("../assets/images/CATEGORIES/clients.jpg"),
          active: false
        },
        {
          title: "QUOTES",
          imgWhite: require("../assets/images/CATEGORIES/quotes white.jpg"),
          imgBrown: require("../assets/images/CATEGORIES/quotes.jpg"),
          active: false
        },
        {
          title: "PROJECTS",
          imgWhite: require("../assets/images/CATEGORIES/projects.png"),
          imgBrown: require("../assets/images/CATEGORIES/projects-brown.png"),
          active: false
        },
        {
          title: "FINANCE",
          imgWhite: require("../assets/images/CATEGORIES/finance white.jpg"),
          imgBrown: require("../assets/images/CATEGORIES/finance.jpg"),
          active: false
        },
        {
          title: "REPORTS",
          imgWhite: require("../assets/images/CATEGORIES/report white.png"),
          imgBrown: require("../assets/images/CATEGORIES/report.jpg"),
          active: false
        }
      ]
    };
  },
  methods: {
    getCookie() {
      let sessionCookie = document.cookie.split("=")[1];
      if (document.cookie.indexOf("ses") >= 0) {
        this.cookies = true;
        return true;
      } else {
        console.log("login failed");
        // alert("Please, Log in!")
        window.location.replace("/");
      }
    },
    hideAccountMenu() {
      this.accountMenuVisible = false;
    },
    hideAdditional() {
      this.dropdownVisible = false;
    },
    signOut() {
      document.cookie = "ses" + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      window.location.replace("/");
    },
    async clientInfo() {
      const result = await this.$axios.request({
        method: "get",
        url: "portal/clientinfo",
        withCredentials: true
      });
      this.client = result.data.client;
      if (!this.client) {
        window.location.replace("/");
      }
      this.user = result.data.user;
      this.projects = result.data.projects;
      this.quotes = result.data.quotes;
      this.languageCombinations = result.data.languageCombinations;
      this.$store.dispatch("loadLangs", this.languageCombinations);
    },
    switchInfo(index) {
      this.navbarList.forEach((item, i) => {
        if (i == index) {
          item.active = true;
          if (this.detailedInfoVisible && !this.detailedProjectVisible) {
            this.detailedInfoVisible = !this.detailedInfoVisible;
            this.openQuotes = true;
          }
          if (!this.detailedInfoVisible && this.detailedProjectVisible) {
            this.detailedProjectVisible = !this.detailedProjectVisible;
            this.openProjects = true;
          }
        } else {
          item.active = false;
        }

        if (index == 0) {
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.documentsShow = false;
          this.clientRequestShow = false;
          this.path = "Dashboard";
        }

        if (index == 1) {
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.recruitmentShow = true;
          this.vendorsShow = false;
          this.documentsShow = false;
          this.clientRequestShow = false;
          this.path = "Reqruitment";
        }

        if (index == 2) {
          this.recruitmentShow = false;
          this.vendorsShow = true;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.documentsShow = false;
          this.clientRequestShow = false;
          this.path = "Vendors";
        }

        if (index == 3) {
          this.recruitmentShow = false;
          this.documentsShow = true;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.vendorsShow = false;
          this.clientRequestShow = false;
          this.path = "Languages";
        }

        if (index == 4) {
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.path = "Clients";
        }

        if (index == 5) {
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.path = "Quotes";
        }

        if (index == 6) {
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.path = "Projects";
        }

        if (index == 7) {
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.path = "Finance";
        }

        this.accountInfo = false;
      });
    },
    showQuotes() {
      this.openQuotes = !this.openQuotes;
    },
    showProjects() {
      this.openProjects = !this.openProjects;
    },
    showAccountMenu() {
      this.accountMenuVisible = !this.accountMenuVisible;
    },
    showAccountInfo() {
      this.accountInfo = true;
      this.accountMenuVisible = !this.accountMenuVisible;
      this.detailedInfoVisible = false;
      this.detailedProjectVisible = false;
      this.clientRequestShow = false;
      this.documentsShow = false;
      this.vendorsShow = false;
      this.recruitmentShow = false;
      this.thanks = false;
      this.navbarList.forEach(item => {
        item.active = false;
      });
    },
    backToMain() {
      this.$refs.againMain.baseURI;
    },
    showDropdown() {
      this.dropdownVisible = !this.dropdownVisible;
    },
    async getServices() {
      const result = await this.$axios.$get("api/services");
      result.sort((a, b) => {
        return a.sortIndex - b.sortIndex;
      });
      this.$store.dispatch("servicesGetting", result);
    }
  },
  mounted() {
    this.getCookie();
    this.clientInfo();
    this.getServices();
  },
  components: {
    Quotesinfo,
    QuotesInfoDetailed,
    Accountinfo,
    vendors,
    documents
  },
  directives: {
    ClickOutside
  },
  computed: {
    visibleChecker() {
      return (
        this.detailedInfoVisible ||
        this.detailedProjectVisible ||
        this.accountInfo ||
        this.vendorsShow ||
        this.documentsShow ||
        this.clientRequestShow ||
        this.thanks
      );
    },
    jsess() {
      let result = "";
      let cookies = document.cookie.split(";");
      console.log(cookies);
      for (let i = 0; i < cookies.length; i++) {
        let findSession = cookies[i].split("=");
        if (findSession[0].indexOf("ses") > 0) {
          result = findSession[1];
        }
      }
      return result;
    }
  }
};
</script>

<style lang="scss">
@import "../assets/scss/adminportal.scss";
</style>
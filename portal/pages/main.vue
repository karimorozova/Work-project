<template lang="pug">
    .clientsportalWrapper(v-if="cookies")
        .clientsTop
            .clientsTop__clientName
                a(href="/main") 
                  h2.clientsPortal CLIENT PORTAL
                    span(v-if="accountInfo") >> {{ user.name }} (My Account)
            .clientsTop__searchBlock
                .dropdownWrapper
                  .sel_project_block
                    .sel_project_block__proj
                      span New Project
                    .sel_project_block__imgWrapper(@click="showDropdown")
                      img(src="../assets/images/white-arrow.png")
                  .clientsTop__dropdown
                    .additional(v-if="dropdownVisible")
                      .first {{ newProject.trans }}
                      .second {{ newProject.copyw }}
                      .third {{ newProject.market }}
                      .fourth {{ newProject.proof }}
                      .fifth {{ newProject.graph }}
                .searchWrapper
                    img.search(src="../assets/images/search.png")
                .womanWrapper
                  img.womanWrapper__photo(src="../assets/images/client-icon_image.png")
                  .accountMenuWrapper(v-if="accountMenuVisible")
                    .accountBlock
                      .accountBlock__info
                        .icon
                          img(src="../assets/images/woman.png")
                        .personal_data
                          .name Mary Jones
                          .email mary.j@gmail.com
                      .accountBlock__myaccount(@click="showAccountInfo")
                        .human_icon
                          img(src="../assets/images/man.png")
                        .my_account My Account
                      .accountBlock__exit
                        .icon_exit
                          img(src="../assets/images/sign-out.png")
                        .sign_out Sign Out
                .chevronWrapper
                  .chevron(@click="showAccountMenu")
        .clientsMainWrapper
            .clientsNavbar
              .clientsNavbar__sideBar(:class="{testExpander: expander}")
                ul.navbar__ulist
                  li.navbar__ulist_item(@click="switchInfo(index)" v-for="(note, index) in navbarList" :class="{active: note.active}")
                    .image
                      img(v-if="!note.active" :src="note.imgWhite") 
                      img(v-else :src="note.imgBrown")
                    .title(:class="{showTitle: expander}")
                      span {{ note.title }}
                .logoImage(v-if="expander")
                .balloons(v-else)
              .clientsNavbar__openHide
                .icon(@click="expandBar" :class="{openReverse: expander}")
                  span.icon__arrow >
            .maininfoWrapper
              .mainInfo(v-if="visibleChecker == false")
                //- .buttonPanel
                //-   button.quote New Quote
                //-   button.project New Project
                .clientsAll
                    .quotesComponent
                      .clientsAll__dropMenu.openQuotes(:class="{borderAngle: openQuotes}") 
                        .clientsAll__dropMenu_select(@click="showQuotes" :class="{bottomLine: openQuotes}") Open Quotes
                          img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openQuotes}")
                        .clientsAll__dropMenu_item.quotesTable(v-if="openQuotes")
                          Quotesinfo(@quoteDetails="quoteDetails" :quotes="quotes")
                    .projectsComponent
                      .clientsAll__dropMenu.openProjects(:class="{borderAngle: openProjects}")
                        .clientsAll__dropMenu_select(@click="showProjects" :class="{bottomLine: openProjects}") Open Projects
                          img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openProjects}")
                        .clientsAll__dropMenu_item.projectsTable(v-if="openProjects")
                          projectsInfo(@projectDetails="projectDetails" :projects="projects")
            .detailedInfoWrapper
              QuotesInfoDetailed(v-if="detailedInfoVisible" :quoteIndex="quoteIndex" :quotes="quotes")
            .detailedProjectWrapper
              projectInfoDetailed(v-if="detailedProjectVisible" :projects="projects" :project="project")
            Allprojects(v-if="allProjectsShow" :projects="projects" :user="user" @projectDetails='projectDetails')
            invoices(v-if="invoicesShow")
            documents(v-if="documentsShow")
            Accountinfo(v-if="accountInfo" :client='client' :user="user" :projects="projects" :quotes="quotes")
</template>

<script>
import Quotesinfo from "../components/quotes/Qoutesinfo";
import ProjectsInfo from "../components/projects/ProjectsInfo";
import QuotesInfoDetailed from "../components/quotes/QuotesInfoDetailed";
import Accountinfo from "../components/account/Accountinfo";
import ProjectInfoDetailed from "../components/projects/ProjectsInfoDetailed";
import Allprojects from "../components/projects/Allprojects";
import invoices from "../components/invoices/invoices";
import documents from "../components/documents/documents";

export default {
  data() {
    return {
      companyName: "",
      clientPortal: "CLIENT PORTAL",
      navbarList: [
        {
          title: "DASHBOARD",
          imgWhite: require("../assets/images/dashboard.png"),
          imgBrown: require("../assets/images/dashboard-brown.png"),
          active: true
        },
        {
          title: "PROJECTS",
          imgWhite: require("../assets/images/projects.png"),
          imgBrown: require("../assets/images/projects-brown.png"),
          active: false
        },
        {
          title: "INVOICES",
          imgWhite: require("../assets/images/invoices.png"),
          imgBrown: require("../assets/images/invoices-brown.png"),
          active: false
        },
        {
          title: "DOCUMENTS",
          imgWhite: require("../assets/images/documents.png"),
          imgBrown: require("../assets/images/documents-brown.png"),
          active: false
        }
      ],
      openQuotes: true,
      openProjects: true,
      expander: false,
      accountMenuVisible: false,
      accountInfo: false,
      detailedInfoVisible: false,
      detailedProjectVisible: false,
      allProjectsShow: false,
      invoicesShow: false,
      documentsShow: false,
      cookies: false,
      client: {},
      user: {},
      projects: [],
      quotes: [],
      project: {},
      quoteIndex: 0,
      projectIndex: 0,
      newProject: {
        trans: "Translation",
        copyw: "Copywriting",
        market: "Marketing",
        proof: "Proofing/QA",
        graph: "Graphic Localization"
      },
      dropdownVisible: false
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
    async clientInfo() {
      const result = await this.$axios.request({
        method: "get",
        url: "portal/clientinfo",
        withCredentials: true
      });
      console.log(result);
      this.client = result.data.client;
      this.user = result.data.user;
      this.projects = result.data.projects;
      this.quotes = result.data.quotes;
    },
    expandBar() {
      this.expander = !this.expander;
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
          this.allProjectsShow = false;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.invoicesShow = false
          this.documentsShow = false
        }

        if (index == 1) {
          this.allProjectsShow = true;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.invoicesShow = false
          this.documentsShow = false
        }

        if (index == 2) {
          this.invoicesShow = true;
          this.allProjectsShow = false;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.documentsShow = false
        }

        if (index == 3) {
          this.documentsShow = true;
          this.allProjectsShow = false;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.invoicesShow = false
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
      this.allProjectsShow = false;
      this.detailedInfoVisible = false;
      this.detailedProjectVisible = false;
      this.navbarList.forEach(item => {
        item.active = false;
      });
    },
    quoteDetails(data) {
      this.detailedInfoVisible = data.open;
      this.quoteIndex = data.index;
      this.detailedProjectVisible = false;
      this.allProjectsShow = false;
      for (let i = 0; i < this.navbarList.length; i++) {
        if (i == 1) this.navbarList[i].active = true;
        else this.navbarList[i].active = false;
      }
    },
    projectDetails(data) {
      this.detailedProjectVisible = true;
      this.allProjectsShow = false;
      this.detailedInfoVisible = false;
      this.project = data;
      for (let i = 0; i < this.navbarList.length; i++) {
        if (i == 1) this.navbarList[i].active = true;
        else this.navbarList[i].active = false;
      }
    },
    backToMain() {
      this.$refs.againMain.baseURI;
      console.log(this.$refs);
    },
    showDropdown() {
      this.dropdownVisible = !this.dropdownVisible;
    }
  },
  mounted() {
    this.getCookie();
    this.clientInfo();
  },
  components: {
    Quotesinfo,
    projectsInfo: ProjectsInfo,
    QuotesInfoDetailed,
    Accountinfo,
    projectInfoDetailed: ProjectInfoDetailed,
    Allprojects,
    invoices,
    documents
  },
  computed: {
    visibleChecker() {
      return (
        this.detailedInfoVisible ||
        this.detailedProjectVisible ||
        this.accountInfo ||
        this.allProjectsShow ||
        this.invoicesShow ||
        this.documentsShow
      );
    }
  }
};
</script>

<style lang="scss">
@import "../assets/styles/main.scss";
</style>

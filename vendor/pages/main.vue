<template lang="pug">
  .clientsportalWrapper(v-if="true")
    .clientsTop
      .clientsTop__clientName
        a(href="/main")
          h2.clientsPortal VENDOR PORTAL
      .clientsTop__searchBlock
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
                  .name {{ user.firstName }}
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
    .clientsMainWrapper
      .clientsNavbar
        .clientsNavbar__sideBar
          ul.navbar__ulist
            li.navbar__ulist_item(@click="switchInfo(index)" v-for="(note, index) in navbarList" :class="{active: note.active}")
              .image
                img(v-if="!note.active" :src="note.imgWhite")
                img(v-else :src="note.imgBrown")
              .title(:class="{showTitle: true}")
                span {{ note.title }}
          .logoImage(v-if="expander")
          .balloons(v-else)
      .clientsMainWrapper__inner
        .breadCrumbs
          span.accountName {{ user.firstName }}
          span.arrows(v-if="user.firstName") >>
          span {{ path }}
          span.arrows(v-if="clientRequestShow") >>
          span(v-if="clientRequestShow") {{ serviceType }}
        .maininfoWrapper
          .mainInfo(v-if="visibleChecker == false")
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
          QuotesInfoDetailed(v-if="detailedInfoVisible" :quoteIndex="quoteIndex" :quotes="quotes" :quote="quote")
        .detailedProjectWrapper
          projectInfoDetailed(v-if="detailedProjectVisible" :projects="projects" :project="project" :jobsById="jobsById" :user="user")
        Allprojects(v-if="allProjectsShow" :projects="projects" :user="user" @projectDetails='projectDetails')
        invoices(v-if="invoicesShow")
        documents(v-if="documentsShow")
        Accountinfo(v-if="accountInfo" :client='client' :user="user" :projects="projects" :quotes="quotes")
        Clientrequest(v-if="clientRequestShow" @thankYou="thankYou" @thankProof='thankYou' @thankCopy="thankYou" @thankMark="thankYou")
        Confirmorder(v-if="thanks" :thanksService="thanksService")
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
  import Clientrequest from "../components/Clientrequest";
  import ClickOutside from "vue-click-outside";
  import Confirmorder from "../components/Confirmorder"

  export default {
    data() {
      return {
        thanks: false,
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
        client: "",
        user: {},
        projects: [],
        quotes: [],
        quote: {},
        project: {},
        jobsById: [],
        languageCombinations: [],
        quoteIndex: 0,
        projectIndex: 0,
        newProject: [
          {title: "Translation"},
          {title: "Copywriting"},
          {title: "Marketing"},
          {title: "Proofing/QA"},
          {title: "Graphic Localization"}
        ],
        dropdownVisible: false,
        clientRequestShow: false,
        path: 'Open Quotes',
        serviceType: "",
        thanksService: ""
      };
    },
    methods: {
      thankYou(data) {
        this.clientRequestShow = false;
        this.thanks = true;
        this.thanksService = data;
      },
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
        // this.accountMenuVisible = false;
        console.log('click outside hideAccountMenu');
      },
      hideAdditional() {
        // this.dropdownVisible = false;
        console.log('click outside hideAdditional');
      },
      signOut() {
        document.cookie = "ses" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
        this.projects = [];
        this.quotes = [];
        this.languageCombinations = this.client.languageCombinations;
        // this.$store.dispatch('loadLangs', this.languageCombinations);
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
            this.invoicesShow = false;
            this.documentsShow = false;
            this.clientRequestShow = false;
            this.path = "Open Quotes"
          }

          if (index == 1) {
            this.allProjectsShow = true;
            this.detailedInfoVisible = false;
            this.detailedProjectVisible = false;
            this.invoicesShow = false
            this.documentsShow = false;
            this.clientRequestShow = false;
            this.path = "All Projects"

          }

          if (index == 2) {
            this.invoicesShow = true;
            this.allProjectsShow = false;
            this.detailedInfoVisible = false;
            this.detailedProjectVisible = false;
            this.documentsShow = false;
            this.clientRequestShow = false;
            this.path = "Invoices"
          }

          if (index == 3) {
            this.documentsShow = true;
            this.allProjectsShow = false;
            this.detailedInfoVisible = false;
            this.detailedProjectVisible = false;
            this.invoicesShow = false;
            this.clientRequestShow = false;
            this.path = "Documents"
          }
          this.thanks = false;
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
        this.allProjectsShow = false;
        this.detailedInfoVisible = false;
        this.detailedProjectVisible = false;
        this.clientRequestShow = false;
        this.documentsShow = false;
        this.invoicesShow = false;
        this.thanks = false;
        this.navbarList.forEach(item => {
          item.active = false;
        });
      },
      quoteDetails(data) {
        this.detailedInfoVisible = true;
        this.quote = data.quote;
        this.detailedProjectVisible = false;
        this.allProjectsShow = false;
        this.clientRequestShow = false;
        for (let i = 0; i < this.navbarList.length; i++) {
          if (i == 1) this.navbarList[i].active = true;
          else this.navbarList[i].active = false;
        }
      },
      projectDetails(data) {
        this.detailedProjectVisible = true;
        this.allProjectsShow = false;
        this.detailedInfoVisible = false;
        this.clientRequestShow = false;
        this.project = data.project;
        this.jobsById = data.jobs;
        for (let i = 0; i < this.navbarList.length; i++) {
          if (i == 1) this.navbarList[i].active = true;
          else this.navbarList[i].active = false;
        }
      },
      backToMain() {
        this.$refs.againMain.baseURI;
      },
      showDropdown() {
        this.dropdownVisible = !this.dropdownVisible;
        console.log('this.dropdownVisible',this.dropdownVisible);
      },
      dataForRequest(ind) {
        if(this.user) {
          let formData = {
            name: this.user.firstName,
            email: this.user.email,
            companyName: this.client.name,
            www: "test.com",
            phone: this.user.phone,
            skype: "",
            service: this.newProject[ind].title,
            industry: this.client.industries[0].name
          };
          this.$store.dispatch('requestInfo', formData);
          this.$store.dispatch('loadLangs', this.languageCombinations);
          this.$store.dispatch('jsession', this.jsess);
          this.clientRequestShow = true;
          this.accountInfo = false;
          this.allProjectsShow = false;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.documentsShow = false;
          this.invoicesShow = false;
          this.dropdownVisible = false;
          this.thanks = false;
        }
        this.path = "New Project";
        this.serviceType = this.newProject[ind].title;
        this.navbarList.forEach( (item, i) => {
          if (i == 0) item.active = true;
          else item.active = false;
        })
      },
      async getServices() {
        const result = await this.$axios.$get('api/services');
        result.sort((a, b) => {return a.sortIndex - b.sortIndex});
        // this.$store.dispatch('servicesGetting', result);
      }
    },
    mounted() {
      // this.getCookie();
      this.clientInfo();
      this.getServices();
    },
    components: {
      Quotesinfo,
      projectsInfo: ProjectsInfo,
      QuotesInfoDetailed,
      Accountinfo,
      projectInfoDetailed: ProjectInfoDetailed,
      Allprojects,
      invoices,
      documents,
      Clientrequest,
      Confirmorder
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
          this.allProjectsShow ||
          this.invoicesShow ||
          this.documentsShow ||
          this.clientRequestShow ||
          this.thanks
        );
      },
      jsess() {
        let result = "";
        let cookies = document.cookie.split(";");
        // console.log(cookies);
        for(let i = 0; i < cookies.length; i++) {
          let findSession = cookies[i].split("=");
          if (findSession[0].indexOf('ses') > 0) {
            result = findSession[1];
          }
        }
        return result;
      }
    }
  };
</script>

<style lang="scss">
  @import "../assets/styles/main.scss";

</style>

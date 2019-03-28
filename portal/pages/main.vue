<template lang="pug">
    .clientsportalWrapper(v-if="cookies && client")
        .clientsTop
            .clientsTop__clientName
                a(href="/main")
                  h2.clientsPortal CLIENT PORTAL
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
      this.accountMenuVisible = false;
    },
    hideAdditional() {
      this.dropdownVisible = false;
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
      this.$store.dispatch('loadLangs', this.languageCombinations);
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
        }
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
      const result = await this.$axios.$get('api/services')
      result.sort((a, b) => {return a.sortIndex - b.sortIndex});
      this.$store.dispatch('servicesGetting', result);
    }
  },
  mounted() {
    this.getCookie();
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

<style lang="scss" scoped>

  body {
    margin: 0;
    font-family: MyriadPro;
  }

  .clientsportalWrapper {
    /*margin: 0 auto;*/
    /*overflow: auto;*/
  }
  .projectsComponent,
  .quotesComponent {
    width: 1010px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .quotesComponent {
    margin-bottom: 40px;
  }
  .clientsTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #67573e;
    position: fixed;
    height: 6vh;
    width: 100%;
    z-index: 1000;
    .company {
      span {
        font-weight: 600;
        font-size: 24px;
        font-weight: bold;
        color: darkslategray;
        font-style: italic;
      }
    }

    &__clientName {
      width: 35%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 150px;
      a {
        text-decoration: none;
      }
      .clientsPortal {
        color: #fff;
        width: 100%;
      }
      .searchWrapper {
        display: flex;
        justify-content: flex-start;
        border: 2px solid #fff;
        img {
          padding-right: 514px;
        }
      }
    }

    .searchWrapper {
      display: flex;
      justify-content: flex-start;
      border: 2px solid #fff;
      width: 30%;
      visibility: hidden;
      @media screen and (max-width: 1520px) {
        margin-right: 20px;
      }
      @media screen and (max-width: 1430px) {
        margin-right: 40px;
      }
      @media screen and (max-width: 1380px) {
        margin-right: 55px;
      }
      @media screen and (max-width: 1330px) {
        margin-right: 85px;
      }
      img {
        padding-right: 514px;
      }
    }

    &__searchBlock {
      width: 35%;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .dropdownWrapper {
        height: 34px;
        width: 239px;
        margin-right: 50px;
        z-index: 3;
        position: relative;

        .sel_project_block {
          margin-right: 150px;
          width: 239px;
          width: 33%;
          background-color: #D15F45;
          border-radius: 14px;
          width: 100%;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);

          &__proj {
            border-right: 1px solid #fff;
            line-height: 100%;
            color: #fff;
            padding-right: 60px;
            height: 100%;
            display: flex;
            align-items: center;
            span {
              padding-right: 33px;
              padding-left: 14px;
              white-space: nowrap;
            }
          }

          &__imgWrapper {
            display: flex;
            img {
              height: 14px;
              transform: rotate(180deg);
              padding: 10px 17px;
              cursor: pointer;
            }
            .rotate {
              transform: rotate(0deg);
            }
          }
        }

        .clientsTop__dropdown {
          z-index: -1;
          position: absolute;
          right: 50px;
          top: 22px;

          .additional {
            padding-top: 10px;
            border: 2px solid #978d7e;
            color: #67573e;
            background-color: #fff;
            font-size: 16px;
            width: 185px;

            &__listItem
            {
              padding: 15px;
              border-bottom: 0.2px solid #978d7e;
              cursor: pointer;
              &:hover {
                background-color: #ddd3c8;
              }
            }

            .first {
              &:hover {
                background-color: #ddd3c8;
              }
            }
          }
        }
      }

      .womanWrapper {
        margin: 0 3px 7px 15px;
        border-radius: 30px;
        width: 33px;
        height: 33px;
        position: relative;
        &__photo {
          border-radius: 50%;
          background-color: white;
          padding-bottom: 1px;
          padding-right: 1px;
        }

        .accountMenuWrapper {
          .accountBlock {
            width: 192px;
            height: 124px;
            background-color: #fff;
            box-shadow: 1px 1px 11px black;
            position: absolute;
            top: 50px;
            right: -15px;
            border-radius: 6px;
            z-index: 5;
            overflow: hidden;
            &__info {
              display: flex;
              justify-content: flex-start;
              border-bottom: 1px solid #998e7e;
              padding-top: 3%;
              padding-bottom: 3%;

              .icon {
                margin-left: 8%;
                img {
                  height: 32px;
                }
              }

              .personal_data {
                color: #67573e;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;
                padding-top: 2%;
                margin-right: 14%;
                margin-left: 8%;
                .name {
                  font-size: 12px;
                }

                .email {
                  font-size: 11px;
                }
              }
            }

            &__myaccount {
              display: flex;
              justify-content: flex-start;
              align-items: center;
              border-bottom: 1px solid #998e7e;
              cursor: pointer;
              .human_icon {
                margin-left: 8%;
                img {
                  height: 32px;
                }
              }

              .my_account {
                font-size: 12px;
                color: #67573e;
                margin-left: 8%;
              }
              &:hover {
                background-color: #ddd3c8;
              }
            }

            &__exit {
              display: flex;
              justify-content: flex-start;
              align-items: center;
              cursor: pointer;
              .icon_exit {
                margin-left: 9%;
                img {
                  height: 32px;
                }
              }

              .sign_out {
                font-size: 12px;
                color: #67573e;
                margin-left: 7%;
              }
              &:hover {
                background-color: #ddd3c8;
              }
            }
          }
        }
      }

      .chevronWrapper {
        .chevron {
          position: relative;
          text-align: center;
          padding: 12px 12px 12px 12px;
          margin-bottom: 6px;
          height: 16px;
          width: 16px;
          margin-right: 123px;
          cursor: pointer;
          @media screen and (max-width: 1450px){
            margin-right: 43px;
          }
          @media screen and (max-width: 1350px){
            margin-right: 23px;
          }
        }

        .chevron:before {
          content: '';
          position: absolute;
          top: 23px;
          left: 6px;
          height: 8%;
          width: 21%;
          background: #fff;
          transform: skew(0deg, 50deg);
        }
        .chevron:after {
          content: '';
          position: absolute;
          top: 23px;
          right: 18px;
          height: 8%;
          width: 21%;
          background: #fff;
          transform: skew(0deg, -50deg);
        }
      }
    }
  }

  .clientsMainWrapper {
    box-sizing: border-box;
    padding-top: 6vh;
    padding-left: 150px;
    display: flex;
    height: 100%;
    position: relative;
    &__inner {
      width: 90%;
    }
    .maininfoWrapper {
      width: 100%;
    }

    .detailedInfoWrapper {
      max-width: 919px;
      margin: 0 auto;
      width: 100%;
    }

    .detailedProjectWrapper {
      max-width: 919px;
      margin: 0 auto;
      width: 100%;
    }

    .mainInfo {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin: 0 auto;
      .buttonPanel {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 5%;

        button {
          color: #fff;
          font-size: 15px;
          box-shadow: 0 5px 8px rgba(103, 87, 62, 0.5);
          background-color: #D15F45;
          border-radius: 18px;
          border: none;
          width: 180px;
          height: 43px;
          margin: 15px 18px 0;
          outline: none;
          cursor: pointer;
        }
      }
    }
    .clientsNavbar {
      font-family: MyriadPro;
      position: fixed;
      left: 0;
      z-index: 999;
      display: flex;
      min-height: 94vh;
      &__sideBar {
        padding: 25px 0;
        background-color: #998e7e;
        width: 150px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        box-shadow: 4px 6px 8px rgba(103,87,62,.4);
        transition: all .5s;
        z-index: 2;
        overflow: hidden;
      }

      &__openHide {
        background: rgb(245, 135, 110);
        color: white;
        width: 27px;
        height: 38px;
        top: 0;
        right: 0px;
        text-align: center;
        cursor: pointer;
        z-index: 1;
        .icon {
          font-size: 32px;
        }
        .openReverse {
          transform: rotate(180deg);
        }
      }
      .navbar__ulist {
        list-style: none;
        font-size: 15px;
        font-weight: 700;
        padding: 0;
        width: 177px;
        height: 77vh;
        margin-bottom: 0;
        overflow-y: scroll;

        &_item {
          padding-bottom: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin-bottom: 60px;
          cursor: pointer;
          transition: all 0.4s;
          &:last-child {
            margin-bottom: 120px;
            @media (max-height: 768px) {
              margin-bottom: 57px;
            }
          }

          .intothelist {
            margin-bottom: 78%;
          }
          .title {
            transition: all 0.4s;
            opacity: 0;
            color: #fff;
          }
          .showTitle {
            opacity: 1;
          }
        }
        .active {
          background-color: white;
          .title {
            color: #978d7e;
          }
        }

        .activeSecondLi {
          li {
            &:nth-child(2) {
              background-color: white;
              .title {
                color: #978d7e;
              }
            }
          }
        }
      }

      .logoImage {
        transition: all 0.4s;
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: url("../assets/images/logo_white.png");
        background-size: contain;
        background-repeat: no-repeat;
        width: 175px;
        height: 59px;
        padding-bottom: 61px;
      }

      .balloons {
        transition: all 0.4s;
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: url("../assets/images/balloons.png");
        background-repeat: no-repeat;
        background-position: center;
        width: 100%;
        height: 100px;
        box-shadow: -2px -5px 5px rgba(103, 87, 62, 0.4);
      }
    }

    .clientsAll {
      display: flex;
      flex-direction: column;
      align-items: center;
      &__dropMenu {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        border-radius: 18px;
        box-shadow: 0 3px 13px rgba(0, 0, 0, 0.3);
        margin-right: 36px;
        margin-bottom: 10px;
        padding: 0 14px;
        color: #67573e;
        transition: all 0.2s;
        &_select {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 1.5%;
          cursor: pointer;
        }
        &_item {
          width: 100%;
          padding: 1.5%;
          transition: all 0.4s;
        }
        .reverseImage {
          transform: rotate(180deg);
        }
      }
    }
    .borderAngle {
      border-radius: 0;
      border: none;
      margin-bottom: 0;
    }
  }

  .breadCrumbs {
    max-height: 50px;
    margin: 20px 40px;
    color: #67573e;
    font-size: 20px;
    .arrows {
      font-size: 16px;
      opacity: 0.6;
      margin: 0 10px;
    }
  }

  @font-face {
    font-family: MyriadPro;
    src: url('../assets/fonts/MyriadPro-Regular.otf');
  }
  @font-face {
    font-family: MyriadBold;
    src: url('../assets/fonts/MyriadPro-Bold.otf')
  }


</style>

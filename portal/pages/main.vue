<template lang="pug">
    //- .clientsportalWrapper(v-if="cookies")
    .clientsportalWrapper
        .clientsTop
            .clientsTop__clientName
                a(href="/main") 
                  h2.clientsPortal CLIENT PORTAL
                    span(v-if="accountInfo") >> {{ user.name }} (My Account)
            .clientsTop__dropdown
              .additional(v-if="dropdownVisible")
                .first {{ newProject.trans }}
                .second {{ newProject.copyw }}
                .third {{ newProject.market }}
                .fourth {{ newProject.proof }}
                .fifth {{ newProject.graph }}
            .clientsTop__searchBlock
                .sel_project_block
                  .sel_project_block__proj
                    span New Project
                    .additional(v-if="dropdownVisible")
                      .first {{ newProject.trans }}
                      .second {{ newProject.copyw }}
                      .third {{ newProject.market }}
                      .fourth {{ newProject.proof }}
                      .fifth {{ newProject.graph }}
                  .sel_project_block__imgWrapper(@click="showDropdown")
                    img(src="../assets/images/white-arrow.png")
                .searchWrapper
                    img.search(src="../assets/images/search.png")
                .womanWrapper(@click="showAccountMenu")
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
              projectInfoDetailed(v-if="detailedProjectVisible")
            Allprojects(v-if="allProjectsShow")
            Accountinfo(v-if="accountInfo" :client='client' :user="user" :projects="projects" :quotes="quotes")
</template>

<script>
import Quotesinfo from "../components/quotes/Qoutesinfo";
import ProjectsInfo from "../components/projects/ProjectsInfo";
import QuotesInfoDetailed from "../components/quotes/QuotesInfoDetailed";
import Accountinfo from "../components/account/Accountinfo";
import ProjectInfoDetailed from "../components/projects/ProjectsInfoDetailed";
import Allprojects from "../components/projects/Allprojects";

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
      cookies: false,
      client: {},
      user: {},
      projects: [],
      quotes: [],
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
        // window.location.replace("/");
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
      this.quotes = result.data.quotes
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
            this.openQuotes = !this.openQuotes;
          }
          if (!this.detailedInfoVisible && this.detailedProjectVisible) {
            this.detailedProjectVisible = !this.detailedProjectVisible;
            this.openProjects = !this.openProjects;
          }
        } else {
          item.active = false;
        }

        if (index == 0) {
          this.allProjectsShow = false;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
        }

        if (index == 1) {
          this.allProjectsShow = true;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
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
      console.log(this.quoteIndex);
      for (let i = 0; i < this.navbarList.length; i++) {
        if (i == 1) this.navbarList[i].active = true;
        else this.navbarList[i].active = false;
      }
    },
    projectDetails(data) {
      this.detailedProjectVisible = data;
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
    Allprojects
  },
  computed: {
    visibleChecker() {
      return (
        this.detailedInfoVisible ||
        this.detailedProjectVisible ||
        this.accountInfo ||
        this.allProjectsShow
      );
    }
  }
};
</script>

<style lang="scss">
body {
  margin: 0;
  height: 100vh;
}

.clientsportalWrapper {
  height: 100vh;
  margin: 0 auto;
  overflow: auto;
}
.projectsComponent,
.quotesComponent {
  // width: 80%;
  // max-width: 900px;
  width: 919px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quotesComponent {
  margin-bottom: 40px;
}
.clientsTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #67573e;
  .company {
    span {
      font-weight: 600;
      font-size: 24px;
      font-weight: bold;
      color: darkslategray;
      font-style: italic;
    }
  }

  .clientsTop__clientName {
    a {
      text-decoration: none;
    }
    .clientsPortal {
      color: #fff;
      margin-left: 7%;
      width: 100%;
      span {
        margin-left: 20px;
        font-weight: 400;
      }
    }
  }

  .clientsTop__searchBlock {
    margin-right: -3%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .sel_project_block {
      background-color: #f5876e;
      border-radius: 14px;
      margin-right: 150px;
      width: 239px;
      height: 34px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      position: relative;
      box-shadow: 1px 3px 7px #000;

      &__proj {
        border-right: 1px solid #fff;
        line-height: 100%;
        color: #fff;
        margin-right: 16px;
        padding-right: 23%;
        height: 100%;
        display: flex;
        align-items: center;
        span {
          padding-right: 36%;
          white-space: nowrap;
        }
      }

      .additional {
        max-width: 185px;
        position: absolute;
        top: 76.2%;
        right: 22.05%;
        z-index: -1;
        color: #67573e;
        background-color: #fff;
        border: 1px solid #978d7e;
        font-size: 16px;
        width: 185px;

        .first,
        .second,
        .third,
        .fourth,
        .fifth {
          padding: 15px 15px 15px 20px;
          border-bottom: 0.2px solid #ddd3c8;
          &:hover {
            background-color: #ddd3c8;
          }
        }

        .fifth {
          border-bottom: none;
        }

        .first {
          &:hover {
            background-color: #ddd3c8;
          }
        }
      }

      &__imgWrapper {
        display: flex;
        cursor: pointer;
        img {
          height: 14px;
          transform: rotate(180deg);
          margin-right: 20px;
        }
      }
    }

    .searchWrapper {
      margin-left: -32%;
    }
    .womanWrapper {
      margin-right: 20%;
      border: 2px solid #fff;
      border-radius: 30px;
      width: 33px;
      height: 33px;
      position: relative;

      .accountMenuWrapper {
        .accountBlock {
          width: 192px;
          height: 119px;
          background-color: #fff;
          box-shadow: 1px 1px 11px black;
          position: absolute;
          top: 50px;
          right: -15px;
          border-radius: 6px;
          z-index: 5;
          &__info {
            display: flex;
            justify-content: space-around;
            border-bottom: 1px solid #998e7e;
            padding-top: 3%;
            padding-bottom: 3%;

            .icon {
              margin-left: 20%;
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
            cursor: default;
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
  }
}

.changedBackgroundColorInfo {
  background-color: #ddd3c8;
}

.changedBackgroundColorAccount {
  background-color: #ddd3c8;
}

.changedBackgroundColorExit {
  background-color: #ddd3c8;
}

.clientsMainWrapper {
  display: flex;
  height: 95%;
  position: relative;
  .maininfoWrapper {
    width: 89%;
    position: absolute;
    top: 2%;
    left: 11%;
    @media (max-width: 1280px) {
      left: 18%;
    }
  }

  .detailedInfoWrapper {
    width: 34%;
    position: absolute;
    top: 31%;
    left: 50%;
    max-width: 919px;
    margin-left: -400px;
    width: 100%;
  }

  .detailedProjectWrapper {
    width: 34%;
    position: absolute;
    top: 31%;
    left: 50%;
    max-width: 919px;
    margin-left: -400px;
    width: 100%;
  }

  .mainInfo {
    display: flex;
    flex-direction: column;
    width: 88%;
    .buttonPanel {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 5%;

      button {
        color: #fff;
        font-size: 15px;
        box-shadow: 0 5px 8px rgba(103, 87, 62, 0.5);
        background-color: #f5876e;
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
    position: relative;
    display: flex;
    height: 100%;
    &__sideBar {
      padding: 25px 0;
      background-color: #998e7e;
      width: 121px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      box-shadow: 4px 6px 8px rgba(103, 87, 62, 0.4);
      transition: all 0.5s;
      z-index: 2;
    }
    .testExpander {
      width: 200px;
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
      font-weight: bold;
      padding: 0;
      width: 100%;

      &_item {
        padding-top: 20px;
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
      background-size: contain;
      background-repeat: no-repeat;
      width: 80px;
      height: 100px;
      padding-bottom: 41px;
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
      border: 0.4px solid #67573e;
      border-radius: 18px;
      box-shadow: 0 3px 13px rgba(0, 0, 0, 0.3);
      margin-right: 4%;
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
        // overflow-y: scroll;
      }
      .reverseImage {
        transform: rotate(180deg);
      }
    }
    // .bottomLine {
    //   border-bottom: 0.2px solid #c5bfb7;
    // }
  }
  .borderAngle {
    border-radius: 0;
    border: none;
    margin-bottom: 0;
  }
}
</style>

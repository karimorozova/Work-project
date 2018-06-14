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
                .mainInfo
                  .adminAll
                    .quotesComponent
                      .adminAll__dropMenu.openQuotes(:class="{borderAngle: openQuotes}") 
                        .adminAll__dropMenu_item.quotesTable(v-if="openQuotes")
                          Quotesinfo(@quoteDetails="quoteDetails" :quotes="quotes")
              recruitment(v-if="recruitmentShow")
              vendors(v-if="vendorsShow")
              languages(v-if="languagesShow")
              clients(v-if="clientsShow")
              soonQuotes(v-if="soonQuotesShow")
              projects(v-if="projectsShow")
              finance(v-if="financeShow")
              Accountinfo(v-if="accountInfo" :client='client' :user="user" :projects="projects" :quotes="quotes")
</template>

<script>
import Quotesinfo from "../components/quotes/Qoutesinfo";
import QuotesInfoDetailed from "../components/quotes/QuotesInfoDetailed";
import Accountinfo from "../components/account/Accountinfo";
import vendors from "../components/vendors/vendors";
import recruitment from "../components/recruitment/recruitment";
import languages from "../components/languages/languages";
import projects from "../components/projects/projects";
import clients from "../components/clients/clients";
import soonQuotes from "../components/quotes/soonQuotes";
import finance from "../components/finance/finance";
import ClickOutside from "vue-click-outside";

export default {
  data() {
    return {
      user: {
        name: "Test",
        email: "test@test.com"
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
      ],
      dropdownVisible: false,
      clientRequestShow: false,
      accountMenuVisible: false,
      expander: false,
      openQuotes: true,
      quotes: [],
      path: 'Language Settings',
      recruitmentShow: false,
      vendorsShow: false,
      languagesShow: false,
      clientsShow: false,
      soonQuotesShow: false,
      projectsShow: false,
      financeShow: false,
      accountInfo: false
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
          this.languagesShow = false;
          this.clientRequestShow = false;
          this.financeShow = false;
          this.path = "Dashboard";
        }

        if (index == 1) {
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.recruitmentShow = true;
          this.vendorsShow = false;
          this.languagesShow = false;
          this.clientRequestShow = false;
          this.soonQuotesShow = false;
          this.clientsShow = false;
          this.projectsShow = false;
          this.financeShow = false;
          this.path = "Reqruitment";
        }

        if (index == 2) {
          this.recruitmentShow = false;
          this.vendorsShow = true;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.languagesShow = false;
          this.clientRequestShow = false;
          this.soonQuotesShow = false;
          this.clientsShow = false;
          this.projectsShow = false;
          this.financeShow = false;
          this.path = "Vendors";
        }

        if (index == 3) {
          this.recruitmentShow = false;
          this.languagesShow = true;
          this.detailedInfoVisible = false;
          this.detailedProjectVisible = false;
          this.vendorsShow = false;
          this.clientRequestShow = false;
          this.soonQuotesShow = false;
          this.clientsShow = false;
          this.projectsShow = false;
          this.financeShow = false;
          this.path = "Languages";
        }

        if (index == 4) {
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.clientsShow = true;
          this.languagesShow = false;
          this.soonQuotesShow = false;
          this.projectsShow = false;
          this.financeShow = false;
          this.path = "Clients";
        }

        if (index == 5) {
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.soonQuotesShow = true;
          this.clientsShow = false;
          this.projectsShow = false;
          this.financeShow = false;
          this.path = "Quotes";
        }

        if (index == 6) {
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.soonQuotesShow = false;
          this.clientsShow = false;
          this.projectsShow = true;
          this.financeShow = false;
          this.path = "Projects";
        }

        if (index == 7) {
          this.recruitmentShow = false;
          this.vendorsShow = false;
          this.soonQuotesShow = false;
          this.clientsShow = false;
          this.projectsShow = false;
          this.financeShow = true;
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
      this.languagesShow = false;
      this.vendorsShow = false;
      this.recruitmentShow = false;
      this.clientsShow = false;
      this.soonQuotesShow = false;
      this.projectsShow = false;
      this.thanks = false;
      this.financeShow = false;
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
    quoteDetails(data) {
      this.detailedInfoVisible = data.open;
      this.quoteIndex = data.index;
      this.detailedProjectVisible = false;
      this.allProjectsShow = false;
      this.clientRequestShow = false;
      for (let i = 0; i < this.navbarList.length; i++) {
        if (i == 1) this.navbarList[i].active = true;
        else this.navbarList[i].active = false;
      }
    },
  },
  mounted() {
    this.getCookie();
    document.body.classList.add("main-body");
  },
  destroyed() {
    document.body.classList.remove("main-body");
  },
  components: {
    Quotesinfo,
    QuotesInfoDetailed,
    Accountinfo,
    vendors,
    languages,
    recruitment,
    clients,
    soonQuotes,
    projects,
    finance
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
        this.languagesShow ||
        this.clientRequestShow ||
        this.recruitmentShow ||
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

<style lang="scss" scoped>
body.main-body {
  margin: 0;
  font-family: MyriadPro;
  background: none;
}

.adminportalWrapper {
  margin: 0 auto;
  overflow: auto;
}

.quotesComponent {
  width: 1000px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quotesComponent {
  margin-bottom: 40px;
}
.adminTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #67573e;
  position: relative;
  height: 6vh;
  .company {
    span {
      font-weight: 600;
      font-size: 24px;
      font-weight: bold;
      color: darkslategray;
      font-style: italic;
    }
  }

  &__adminName {
    width: 35%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 150px;
    a {
      text-decoration: none;
    }
    .adminPortal {
      color: #fff;
      width: 100%;
      font-size: 24px;
      font-family: MyriadPro;
      font-weight: 700;
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
        background-color: #f5876e;
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
    
      .adminTop__dropdown {
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
    
          &__listItem,
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
          width: 98px;
          padding-left: 40px;
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

.adminMainWrapper {
  display: flex;
  min-height: 94vh;
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
  .adminNavbar {
    position: relative;
    display: flex;
    min-height: 94vh;
    &__sideBar {
      padding: 35px 0;
      background-color: #998e7e;
      width: 150px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      box-shadow: 4px 6px 8px rgba(103, 87, 62, 0.4);
      transition: all 0.5s;
      z-index: 2;
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

  .adminAll {
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
        padding: 1.5% 0.5% 1.5% 0;
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
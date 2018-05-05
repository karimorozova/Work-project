<template lang="pug">
    .clientsportalWrapper
        .clientsTop
            .clientsTop__clientName
                h2.clientsPortal {{ clientPortal }}
            .clientsTop__searchBlock
                .searchWrapper
                    img.search(src="../assets/images/search.png")
                .womanWrapper
        .clientsMainWrapper
            .clientsNavbar
              .clientsNavbar__sideBar(:class="{testExpander: expander}")
                ul.navbar__ulist
                  li.navbar__ulist_item(@click="switchInfo(index)" v-for="(note, index) in navbarList" :class="{active: note.active}")
                    .image
                      img(:src="note.img")
                    .title(:class="{showTitle: expander}")
                      span {{ note.title }}
                .logoImage(v-if="expander")
                .balloons(v-else)
              .clientsNavbar__openHide
                .icon(@click="expandBar" :class="{openReverse: expander}")
                  span.icon__arrow >
                //- .pointer(:class='"position-" + activeIndex')
            .mainInfo  
              .buttonPanel
                button.quote New Quote
                button.project New Project
              .clientsAll
                  .quotesComponent
                    .clientsAll__dropMenu.openQuotes(:class="{borderAngle: openQuotes}") 
                      .clientsAll__dropMenu_select(@click="showQuotes" :class="{bottomLine: openQuotes}") Open Quotes
                        img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openQuotes}")
                      .clientsAll__dropMenu_item.quotesTable(v-if="openQuotes")
                        Quotesinfo
                  .projectsComponent
                    .clientsAll__dropMenu.openProjects(:class="{borderAngle: openProjects}")
                      .clientsAll__dropMenu_select(@click="showProjects" :class="{bottomLine: openProjects}") Open Projects
                        img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openProjects}")
                      .clientsAll__dropMenu_item.projectsTable(v-if="openProjects")
                        projectsInfo
</template>

<script>
import Quotesinfo from "../components/quotes/Qoutesinfo";
import ProjectsInfo from "../components/projects/ProjectsInfo";

export default {
  data() {
    return {
      companyName: "",
      clientPortal: "CLIENT PORTAL",
      navbarList: [
        {
          title: "DASHBOARD",
          img: require("../assets/images/dashboard.png"),
          active: true
        },
        {
          title: "PROJECTS",
          img: require("../assets/images/projects.png"),
          active: false
        },
        {
          title: "INVOICES",
          img: require("../assets/images/invoices.png"),
          active: false          
        },
        {
          title: "DOCUMENTS",
          img: require("../assets/images/documents.png"),
          active: false          
        }
      ],
      openQuotes: false,
      openProjects: false,
      expander: false,
    };
  },
  methods: {
    getCookie() {
      // let sessionCookie = document.cookie.split("=")[1];
      if (document.cookie.indexOf("ses") >= 0) {
        alert("You've already logged in!")
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
        url: "/clientsinfo",
        withCredentials: true
      });
      console.log(result);
      this.companyName = result.data.name;
    },
    expandBar() {
      this.expander = !this.expander
    },
    switchInfo(index) {
      this.navbarList.forEach( (item, i) => {
        if(i == index) {
          item.active = true
        } else {
          item.active = false
        }
      })
    },
    showQuotes() {
      this.openQuotes = !this.openQuotes;
    },
    showProjects() {
      this.openProjects = !this.openProjects;
    }
  },
  
  mounted() {
    this.getCookie();
    this.clientInfo();
  },
  components: {
    Quotesinfo,
    "projectsInfo": ProjectsInfo
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
.projectsComponent, .quotesComponent {
  width: 80%;
  max-width: 900px;
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
    .clientsPortal {
      color: #fff;
      margin-left: 7%;
      width: 100%;
    }
  }

  .clientsTop__searchBlock {
    margin-right: 1%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .searchWrapper {
      margin-left: -55%;
    }
    .womanWrapper {
      margin-right: 20%;
      border: 2px solid #fff;
      border-radius: 30px;
      width: 33px;
      height: 33px;
    }
  }
}

.clientsMainWrapper {
  display: flex;
  // justify-content: flex-start;
  height: 95%;
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
      z-index: 1;
    }
    .testExpander {
      width: 200px
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
          color: #978D7E;
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
        box-shadow: 0 3px 13px rgba(0, 0, 0, .3);
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
    .bottomLine {
      border-bottom: 0.2px solid #C5BFB7;
    }
  }
  .borderAngle {
    border-radius: 0;
    border: none;
    margin-bottom: 0;
  }
}


</style>

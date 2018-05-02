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
                  li.navbar__ulist_item(@click="switchInfo(index)" v-for="(note, index) in navbarList")
                    .image
                      img(:src="note.img")
                    .title(:class="{showTitle: expander}")
                      span {{ note.title }}
                .logoImage(v-if="expander")
                .balloons(v-else)
              .clientsNavbar__openHide
                .icon(@click="expandBar" :class="{openReverse: expander}")
                  span.icon__arrow >
                .pointer(:class='"position-" + activeIndex')
            .mainInfo  
              .buttonPanel
                button.quote New Quote
                button.project New Project
              .clientsAll
                  .quotesComponent
                    .clientsAll__dropMenu.openQuotes(@click="showQuotes" :class="{shorten: expander}") Open Quotes
                      img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openQuotes}")
                    .clientsAll__dropMenu_item.quotesTable(v-if="openQuotes" :class="{shorten: expander}")
                      Quotesinfo
                  .projectsComponent
                    .clientsAll__dropMenu.openProjects(@click="showProjects" :class="{shorten: expander}") Open Projects
                      img(src="../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openProjects}")
                    .clientsAll__dropMenu_item.projectsTable(v-if="openProjects" :class="{shorten: expander}")
</template>

<script>
import Quotesinfo from "../components/quotes/Qoutesinfo";

export default {
  data() {
    return {
      companyName: "",
      clientPortal: "CLIENT PORTAL",
      navbarList: [
        {
          title: "DASHBOARD",
          img: require("../assets/images/dashboard.png")
        },
        {
          title: "PROJECTS",
          img: require("../assets/images/projects.png")
        },
        {
          title: "INVOICES",
          img: require("../assets/images/invoices.png")
        },
        {
          title: "DOCUMENTS",
          img: require("../assets/images/documents.png")
        }
      ],
      openQuotes: false,
      openProjects: false,
      expander: false,
      activeIndex: 0
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
        // window.location.replace("login");
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
      this.activeIndex = index;
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
    Quotesinfo
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
  // height: 6%;
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
      .pointer {
        position: absolute;
        width: 160px;
        height: 85px;
        background-color: rgba(103, 87, 62, 0.66);
        top: 36px;
        right: -20px;
        border-right: none;
        border-radius: 50%;
        z-index: -1;
        transition: all 0.4s;
      }
      .position-1 {
        top: 180px;        
      }
      .position-2 {
        top: 325px;        
      }
      .position-3 {
        top: 465px;        
      }
    }
    .navbar__ulist {
      list-style: none;
      font-size: 15px;
      font-weight: bold;
      padding: 0;

      &_item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom: 60px;
        cursor: pointer;
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
    }

    .logoImage {
      transition: all 0.4s;
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url("../assets/images/logo.png");
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
        justify-content: space-between;
        align-items: center;
        width: 100%;
        border: 0.4px solid #67573e;
        border-radius: 18px;
        box-shadow: 0 3px 13px rgba(0, 0, 0, .3);
        // margin-left: 46px;
        margin-right: 4%;
        margin-bottom: 10px;
        padding: 1.5%;
        color: #67573e;
        transition: all 0.4s;
        cursor: pointer;
        &_item {
          width: 100%;
          min-height: 190px;
          border-radius: 15px;
          // margin-left: 46px;
          padding: 1.5%;
          box-shadow: 0 5px 20px rgba(103, 87, 62, 0.5);
          transition: all 0.4s; 
          // overflow-y: scroll;         
        }
        .reverseImage {
          transform: rotate(180deg);
        }
    }
    .shorten {
      margin-left: 15px;
    }
  }
}

</style>

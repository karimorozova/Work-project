<template lang="pug">
    .admminportalWrapper2
        .adminTop
            .adminTop__adminName 
                h2.adminPortal ADMIN PORTAL
            .adminTop__searchBlock
                .create-project
                  .sel_project_block
                    .sel_project_block__proj
                      span New Project
                    .sel_project_block__imgWrapper(@click="showDropdown")
                      img(src="../assets/images/white-arrow.png" :class="{rotate: dropdownVisible}")
                  .clientsTop__dropdown
                    .additional(v-if="dropdownVisible" v-click-outside="hideAdditional")
                      .additional__listItem(target="_newtab" v-for='(proj, ind) in newProject' @click='dataForRequest(ind)') {{ proj.title }}
                .dropdownWrapper
                  .imgwrap(@click="showSlider")
                    img(src="../assets/images/Other/andmin-button-icon.png" )
                    span.spwrap settings
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
                //- .logoImage
                .balloons
            router-view(:sliderBool="sliderBool"
              :clientLanguages="clientLanguages"
              @customerLangs='customerLangs'
              @refreshServices='refreshServices'
              )
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
  data() {
    return {
      user: {
        name: "Test",
        email: "test@test.com"
      },
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
      newProject: [
        {title: "Translation"},
        {title: "Copywriting"},
        {title: "Marketing"},
        {title: "Proofing/QA"},
        {title: "Graphic Localization"}
      ],
      dropdownVisible: false,
      accountMenuVisible: false,
      quotes: [],
      path: "Language Settings",
      accountInfo: false,
      sliderBool: false,
      clientLanguages: [] 
    };
  },
  methods: {
    async customerLangs(data) {
      console.log(data);
      let person = await this.$http.get(`api/person?customerId=${data.id}`);
      let personEmail = person.body.email;
      console.log(personEmail);
      let token = await this.$http.post('api/get-token', {email: personEmail});
      console.log(token.body);
      let sessionId = await this.$http.post('api/token-session', {token: token});
      console.log('session: ' + sessionId.body);
      document.cookie = "ses=" + sessionId.body + "; " + "maxAge=60;" 
      let result = await this.$http.get(`portal/language-combinations?customerId=${data.id}`);
      this.$store.dispatch('gettingClientLangs', result.body);
      if(typeof result.body == 'string') {
        this.clientLanguages = []  
      } else {
        this.clientLanguages = result.body;
      }
    },
    async getCustomers() {
      let result = await this.$http.get('/clients');
      // let result = await this.$http.get('api/customers');
      this.$store.dispatch('customersGetting', result.body);
    },
    async getXtmCustomers() {
      let result = await this.$http.get('xtm/xtm-customers');
      this.$store.dispatch('xtmCustomersGetting', result.body);
    },
    async getLanguages() {
      let result = await this.$http.get('api/languages');
      let allLangs = result.body;
      this.$store.dispatch('allLanguages', allLangs);
    },
    dataForRequest(index) {
      if (index == 0) {
        this.$router.push('translation-request');
      }
      this.hideAdditional();
    },
    mainPageRender() {
      for(let elem of this.navbarList) {
        if(window.location.toString().indexOf(elem.title.toLowerCase()) != -1) {
          let path = '/' + elem.title.toLowerCase()
          this.$router.push(path);
          elem.active = true;
        } else {
          elem.active = false
        }
      }
    },
    hideAdditional() {
      this.dropdownVisible = false;
    },
    showSlider() {
      if(window.location.toString().indexOf('dashboard') == -1) {
        this.$router.push('dashboard')
      }
      for(let elem of this.navbarList) {
        if(elem.title == 'DASHBOARD') {
          elem.active = true
        } else {
          elem.active = false
        }
      }
      this.sliderBool = true;
    },
    hideAccountMenu() {
      this.accountMenuVisible = false;
    },
    signOut() {
      this.$store.dispatch("logout");
      this.$router.push('/login');
    },
    switchInfo(index) {
      this.navbarList.forEach((item, i) => {
        if (i == index) {
          item.active = true;
        } else {
          item.active = false;
        }
      })

        if (index == 0) {
          if(window.location.toString().indexOf('dashboard') == -1) {
            this.$router.push('dashboard')
          }
          this.sliderBool = false;
          this.path = "Dashboard";
        }

        if (index == 1) {
          if(window.location.toString().indexOf('recruitment') == -1) {
            this.$router.push('recruitment')
          }
          this.path = "Reqruitment";
        }

        if (index == 2) {
          if(window.location.toString().indexOf('vendors') == -1) {
            this.$router.push('vendors')
          }
          this.path = "Vendors";
        }

        if (index == 3) {
          if(window.location.toString().indexOf('languages') == -1) {
            this.$router.push('languages')
          }
          this.path = "Languages";
        }

        if (index == 4) {
          if(window.location.toString().indexOf('clients') == -1) {
            this.$router.push('clients')
          }
          this.path = "Clients";
        }

        if (index == 5) {
          if(window.location.toString().indexOf('quotes') == -1) {
            this.$router.push('quotes')
          }
          this.path = "Quotes";
        }

        if (index == 6) {
          if(window.location.toString().indexOf('projects') == -1) {
            this.$router.push('projects')
          }
          this.path = "Projects";
        }

        if (index == 7) {
          if(window.location.toString().indexOf('finance') == -1) {
            this.$router.push('finance')
          }
          this.path = "Finance";
        }

        if (index == 8) {
          if(window.location.toString().indexOf('reports') == -1) {
            this.$router.push('reports')
          }
          this.path = "Reports";
        }
    },    
    showAccountMenu() {
      this.accountMenuVisible = !this.accountMenuVisible;
    },
    showAccountInfo() {
      this.$router.push('accountinfo');
    },
    showDropdown() {
      this.dropdownVisible = !this.dropdownVisible;
    },
    async getServices() {
      const result = await this.$http.get('api/services');
      let services = result.body;
      services.sort((a, b) => {return a.sortIndex - b.sortIndex});
      this.$store.dispatch('servicesGetting', services);
    },
    refreshServices(data) {
      this.getServices();
    }
  },
  beforeRouteUpdate (to, from, next) {
    if(localStorage.getItem('token')) {
      next()
    } else {
      next('/login')
    }
  },
  mounted() {
    this.mainPageRender();
    this.getServices();
    this.getCustomers();
    this.getXtmCustomers();
    this.getLanguages();
  },
  components: {
  },
  directives: {
    ClickOutside
  },
  computed: { 
  }  
};
</script>

<style lang="scss" scoped>

.adminTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #67573e;
  position: relative;
  height: 6vh;
  &__adminName {
    width: 35%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 150px;
    a {
      text-decoration: none;
      padding-top: 11px;
    }
    .adminPortal {
      color: #fff;
      width: 100%;
      font-size: 24px;
      font-family: MyriadPro;
      font-weight: 700;
    }
  }
  &__searchBlock {
    width: 35%;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .dropdownWrapper {
      height: 34px;
      width: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .imgwrap {
        display: flex;
        position: relative;
        .spwrap {
          color: #fff;
          visibility: hidden;
          position: absolute;
          top: 3px;
          right: 41px;
        }
        &:hover {
          .spwrap {
            visibility: visible;
          }
        }
      }

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
          top: 44px;
          right: -140px;
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
      width: 140px;
      .chevron {
        position: relative;
        text-align: center;
        padding: 12px 12px 12px 12px;
        margin-bottom: 6px;
        height: 16px;
        width: 16px;
        cursor: pointer;
        transform: rotate(180deg);
        @media screen and (max-width: 1450px) {
          margin-right: 43px;
        }
        @media screen and (max-width: 1350px) {
          margin-right: 23px;
        }
      }

      .chevron:before {
        content: "";
        position: absolute;
        top: 15px;
        height: 8%;
        width: 29%;
        background: #fff;
        transform: skew(0deg,50deg);
      }
      .chevron:after {
        content: "";
        position: absolute;
        top: 15px;
        height: 8%;
        left: 8px;
        width: 29%;
        background: #fff;
        transform: skew(0deg,-50deg);
      }
    }
  }
}

.adminMainWrapper {
  display: flex;
  height: 100%;
  position: relative;
  &__inner {
    width: 90%;
  }
  .adminNavbar {
    font-family: MyriadPro;
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
        margin-bottom: 20px;
        margin-left: 0;
        margin-right: 0;
        cursor: pointer;
        transition: all 0.4s;
        &:last-child {
          margin-bottom: 40px;
          @media (max-height: 768px) {
            margin-bottom: 57px;
          }
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
    }

    // .logoImage {
    //   transition: all 0.4s;
    //   display: flex;
    //   justify-content: center;
    //   align-items: center;
    //   background-image: url("../assets/images/logo_white.png");
    //   background-size: contain;
    //   background-repeat: no-repeat;
    //   width: 175px;
    //   height: 59px;
    //   padding-bottom: 61px;
    // }

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
}

@font-face {
  font-family: MyriadPro;
  src: url("../assets/fonts/MyriadPro-Regular.otf");
}
@font-face {
  font-family: MyriadBold;
  src: url("../assets/fonts/MyriadPro-Bold.otf");
}

.create-project {
  height: 34px;
  width: 239px;
  margin-right: 83px;
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
      height: 33px;
      width: 48px;
      img {
        transform: rotate(180deg);
        padding: 10px 17px;
        cursor: pointer;
        width: 14px;
      }
      .rotate {
        transform: rotate(0deg);
        padding-left: 14px;
      }
    }
  }

  .clientsTop__dropdown {
    z-index: -1;
    position: absolute;
    right: 47px;
    top: 22px;

    .additional {
      padding-top: 10px;
      border: 2px solid #978d7e;
      color: #67573e;
      background-color: #fff;
      font-size: 16px;
      width: 188px;

      &__listItem,
      {
        padding: 13px;
        font-family: MyriadPro;
        border-bottom: 0.2px solid #978d7e;
        cursor: pointer;
        &:hover {
          background-color: #ddd3c8;
        }
      }
    }
  }
}
</style>
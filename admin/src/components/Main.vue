<template lang="pug">
    .adminportal-wrapper
        .admin-top
            .admin-top__admin-name 
                h2.adminPortal ADMIN PORTAL
            .admin-top__search-block
                .new-request
                  .sel_project_block
                    .sel_project_block__proj
                      span New Project
                      .additional(v-if="dropdownVisible" v-click-outside="hideAdditional")
                        .additional__listItem(target="_newtab" v-for='(proj, projIndex) in newProject' @click='gotoRequestPage(projIndex)') {{ proj.title }}
                    .sel_project_block__img-wrapper(@click="showDropdown")
                      .sel_project_block__image
                        img(src="../assets/images/open-arrow_white.png" :class="{rotate: dropdownVisible}")
                .dropdown-wrapper
                  .imgwrap(@click="showSlider")
                    img(src="../assets/images/Other/admin-button-icon.png" )
                    span.spwrap settings
                .woman-wrapper
                  img.woman-wrapper__photo(src="../assets/images/client-icon_image.png")
                  .account-menu-wrapper(v-if="accountMenuVisible" v-click-outside="hideAccountMenu")
                    .account-block
                      .account-block__info
                        .icon
                          img(src="../assets/images/man.png")
                        .personal__data
                          .personal__data_name {{ user.name }}
                          .personal__data_email {{ user.email }}
                      .account-block__myaccount(@click="showAccountInfo")
                        .human_icon
                          img(src="../assets/images/man.png")
                        .my_account My Account
                      .account-block__exit(@click="signOut")
                        .icon_exit
                          img(src="../assets/images/sign-out.png")
                        .sign_out Sign Out
                .chevron-wrapper
                  .chevron(@click="showAccountMenu")
        .admin-main-wrapper
            .admin-navbar
              .admin-navbar__sidebar
                ul.navbar__menu
                  li.navbar__menu_item(@click="switchSection(index)" v-for="(note, index) in navbarList" :class="{active: note.active}")
                    .image
                      img(:src="note.imgBrown")
                    .title
                      span {{ note.title }}
                .balloons
            router-view(:isSidebar="isSidebar"
              @refreshXtmCustomers="refreshXtmCustomers"
              @getCustomerLangs='getCustomerLangs'
              @refreshServices='refreshServices'
              )
</template>

<script>
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";
import Loading from "./Loading";

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
          imgBrown: require("../assets/images/CATEGORIES/dashboard-brown.png"),
          active: true
        },
        {
          title: "RECRUITMENT",
          imgBrown: require("../assets/images/CATEGORIES/recruitment.png"),
          active: false
        },
        {
          title: "VENDORS",
          imgBrown: require("../assets/images/CATEGORIES/vendors.png"),
          active: false
        },
        {
          title: "LANGUAGES",
          imgBrown: require("../assets/images/CATEGORIES/languages.png"),
          active: false
        },
        {
          title: "CLIENTS",
          imgBrown: require("../assets/images/CATEGORIES/clients.png"),
          active: false
        },
        {
          title: "PM AREA",
          imgBrown: require("../assets/images/CATEGORIES/pm-brown.png"),
          active: false
        },
        {
          title: "FINANCE",
          imgBrown: require("../assets/images/CATEGORIES/finance.png"),
          active: false
        },
        {
          title: "REPORTS",
          imgBrown: require("../assets/images/CATEGORIES/report.png"),
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
      isSidebar: false,
      clientLanguages: [] 
    };
  },
  methods: {
    async getCustomerLangs(data) {
      let person = await this.$http.get(`api/person?customerId=${data.id}`);
      let personEmail = person.body.email;
      let token = await this.$http.post('api/get-token', {email: personEmail});
      let sessionId = await this.$http.post('api/token-session', {token: token});
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
      let result = await this.$http.get('/all-clients');
      this.$store.dispatch('customersGetting', result.body);
    },
    async getXtmCustomers() {
      let result = await this.$http.get('/xtm/xtm-customers');
      this.$store.dispatch('xtmCustomersGetting', result.body);
    },
    refreshXtmCustomers(data) {
      this.getXtmCustomers();
    },
    async getLanguages() {
      let result = await this.$http.get('/api/languages');
      let allLangs = result.body;
      this.$store.dispatch('allLanguages', allLangs);
    },
    gotoRequestPage(index) {
      if (index == 0) {
        this.$router.push({name: 'pm-create-project'});
        this.navbarList.forEach(item => {
          item.active = (item.title === 'PM AREA') ? true: false
        })
      }
      this.hideAdditional();
    },
    mainPageRender() {
      this.toggleSideBar(true);
    },
    checkForSpecifiedSideBar(address, title) {
      if (window.location.toString().indexOf(address) !== -1) {
        this.navbarList.forEach(item => {
          item.active = (item.title == title) ? true: false
        })
      }
    },
    toggleSideBar(isFirstRender) {
      const location = window.location.toString();
      if(location.indexOf('pm-') !== -1) {
        this.checkForSpecifiedSideBar('pm-', 'PM AREA');
      } else if(location.indexOf('new-client') !== -1) {
        this.checkForSpecifiedSideBar('new-client', 'CLIENTS');
      } else {
        this.checkAddressForSideBar(isFirstRender);
      }
    },
    checkAddressForSideBar(isFirstRender) {
      for(let elem of this.navbarList) {
        if(window.location.toString().indexOf(elem.title.toLowerCase()) !== -1) {
          elem.active = true;
          if(isFirstRender) {
            const path = '/' + elem.title.toLowerCase()
            this.$router.push(path);
          }
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
        this.$router.push('/dashboard')
      }
      for(let elem of this.navbarList) {
        if(elem.title == 'DASHBOARD') {
          elem.active = true
        } else {
          elem.active = false
        }
      }
      this.isSidebar = true;
    },
    hideAccountMenu() {
      this.accountMenuVisible = false;
    },
    signOut() {
      this.$store.dispatch("logout");
      this.$http.get('/logout')
      .then(res => {
        console.log(res)
      });
      this.$router.push('/login');
    },
    switchSection(index) {
      this.navbarList.forEach((item, i) => {
        if (i == index) {
          item.active = true;
        } else {
          item.active = false;
        }
      })

      switch(index) {
        case 0:
          this.$router.push('/dashboard');
          this.isSidebar = false;
          break;
        case 1:
          this.$router.push('/recruitment');
          break;
        case 2:
          this.$router.push('/vendors');
          break;
        case 3:
          this.$router.push('/languages');
          break;
        case 4:
          this.$router.push('/clients');
          break;
        case 5:
          this.$router.push('/pm-projects');
          break;
        case 6:
          this.$router.push('/finance');
          break;
        case 7:
          this.$router.push('/reports');
          break;
      }
    },    
    showAccountMenu() {
      this.accountMenuVisible = !this.accountMenuVisible;
    },
    showAccountInfo() {
      this.$router.push('account-info');
    },
    showDropdown() {
      this.dropdownVisible = !this.dropdownVisible;
    },
    async getServices() {
      const result = await this.$http.get('/api/services');
      const services = result.body;
      services.sort((a, b) => {return a.sortIndex - b.sortIndex});
      this.$store.dispatch('servicesGetting', services);
    },
    refreshServices(data) {
      this.getServices();
    },
    ...mapActions({
      loadingToggle: "loadingToggle"
    })
  },
  computed: {
    ...mapGetters({
      isLoading: "loading"
    })
  },
  components: {
    Loading
  },
  beforeRouteUpdate (to, from, next) {
    if(localStorage.getItem('token')) {
      next()
    } else {
      next('/login')
    }
  },
  async mounted() {
    this.mainPageRender();
    await this.getServices();
    await this.getCustomers();
    await this.getXtmCustomers();
    await this.getLanguages();
  },
  updated() {
    this.toggleSideBar(false);
  },
  directives: {
    ClickOutside
  }  
};
</script>

<style lang="scss" scoped>

.admin-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #67573e;
  position: fixed;
  height: 6vh;
  width: 100%;
  z-index: 1000;
  &__admin-name {
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
  &__search-block {
    width: 35%;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .dropdown-wrapper {
      height: 34px;
      width: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .imgwrap {
        display: flex;
        position: relative;
        cursor: pointer;
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
    }

    .woman-wrapper {
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

      .account-menu-wrapper {
        .account-block {
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

            .personal__data {
              color: #67573e;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: flex-start;
              padding-top: 2%;
              margin-right: 14%;

              &_name {
                font-size: 12px;
              }

              &_email {
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

    .chevron-wrapper {
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

.admin-main-wrapper {
  box-sizing: border-box;
  padding-top: 6vh;
  padding-left: 150px;
  display: flex;
  height: 100%;
  position: relative;
  &__inner {
    width: 90%;
  }
  .admin-navbar {
    font-family: MyriadPro;
    position: fixed;
    left: 0;
    z-index: 999;
    display: flex;
    min-height: 94vh;
    &__sidebar {
      padding: 25px 0;
      background-color: #998e7e;
      width: 150px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      box-shadow: 4px 6px 8px rgba(103, 87, 62, 0.4);
      transition: all 0.5s;
      z-index: 2;
      overflow: hidden;
    }
    .navbar__menu {
      list-style: none;
      font-size: 15px;
      font-weight: bold;
      padding: 0;
      width: 177px;
      height: 77vh;
      margin-bottom: 0;
      overflow-y: overlay;
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
          margin-bottom: 0;
        }
        .title {
          transition: all 0.3s;
          color: #fff;
        }
        .image {
          img {
            filter: brightness(300%);
          }
        }
      }
      .active {
        background-color: white;
        .title {
          color: #978d7e;
        }
        .image {
          img {
            filter: none;
          }
        }
      }
    }

    .balloons {
      transition: all 0.4s;
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url("../assets/images/balloons.png");
      background-repeat: no-repeat;
      background-position-x: center;
      width: 100%;
      height: 100px;
      box-shadow: -2px -5px 5px rgba(103, 87, 62, 0.4);
    }
  }
}

.new-request {
  height: 34px;
  width: 239px;
  margin-right: 83px;
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
      width: 80%;
      height: 100%;
      display: flex;
      align-items: center;
      position: relative;
      span {
        padding-left: 14px;
      }
    }

    &__img-wrapper {
      display: flex;
      height: 100%;
      width: 20%;
      justify-content: center;
      align-items: center;
      img {
        cursor: pointer;
      }
      .rotate {
        transform: rotate(180deg);
      }
    }
    &__image {
      padding: 5px;
      cursor: pointer;
    }
  }
}

.additional {
  position: absolute;
  border: 2px solid #978d7e;
  color: #67573e;
  background-color: #fff;
  font-size: 16px;
  width: 100%;
  top: 25px;
  z-index: -1;
  box-sizing: border-box;
  &__listItem {
    padding: 13px;
    font-family: MyriadPro;
    border-bottom: 0.2px solid #978d7e;
    cursor: pointer;
    &:hover {
      background-color: #ddd3c8;
    }
    &:first-child {
      padding-top: 20px;
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

</style>
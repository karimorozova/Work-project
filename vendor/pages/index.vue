<template lang="pug">
  .vendor-portal
    .vendor-portal__top
      .vendor-portal__admin-name
        h2.vendor-portal__adminPortal VENDOR PORTAL
      .vendor-portal__account(v-click-outside="hideAccountMenu")
        .vendor-portal__photo-wrapper
          img.vendor-portal__photo(v-if="!vendor.photo" src="../assets/images/client-icon_image.png")
          img.vendor-portal__photo(v-else :src="domain+vendor.photo")
          .vendor-portal__account-menu-wrapper(v-if="isAccountMenu")
            .vendor-portal__account-block
              .vendor-portal__info
                .vendor-portal__icon
                  img(src="../assets/images/man.png")
                .vendor-portal__personal
                  .vendor-portal__personal-data {{ vendor.firstName }}
                  .vendor-portal__personal-data {{ vendor.email }}
              .vendor-portal__item(@click="showAccountInfo")
                .vendor-portal__icon
                  img(src="../assets/images/man.png")
                .vendor-portal__list-label My Account
              .vendor-portal__item(@click="signOut")
                .vendor-portal__icon
                  img(src="../assets/images/sign-out.png")
                .vendor-portal__list-label Sign Out
        .vendor-portal__arrow-block
          .vendor-portal__arrow(@click="showAccountMenu")
    .vendor-portal__main
      .vendor-portal__nav
        .vendor-portal__sidebar
          ul.vendor-portal__nav-menu
            li.vendor-portal__nav-item(@click="switchSection(index)" v-for="(note, index) in navbarList" :class="{'vendor-portal_active': note.active}")
              .vendor-portal__image
                img(:src="note.imgBrown")
              .vendor-portal__nav-title
                span {{ note.title }}
          .vendor-portal__balloons
      nuxt-child
</template>

<script>

import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";

export default {
  middleware: 'authenticated',
  data() {
    return {
      navbarList: [
        {
          title: "DASHBOARD",
          path: "/dashboard",
          imgBrown: require("../assets/images/CATEGORIES/DASHBOARD.png"),
          active: true
        },
        {
          title: "COMPLETED JOBS",
          path: "/completed-jobs",
          imgBrown: require("../assets/images/CATEGORIES/COMPLETE-JOBS.png"),
          active: false
        }
      ],
      isAccountMenu: false,
      accountInfo: false,
      domain: ""
    };
  },
  methods: {
    mainPageRender() {
      this.toggleSideBar(true);
    },
    toggleSideBar(isFirstRender) {
      for(let elem of this.navbarList) {
        if(window.location.toString().indexOf(elem.path) !== -1) {
          elem.active = true;
          if(isFirstRender) {
            // this.$router.push(elem.path);
          }
        } else {
          elem.active = false
        }
      }
    },
    signOut() {
      this.$router.push('/login');
      this.logout();
    },
    switchSection(index) {
      this.navbarList.forEach((item, i) => {
        item.active = i === index;
      });
      this.$router.push(this.navbarList[index].path);
    },
    showAccountMenu() {
      this.isAccountMenu = !this.isAccountMenu;
    },
    showAccountInfo() {
      this.hideAccountMenu();
      this.$router.push('/account');
    },
    hideAccountMenu() {
      this.isAccountMenu = false;
    },
    setToken() {
      const vendorToken = this.$cookie.get("vendor");
      this.$store.commit("SET_TOKEN", vendorToken);
    },
    ...mapActions(["alertToggle", "logout", "getVendorInfo"])
  },
  computed: {
    ...mapGetters({
      token: "getToken",
      vendor: "getVendor"
    }),
    fullName() {
      if(this.vendor) {
        return this.vendor.firstName + " " + this.vendor.surname;
      }
    }
  },
  components: {
  },
  mounted() {
    this.domain = process.env.domain;
    this.setToken();
    this.getVendorInfo();
    this.mainPageRender();
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

.vendor-portal {
  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #67573e;
    position: fixed;
    height: 6vh;
    width: 100%;
    z-index: 1000;
  }
  &__admin-name {
    width: 35%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-left: 150px;
  }
  &__adminPortal {
    color: #fff;
    width: 100%;
    font-size: 24px;
    font-weight: 700;
  }
  &__account {
    display: flex;
    align-items: center;
  }
  &__dropdown-wrapper {
    height: 34px;
    width: 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &__imgwrap {
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    .spwrap {
      color: #fff;
      visibility: visible;
      position: absolute;
      right: 41px;
    }
  }
  &__photo-wrapper {
    margin: 0 3px 7px 15px;
    border-radius: 30px;
    width: 33px;
    height: 33px;
    position: relative;
  }
  &__photo {
    border-radius: 50%;
    background-color: white;
    padding-bottom: 1px;
    padding-right: 1px;
    width: 35px;
    height: 35px;
    object-fit: cover;
  }
  &__account-block {
    width: 192px;
    background-color: #fff;
    box-shadow: 1px 1px 11px black;
    position: absolute;
    top: 44px;
    right: -140px;
    border-radius: 6px;
    z-index: 5;
    overflow: hidden;
    box-sizing: border-box;
  }
  &__info {
    display: flex;
    justify-content: flex-start;
    border-bottom: 1px solid #998e7e;
    padding: 5px 0;
  }
  &__icon {
    margin-left: 10px;
    img {
      height: 32px;
    }
  }
  &__personal {
    color: #67573e;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 10px;
  }
  &__personal-data {
    font-size: 12px;
  }
  &__item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid #998e7e;
    cursor: pointer;
    &:hover {
      background-color: #ddd3c8;
    }
  }
  &__list-label {
    font-size: 12px;
    color: #67573e;
    margin-left: 10px;
  }
  &__arrow-block {
    width: 140px;
  }
  &__arrow {
    position: relative;
    text-align: center;
    padding: 12px 12px 12px 12px;
    margin-bottom: 6px;
    height: 16px;
    width: 16px;
    cursor: pointer;
    transform: rotate(180deg);
    &:before {
      content: "";
      position: absolute;
      top: 15px;
      height: 8%;
      width: 29%;
      background: #fff;
      transform: skew(0deg,50deg);
    }
    &:after {
      content: "";
      position: absolute;
      top: 15px;
      height: 8%;
      left: 8px;
      width: 29%;
      background: #fff;
      transform: skew(0deg,-50deg);
    }
    @media screen and (max-width: 1450px) {
      margin-right: 43px;
    }
    @media screen and (max-width: 1350px) {
      margin-right: 23px;
    }
  }
  &__main {
    box-sizing: border-box;
    padding-top: 6vh;
    padding-left: 150px;
    display: flex;
    height: 100%;
    position: relative;
  }
  &__inner {
    width: 90%;
  }
  &__nav {
    position: fixed;
    left: 0;
    z-index: 999;
    display: flex;
    min-height: 94vh;
  }
  &__sidebar {
    padding: 25px 0;
    background-color: #998e7e;
    width: 150px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 4px 6px 8px rgba(103, 87, 62, 0.4);
    transition: all 0.5s;
    z-index: 2;
    overflow: hidden;
  }
  &__nav-menu {
    list-style: none;
    font-size: 15px;
    font-weight: bold;
    padding: 0;
    width: 167px;
    height: 77vh;
    margin-bottom: 0;
    overflow-y: scroll;
  }
  &__nav-item {
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
  }
  &__nav-title {
    transition: all 0.3s;
    color: #fff;
  }
  &__image {
    img {
      filter: brightness(300%);
    }
  }
  &_active {
    background-color: white;
    .vendor-portal__nav-title {
      color: #978d7e;
    }
    .vendor-portal__image {
      img {
        filter: none;
      }
    }
  }
  &__balloons {
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

</style>



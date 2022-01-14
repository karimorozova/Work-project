<template lang="pug">
  .wrapper
    .navbar
      .navbar__logo
        img(src="../assets/images/navbar/navbar-logo.svg")
      .navbar__menu
        .item(v-for="(item, index) in navbarList" :key="index" @click="switchSection(index)" :class="{'active__item': item.active}")
          .item__image
            img(:src="item.img")
          .item__title {{ item.title }}
      .navbar__name
        .navbar__name-title VENDOR PORTAL

    .content
      Header
      .content__body(v-if="unitsLength")
        nuxt-child

</template>

<script>

import ClickOutside from "vue-click-outside"
import { mapGetters, mapActions } from "vuex"
import Header from "../components/pangea/Header"
import { testtt } from "../store/actions/vendors/info"

export default {
  components: { Header },
  middleware: [ 'authenticated', 'new-user-redirect' ],
  data() {
    return {
      navbarList: [
        {
          title: "Dashboard",
          path: "/dashboard",
          img: require("../assets/images/navbar/Dashboard.png"),
          active: false
        },
        {
          title: "Completed Jobs",
          path: "/completed-jobs",
          img: require("../assets/images/navbar/CompleteJobs.png"),
          active: false
        },
        {
          title: "Competencies & Rate",
          path: "/competency-and-rate",
          img: require("../assets/images/navbar/Competencies.png"),
          active: false
        },
        {
          title: "Assessment",
          path: "/qualification-and-assessment",
          img: require("../assets/images/navbar/Assessment.png"),
          active: false
        },
        {
          title: "Billing Information",
          path: "/billing-information",
          img: require("../assets/images/navbar/Invoices.png"),
          active: false
        },
        {
          title: "Experience & Education",
          path: "/experience-and-education",
          img: require("../assets/images/navbar/ExperienceEducation.png"),
          active: false
        },
        {
          title: "Documents",
          path: "/documents",
          img: require("../assets/images/navbar/Documents.png"),
          active: false
        },
        {
          title: "Invoices",
          path: "/invoices",
          img: require("../assets/images/navbar/Invoices.png"),

          active: false
        },
        {
          title: "Profile",
          path: "/account",
          img: require("../assets/images/navbar/Profile.png"),
          active: false
        }
      ],
      isAccountMenu: false,
      accountInfo: false,
      domain: '',

      unitsLength: 0
    }
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "logout",
      "setOriginallyUnits"
    ]),

    mainPageRender() {
      this.toggleSideBar(true)
    },
    async getOriginallyUnits() {
      try {
        const result = await this.$axios.get("/api/units")
        this.setOriginallyUnits(result.data)
        this.unitsLength = result.data.length
      } catch (err) {
      }
    },
    async getVendorInfo() {
      try {
        const result = await this.$axios.get(`/vendor/info?token=${ this.$store.state.token }`)
        const decode = window.atob(result.data)
        const data = JSON.parse(decode)
        this.$store.commit("SET_VENDOR", data)
        this.$store.commit("SET_ACCOUNT_INFO")
      } catch (err) {
        this.logout()
        this.$router.push('/login')
      }
    },
    async getAllIndustries() {
      try {
        let result = await this.$axios.$get("/api/industries")
        result.sort((a, b) => {
          if (a.lang < b.lang) return -1
          if (a.lang > b.lang) return 1
        })
        this.$store.commit("SET_INDUSTRIES", result)
      } catch (err) {
      }
    },
    async getAllLanguages() {
      try {
        let result = await this.$axios.$get("/api/languages")
        result.sort((a, b) => {
          if (a.lang < b.lang) return -1
          if (a.lang > b.lang) return 1
        })
        this.$store.commit('SET_LANGUAGES', result)
      } catch (err) {
      }
    },
    async getAllSteps() {
      try {
        let result = await this.$axios.$get("/api/steps")
        result.sort((a, b) => {
          if (a.title < b.title) return -1
          if (a.title > b.title) return 1
        })
        this.$store.commit('SET_STEPS', result)
      } catch (err) {

      }
    },
    toggleSideBar(isFirstRender) {
      for (let elem of this.navbarList) {
        if (window.location.toString().indexOf(elem.path) !== -1) {
          elem.active = true
          if (isFirstRender) {
            // this.$router.push(elem.path);
          }
        } else {
          elem.active = false
        }
      }
    },

    switchSection(index) {
      this.navbarList.forEach((item, i) => {
        item.active = i === index
      })
      this.$router.push(this.navbarList[index].path)
    },
    showAccountMenu() {
      this.isAccountMenu = !this.isAccountMenu
    },
    // showAccountInfo() {
    // 	this.hideAccountMenu()
    // 	this.$router.push('/account')
    // },
    hideAccountMenu() {
      this.isAccountMenu = false
    }
    // setToken() {
    // 	const vendorToken = this.$cookie.get("vendor")
    // 	this.$store.commit("SET_TOKEN", vendorToken)
    // }
  },
  computed: {
    ...mapGetters({
      token: "getToken",
      vendor: "getVendor",
      steps: "getAllSteps",
      currentRequests: "getRequestsCount"
    })
  },
  async created() {
    await this.getVendorInfo()
    await this.getOriginallyUnits()
    await this.getAllIndustries()
    await this.getAllLanguages()
    await this.getAllSteps()
    // // this.setToken()
  },
  updated() {
    this.toggleSideBar(false)
  },
  mounted() {
    this.domain = process.env.domain
    this.mainPageRender()
  },
  directives: {
    ClickOutside
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.active__item {
  color: $red;
}

.item {
  display: flex;
  transition: .1s ease-in-out;
  cursor: pointer;
  padding: 10px 10px 10px 25px;
  align-items: center;

  &__image {
    height: 20px;
    width: 20px;

    img {
      width: 100%;
    }
  }

  &__title {
    font-family: Myriad600;
    margin-left: 15px;
    font-size: 15px;
    margin-top: 1px;
  }

  &:hover {
    background: $light-border;
  }
}

.wrapper {
  display: flex;
}

.navbar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 270px;
  z-index: 99999;
  box-sizing: border-box;
  background: white;
  box-shadow: $box-shadow;

  &__name {
    text-align: center;
    font-size: 19px;
    border-top: 1px solid $border;
    padding-top: 26px;
    cursor: default;
    position: relative;

  }

  &__menu {
    height: calc(100vh - 170px);
    overflow-y: auto;
    scrollbar-width: none;
    margin-top: 5px;
  }

  ::-webkit-scrollbar {
    width: 0px;
  }

  &__logo {
    margin: 0 auto;
    padding: 20px 0 10px 0;
    width: 190px;

    img {
      width: 100%;
    }
  }
}

.content {
  width: 100%;
  min-width: fit-content;
  margin-left: 270px;

  &__body {
    padding: 50px 0px 50px 50px;
  }
}

.spinner1 {
  position: relative;
  width: 42px;
  height: 42px;

  &:before,
  &:after {
    content: "";
    display: block;
    position: absolute;
    border-width: 3px;
    border-style: solid;
    border-radius: 50%;
  }
}

</style>



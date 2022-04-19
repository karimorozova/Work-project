<template lang="pug">
  .wrapper(v-if="isLoad" )
    .navbar
      .navbar__logo
        img(src="../assets/images/navbar/navbar-logo.svg")
      .navbar__menu
        .menu(v-for="(item, index) in navbarList" :key="index" )
          router-link(v-if="!item.isGroup" class="item" tag="div" :to="item.path" )
            .item__image
              img(:src="item.img")
            .item__title {{ item.title }}
          .item__group(v-else )
            .item__drop-down( @click="() => toggleDropDown(item)")
              .item__icon(:class="{'open': item.active}")
                i(class="fas fa-chevron-right")
              .drop-down__title {{ item.title }}

            template(v-if="item.active")
              router-link(class="drop-down__item item" tag="div" :to="subItem.path" v-for="subItem in item.children" :key="item.children.path")
                .item__image
                  img(:src="subItem.img")
                .item__title {{ subItem.title }}
      .navbar__name
        .navbar__name-title VENDOR PORTAL

    .content(v-if="vendor._id" )
      Header
      .content__body
        nuxt-child

</template>

<script>

import ClickOutside from "vue-click-outside"
import { mapGetters, mapActions } from "vuex"
import Header from "../components/Header"
import { setCurrentVendor } from "../store/actions"
import { getVendor } from "../store/getters"

export default {
  components: { Header },
  middleware: [ 'authenticated', 'new-user-redirect' ],
  data() {
    return {
      navbarList: [
        {
          title: "Open & Upcoming Jobs",
          path: "/dashboard",
          img: require("../assets/images/navbar/Jobs.svg"),
          active: false
        },
        {
          title: "Completed Jobs",
          path: "/completed-jobs",
          img: require("../assets/images/navbar/Projects.svg"),
          active: false
        },
        {
          title: "Profile",
          path: "/profile-details",
          active: false,
          isGroup: true,
          children: [
            {
              title: "Competencies & Rates",
              path: "/profile-details/competency-and-rate",
              img: require("../assets/images/navbar/Rate.svg"),
              active: false
            },
            {
              title: "Assessments",
              path: "/profile-details/qualification-and-assessment",
              img: require("../assets/images/navbar/Assessment.svg"),
              active: false
            },
            {
              title: "Experience & Documents",
              path: "/profile-details/experience-and-document",
              img: require("../assets/images/navbar/Education.svg"),
              active: false
            }
          ]
        },
        {
          title: "Billing",
          path: "/billing",
          active: false,
          isGroup: true,
          children: [
            {
              title: "Invoices",
              path: "/billing/invoices",
              img: require("../assets/images/navbar/Invoice.svg"),
              active: false
            },
            {
              title: "Billing Information",
              path: "/billing/billing-information",
              img: require("../assets/images/navbar/BI.svg"),
              active: false
            }
          ]
        },
        {
          title: "Settings",
          path: "/settings",
          active: false,
          isGroup: true,
          children: [
            {
              title: "Account",
              path: "/settings/account",
              img: require("../assets/images/navbar/Profile.svg"),
              active: false
            },
            {
              title: "New Competency",
              path: "/settings/new-competency",
              img: require("../assets/images/navbar/Add.svg"),
              active: false
            },
            {
              title: "Availability",
              path: "/settings/availability",
              img: require("../assets/images/navbar/Availability.svg"),
              active: false
            }
          ]
        }
      ],
      domain: '',
      isLoad: false
    }
  },
  computed: {
    ...mapGetters({
      vendor: 'getVendor'
    })
  },
  methods: {
    ...mapActions([
      "alertToggle",
      "logout",
      "setCurrentVendor",
      "setLanguages",
      'setIndustries',
      'setSteps',
      'setUnits',
      'setServices'
    ]),
    mainPageRender() {
      this.toggleSideBar(true)
    },
    toggleDropDown(item) {
      item.active = !item.active
    },
    toggleSideBar() {
      for (let elem of this.navbarList) {
        elem.active = window.location.toString().indexOf(elem.path) !== -1
      }
    },
    async getVendor() {
      try {
        const result = await this.$axios.get(`/vendor/portal-vendor-info?token=${ this.$store.state.token }`)
        this.setCurrentVendor(result.data)
      } catch (err) {
        this.logout()
        this.$router.push('/login')
      }
    },
    async getAllLanguages() {
      try {
        let result = await this.$axios.$get("/api/languages")
        result.sort((a, b) => {
          if (a.lang < b.lang) return -1
          if (a.lang > b.lang) return 1
        })
        this.setLanguages(result)
      } catch (err) {
      }
    },
    async getAllUnits() {
      try {
        const result = await this.$axios.get("/api/units")
        this.setUnits(result.data)
      } catch (err) {
      }
    },
    async getAllIndustries() {
      try {
        let result = await this.$axios.$get("/api/industries")
        result.sort((a, b) => {
          if (a.lang < b.lang) return -1
          if (a.lang > b.lang) return 1
        })
        this.setIndustries(result)
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
        this.setSteps(result)
      } catch (err) {
      }
    },
    async getAllServices() {
      try {
        let result = await this.$axios.$get("/api/services")
        result.sort((a, b) => {
          if (a.title < b.title) return -1
          if (a.title > b.title) return 1
        })
        this.setServices(result)
      } catch (err) {
      }
    }
  },
  async mounted() {
    this.mainPageRender()
    this.domain = process.env.domain
    this.isLoad = await new Promise(async (res) => {
      if (document) {
        this.$store.commit("SET_TOKEN", this.$cookie.get('vendor'))
        res(true)
      }
    })
    await this.getVendor()
    await this.getAllLanguages()
    await this.getAllUnits()
    await this.getAllIndustries()
    await this.getAllSteps()
    await this.getAllServices()
  },
  directives: {
    ClickOutside
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.fa-chevron-right {
  font-size: 17px;
}

.nuxt-link-active {
  color: $red;
}

.item {
  display: flex;
  transition: .1s ease-in-out;
  cursor: pointer;
  padding: 10px 10px 10px 20px;
  align-items: center;

  &__image {
    height: 20px;
    width: 20px;

    img {
      width: 100%;
    }
  }

  &__title {
    font-family: Roboto600;
    margin-left: 12px;
    font-size: 14px;
    margin-top: 1px;
  }

  &__drop-down {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 10px 10px 10px 25px;

    &:hover {
      background: $light-border;
    }
  }

  &__icon {
    transition: transform .2s ease;
  }


  &:hover {
    background: $light-border;
  }

}

.drop-down {
  &__title {
    font-family: Roboto600;
    margin-left: 20px;
    font-size: 14px;
    margin-top: 1px;
  }

  &__item {
    display: flex;
    transition: .1s ease-in-out;
    cursor: pointer;
    padding: 10px 10px 10px 40px;
    align-items: center;
  }
}

.open {
  transform: rotate(90deg);
}

.wrapper {
  display: flex;
}

.navbar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 255px;
  z-index: 99999;
  box-sizing: border-box;
  background: white;
  border-right: 1px solid $light-border;


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
  margin-left: 255px;

  &__body {
    padding: 50px 0px 50px 50px;
  }
}

</style>



<template lang="pug">
  .wrapper(v-if="isLoad")
    .navbar
      .navbar__logo
        img(src="../assets/images/navbar/navbar-logo.svg")
      .navbar__menu
        //.item(v-for="(item, index) in navbarList" :key="index" @click="switchSection(index)" :class="{'active__item': item.active}")
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
        .navbar__name-title CLIENT PORTAL


    .content
      Header
      .content__body
        nuxt-child(@thankYou="thankYou" @thankProof='thankYou' @thankCopy="thankYou" @thankMark="thankYou" :thanksService="thanksService")

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import Header from "../components/pangea/Header"
import cookie from "../plugins/vue-cookie"

export default {
  components: { Header },
  data() {
    return {
      isLoad: false,
      companyName: "",
      clientPortal: "CLIENT PORTAL",
      navbarList: [
        {
          title: "Dashboard",
          path: "/dashboard",
          img: require("../assets/images/navbar/Dashboard.svg"),
          active: true
        },
        // {
        //   title: "Billing",
        //   path: "/billing",
        //   active: false,
        //   isGroup: true,
        //   children: [
        //     {
        //       title: "Overview",
        //       path: "/billing/overview",
        //       img: require("../assets/images/navbar/Templates.svg"),
        //       active: false
        //     },
        //     {
        //       title: "Invoices",
        //       path: "/billing/invoices",
        //       img: require("../assets/images/navbar/Profile.svg"),
        //       active: false
        //     },
        //     {
        //       title: "Paid Invoices",
        //       path: "/billing/invoices-paid",
        //       img: require("../assets/images/navbar/Profile.svg"),
        //       active: false
        //     },
        //     {
        //       title: "Pre-Payment",
        //       path: "/billing/pre-payment",
        //       img: require("../assets/images/navbar/Profile.svg"),
        //       active: false
        //     }
        //   ]
        // },
        {
          title: "Projects",
          path: "/projects",
          img: require("../assets/images/navbar/Projects.svg"),
          active: false
        },
        {
          title: "Settings",
          path: "/settings",
          active: false,
          isGroup: true,
          children: [
            {
              title: "Templates",
              path: "/settings/service-templates",
              img: require("../assets/images/navbar/Templates.svg"),
              active: false
            },
            {
              title: "Profile",
              path: "/settings/account",
              img: require("../assets/images/navbar/Profile.svg"),
              active: false
            },
            // {
            //   title: "Contacts",
            //   path: "/settings/contacts",
            //   img: require("../assets/images/navbar/Profile.svg"),
            //   active: false
            // }
          ]
        }
      ],
      openQuotes: true,
      openProjects: true,
      expander: false,
      accountMenuVisible: false,

      dropdownVisible: false,
      clientRequestShow: false,
      serviceType: "",
      thanksService: "",
      breadCrumb1: "",
      breadCrumb2: "",
      domain: ""
    }
  },
  methods: {
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
    thankYou(data) {
      this.clientRequestShow = false
      this.thanksService = data
      this.$router.push('/confirm-order')
    },
    signOut() {
      this.logout()
      this.$router.push('/login')
    },
    // dataForRequest(ind) {
    //   this.serviceType = this.newProject[ind].title
    //   this.navbarList.forEach((item, i) => {
    //     item.active = i === 0
    //   })
    //   this.$router.push(`/client-request${ this.newProject[ind].path }`)
    //   this.dropdownVisible = false
    // },
    setToken() {
      const clientToken = this.$cookie.get("client")
      this.$store.commit("SET_TOKEN", clientToken)
    },
    ...mapActions({
      logout: "logout",
      getClient: "getClient",
      getUser: "getUser",
      getServices: "getServices"
    })
  },
  watch: {
    $route(to) {
      this.breadCrumb1 = to.path.split('/')[1]
      this.breadCrumb2 = to.path.split('/')[2]
      if (!this.breadCrumb2) {
        this.clientRequestShow = false
      } else if (this.breadCrumb1 === 'client-request') {
        this.breadCrumb1 = 'New Project'
      }
    }
  },
  async mounted() {
    this.mainPageRender()
    this.domain = process.env.domain
    this.breadCrumb1 = this.$route.path.split('/')[1]
    this.breadCrumb2 = this.$route.path.split('/')[2]

    this.isLoad = await new Promise(async (res) => {
      if (document) {
        this.$store.commit("SET_TOKEN", this.$cookie.get('client'))
        res(true)
      }
    })
    await this.getClient()
    await this.getUser()
    await this.getServices()
  },
  computed: {
    ...mapGetters({
      clientInfo: "getClientInfo",
      currentRequests: "getRequestsCount"
    })
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
    font-family: Myriad600;
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
    font-family: Myriad600;
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

@font-face {
  font-family: 'Myriad300';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto300.woff2') format('woff2');
}

@font-face {
  font-family: 'Myriad400';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto400.woff2') format('woff2');
}

@font-face {
  font-family: 'Myriad600';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto600.woff2') format('woff2');
}


@font-face {
  font-family: 'Myriad900';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/Roboto900.woff2') format('woff2');
}

</style>

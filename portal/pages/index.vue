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
        transition(name="fade")
          .navbar__name-spinner(v-if="!!currentRequests")
            .spinner1.spinner-1
        .navbar__name-title CLIENT PORTAL



    .content
      Header
      .content__body
        nuxt-child( @thankYou="thankYou" @thankProof='thankYou' @thankCopy="thankYou" @thankMark="thankYou" :thanksService="thanksService")

</template>

<script>
import { mapActions, mapGetters } from "vuex"
import Header from "../components/pangea/Header"

export default {
  components: { Header },
  data() {
    return {
      companyName: "",
      clientPortal: "CLIENT PORTAL",
      navbarList: [
        {
          title: "Dashboard",
          path: "/dashboard",
          img: require("../assets/images/navbar/Dashboard.png"),
          active: true
        },
        {
          title: "Projects",
          path: "/projects",
          img: require("../assets/images/navbar/Projects.png"),
          active: false
        },
        {
          title: "Profile",
          path: "/account",
          img: require("../assets/images/navbar/Profile.png"),
          active: false
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
    toggleSideBar(isFirstRender) {
      for (let elem of this.navbarList) {
        elem.active = window.location.toString().indexOf(elem.path) !== -1
      }
    },
    thankYou(data) {
      this.clientRequestShow = false
      this.thanksService = data
      this.$router.push('/confirm-order')
    },
    hideAccountMenu() {
      this.accountMenuVisible = false
    },
    closeRequestsMenu() {
      this.dropdownVisible = false
    },
    signOut() {
      this.logout()
      this.$router.push('/login')
    },
    switchSection(index) {
      this.navbarList.forEach((item, i) => {
        item.active = i === index
      })
      this.$router.push(this.navbarList[index].path)
    },
    showAccountMenu() {
      this.accountMenuVisible = !this.accountMenuVisible
    },
    showAccountInfo() {
      this.accountMenuVisible = !this.accountMenuVisible
      this.clientRequestShow = false
      this.navbarList.forEach(item => {
        item.active = false
      })
    },
    showDropdown() {
      this.dropdownVisible = !this.dropdownVisible
    },
    dataForRequest(ind) {
      this.serviceType = this.newProject[ind].title
      this.navbarList.forEach((item, i) => {
        item.active = i === 0
      })
      this.$router.push(`/client-request${ this.newProject[ind].path }`)
      this.dropdownVisible = false
    },
    setToken() {
      const clientToken = this.$cookie.get("client")
      this.$store.commit("SET_TOKEN", clientToken)
    },
    ...mapActions({
      logout: "logout",
      // requestInfo: "requestInfo",
      // loadLangs: "loadLangs",
      getClient: "getClient",
      getUser: "getUser",
      getServices: "getServices"
    })
  },
  watch: {
    '$route'(to, from) {
      this.breadCrumb1 = to.path.split('/')[1]
      this.breadCrumb2 = to.path.split('/')[2]
      if (!this.breadCrumb2) {
        this.clientRequestShow = false
      } else if (this.breadCrumb1 === 'client-request') {
        this.breadCrumb1 = 'New Project'
      }
    }
  },
  mounted() {
    this.mainPageRender()
    this.domain = process.env.domain
    this.breadCrumb1 = this.$route.path.split('/')[1]
    this.breadCrumb2 = this.$route.path.split('/')[2]
    this.setToken()
  },
  async created() {
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


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.active__item {
  color: $green;
}

.item {
  display: flex;
  transition: .1s ease-in-out;
  cursor: pointer;
  padding: 9px 12px 9px 20px;
  align-items: center;

  &__title {
    font-family: Myriad600;
    margin-left: 10px;
    font-size: 15px;
  }

  &:hover {
    background: $light-border;
  }
}

.greyColor {
  color: #ccc;
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
    font-size: 20px;
    font-family: Myriad900;
    border-top: 1px solid $border;
    padding-top: 22px;
    cursor: default;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    color: #ccc;

    &-spinner {
      position: absolute;
      left: 42%;
    }
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
    width: 200px;

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
  src: url('../assets/fonts/MYRIADPRO-LIGHT.woff') format('woff');
}

@font-face {
  font-family: 'Myriad400';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/MYRIADPRO-REGULAR.woff') format('woff');
}

@font-face {
  font-family: 'Myriad600';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/MYRIADPRO-SEMIBOLD.woff') format('woff');
}


@font-face {
  font-family: 'Myriad900';
  font-style: normal;
  font-weight: normal;
  src: url('../assets/fonts/MYRIADPRO-BOLD.woff') format('woff');
}

.spinner1 {
  position: relative;
  width: 50px;
  height: 50px;

  &:before,
  &:after {
    content: "";
    display: block;
    position: absolute;
    border-width: 2px;
    border-style: solid;
    border-radius: 50%;
  }
}

.spinner1.spinner-1 {
  @keyframes rotate-animation {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes anti-rotate-animation {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(-360deg);
    }
  }

  &:before {
    width: 30px;
    height: 30px;
    border-bottom-color: $green;
    border-right-color: $green;
    border-top-color: rgba(red, 0);
    border-left-color: rgba(red, 0);
    top: 0px;
    left: 0px;
    animation: rotate-animation 1s linear 0s infinite;
  }

  &:after {
    width: 15px;
    height: 15px;
    border-bottom-color: $red;
    border-right-color: $red;
    border-top-color: rgba(red, 0);
    border-left-color: rgba(red, 0);
    top: (30px - 15px) / 2;
    left: (30px - 15px) / 2;
    animation: anti-rotate-animation 0.85s linear 0s infinite;
  }
}


</style>

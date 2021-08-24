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

    .content
      Header
      .content__body
        nuxt-child(:client='client' :user="user" :projects="projects" :requests="requests" @thankYou="thankYou" @thankProof='thankYou' @thankCopy="thankYou" @thankMark="thankYou" :thanksService="thanksService")

  //.wrapper
    .menu
      .menu__item(v-for="item in navbarList")
        | {{ item }}
    .inner
      Header



    .clientsTop
      .clientsTop__clientName
        .clientsPortal CLIENT PORTAL
      .clientsTop__searchBlock
        .dropdownWrapper(v-click-outside="closeRequestsMenu")
          .sel_project_block(@click="showDropdown")
            .sel_project_block__proj
              span New Project
            .sel_project_block__imgWrapper
              img(src="../assets/images/open-arrow_white.png" :class="{rotate: dropdownVisible}")
              .clientsTop__dropdown
                .additional(v-if="dropdownVisible")
                  .additional__listItem(v-for='(proj, ind) in newProject' @click='dataForRequest(ind)') {{ proj.title }}

        .account-menu(v-click-outside="hideAccountMenu")
          .womanWrapper
            img.womanWrapper__photo(v-if="user.photo" :src="domain+user.photo")
            img.womanWrapper__photo(v-else src="../assets/images/client-icon_image.png")
            .accountMenuWrapper(v-if="accountMenuVisible")
              .accountBlock
                .accountBlock__info
                  .icon
                    img(src="../assets/images/man.png")
                  .personal__data
                    .personal__data_name {{ user.firstName }}
                    .personal__data_email {{ user.email }}
                //.accountBlock__myaccount__wrapper(@click="showAccountInfo")
                  router-link.accountBlock__myaccount(to="/account")
                    .human_icon
                      img(src="../assets/images/man.png")
                    .my_account My Account
                .accountBlock__exit(@click="signOut")
                  .icon_exit
                    img(src="../assets/images/sign-out.png")
                  .sign_out Sign Out
          .chevronWrapper
            .chevron(@click="showAccountMenu")
    .clientsMainWrapper
      //.clientsNavbar
        .clientsNavbar__sideBar
          ul.navbar__ulist
            router-link(:to="note.path" v-for="(note, index) in navbarList" :key="index")
              li.navbar__ulist_item(@click="switchSection(index)" :class="{active: note.active}")
                .image
                  img.navbar_no-filter-image(v-if="!note.active && note.imgWhite" :src="note.imgWhite")
                  img.navbar__image(v-else :src="note.img")
                .title(:class="{showTitle: true}")
                  span {{ note.title }}
          .logoImage(v-if="expander")
          .balloons(v-else)
      .clientsMainWrapper__inner
        //.breadCrumbs
          span.accountName {{ user.firstName }}
          span.arrows(v-if="user.firstName")
            i.fa.fa-angle-double-right(aria-hidden='true')
          span {{ breadCrumb1.toUpperCase() }}
          //span.arrows(v-if="breadCrumb2")
            i.fa.fa-angle-double-right(aria-hidden='true')
          //span(v-if="clientRequestShow") {{ serviceType }}

</template>

<script>
	import ClickOutside from "vue-click-outside"
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
						img: require("../assets/images/navbar/Dashboard.png"),
						active: false
					},
					{
						title: "Profile",
						path: "/account",
						img: require("../assets/images/navbar/Dashboard.png"),
						active: false
					}
					// {
					// 	title: "INVOICES",
					// 	path: "/invoices",
					// 	img: require("../assets/images/CATEGORIES/INVOICES.png"),
					// 	active: false
					// },
					// {
					// 	title: "DOCUMENTS",
					// 	path: "/documents",
					// 	imgWhite: require("../assets/images/CATEGORIES/DOCUMENTS2.png"),
					// 	img: require("../assets/images/CATEGORIES/DOCUMENTS.png"),
					// 	active: false
					// }
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
			async getServices() {
				const result = await this.$axios.$get('/api/services?filter=active')
				result.sort((a, b) => {
					return a.sortIndex - b.sortIndex
				})
				this.servicesGetting(result)
			},
			setToken() {
				const clientToken = this.$cookie.get("client")
				this.$store.commit("SET_TOKEN", clientToken)
			},
			...mapActions({
				logout: "logout",
				requestInfo: "requestInfo",
				loadLangs: "loadLangs",
				servicesGetting: "servicesGetting",
				getProjectsAndRequests: "getProjectsAndRequests"
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
			this.domain = process.env.domain
			this.mainPageRender()
			this.setToken()
			this.getServices()
			this.getProjectsAndRequests()
			this.breadCrumb1 = this.$route.path.split('/')[1]
			this.breadCrumb2 = this.$route.path.split('/')[2]
		},
		directives: {
			ClickOutside
		},
		computed: {
			...mapGetters({
				projects: "getAllProjects",
				requests: "getAllRequests",
				user: "getUserInfo",
				client: "getClientInfo"
			})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../assets/scss/colors";

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
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;

    &__menu {
      height: calc(100vh - 140px);
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


</style>

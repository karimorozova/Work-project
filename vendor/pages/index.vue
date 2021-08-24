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
      .navbar__name VENDOR PORTAL

    .content
      Header
      .content__body
        nuxt-child

    //.vendor-portal__top
      //.vendor-portal__admin-name
        h2.vendor-portal__adminPortal VENDOR PORTAL
        //h2.vendor-portal__adminPortal(v-if="vendorvendor.competencies || vendor.competencies.length") VENDOR PORTAL
      //.vendor-portal__account(v-click-outside="hideAccountMenu")
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
              //.vendor-portal__item(@click="showAccountInfo")
                .vendor-portal__icon
                  img(src="../assets/images/man.png")
                .vendor-portal__list-label My Account
              .vendor-portal__item(@click="signOut")
                .vendor-portal__icon
                  img(src="../assets/images/sign-out.png")
                .vendor-portal__list-label Sign Out
        .vendor-portal__arrow-block
          .vendor-portal__arrow(@click="showAccountMenu")
            img(v-if="!this.isAccountMenu" src="../assets/images/down-icon.png")
            img(v-else src="../assets/images/up-icon.png")

      //.vendor-portal__nav
        .vendor-portal__sidebar
          ul.vendor-portal__nav-menu
            router-link(:to="note.path" v-for="(note, index) in navbarList" :key="index")
              li.vendor-portal__nav-item(@click="switchSection(index)" :class="{'vendor-portal_active': note.active}")
                .vendor-portal__image(v-if="!note.active && note.imgWhite")
                  img.image.navbar_no-filter(:src="note.imgWhite")
                .vendor-portal__image(v-else)
                  img(:src="note.img")
                .vendor-portal__nav-title
                  span {{ note.title }}
          .vendor-portal__balloons


</template>

<script>

	import ClickOutside from "vue-click-outside"
	import { mapGetters, mapActions } from "vuex"
	import Header from "../components/pangea/Header"

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
						img: require("../assets/images/navbar/Dashboard.png"),
						active: false
					},
					{
						title: "Competencies & Rate",
						path: "/competency-and-rate",
						img: require("../assets/images/navbar/Dashboard.png"),
						active: false
					},
					{
						title: "Assessment",
						path: "/qualification-and-assessment",
						img: require("../assets/images/navbar/Dashboard.png"),
						active: false
					},
					{
						title: "Experience & Education",
						path: "/experience-and-education",
						img: require("../assets/images/navbar/Dashboard.png"),
						active: false
					},
					{
						title: "Documents",
						path: "/documents",
						img: require("../assets/images/navbar/Dashboard.png"),
						active: false
					},
					{
						title: "Invoices",
						path: "/invoices",
						img: require("../assets/images/navbar/Dashboard.png"),

						active: false
					},
					{
						title: "Profile",
						path: "/account",
						img: require("../assets/images/navbar/Dashboard.png"),
						active: false
					}
				],
				isAccountMenu: false,
				accountInfo: false,
				domain: ''
			}
		},
		methods: {
			...mapActions([
				"alertToggle",
				"logout",
				"setOriginallyUnits",
				"setReports"
			]),

			mainPageRender() {
				this.toggleSideBar(true)
			},
			async getOriginallyUnits() {
				try {
					const result = await this.$axios.get("/api/units")
					this.setOriginallyUnits(result.data)
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
				}
			},
			async getVendorReports() {
				try {
					const result = await this.$axios.get(`/vendor/reports?token=${ this.$store.state.token }`)
					const decode = window.atob(result.data)
					const data = JSON.parse(decode)
					console.log('reppp', data)
					this.setReports(data)
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
				steps: "getAllSteps"
			})
		},
		async created() {
			await this.getOriginallyUnits()
			await this.getVendorInfo()
			await this.getVendorReports()
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

</style>



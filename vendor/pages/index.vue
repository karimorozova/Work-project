<template lang="pug">
  .vendor-portal
    .vendor-portal__top
      .vendor-portal__admin-name
        h2.vendor-portal__adminPortal VENDOR PORTAL
        //h2.vendor-portal__adminPortal(v-if="vendorvendor.competencies || vendor.competencies.length") VENDOR PORTAL
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


    .vendor-portal__main
      .vendor-portal__nav
        .vendor-portal__sidebar
          ul.vendor-portal__nav-menu
            router-link(:to="note.path" v-for="(note, index) in navbarList" :key="index")
              li.vendor-portal__nav-item(@click="switchSection(index)" :class="{'vendor-portal_active': note.active}")
                .vendor-portal__image(v-if="!note.active && note.imgWhite")
                  img.image.navbar_no-filter(:src="note.imgWhite")
                .vendor-portal__image(v-else)
                  img(:src="note.imgBrown")
                .vendor-portal__nav-title
                  span {{ note.title }}
          .vendor-portal__balloons
      nuxt-child
</template>

<script>

	import ClickOutside from "vue-click-outside"
	import { mapGetters, mapActions } from "vuex"

	export default {
		middleware: [ 'authenticated', 'new-user-redirect' ],
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
					},
					{
						title: "COMPETENCIES & RATE",
						path: "/competency-and-rate",
						imgBrown: require("../assets/images/CATEGORIES/competencies.png"),
						imgWhite: require("../assets/images/CATEGORIES/competencies(selected).png"),
						// imgBrown: require("../assets/images/CATEGORIES/quotes.png"),
						active: false
					},
					{
						title: "ASSESSMENT",
						path: "/qualification-and-assessment",
						imgBrown: require("../assets/images/CATEGORIES/assessment.png"),
						imgWhite: require("../assets/images/CATEGORIES/assessment(selected).png"),
						// imgBrown: require("../assets/images/CATEGORIES/rate.png"),
						active: false
					},
					{
						title: "EXPERIENCE & EDUCATION",
						path: "/experience-and-education",
						imgBrown: require("../assets/images/CATEGORIES/experience-education.png"),
						imgWhite: require("../assets/images/CATEGORIES/experience-education(selected).png"),
						// imgBrown: require("../assets/images/CATEGORIES/languages.png"),
						active: false
					},
					{
						title: "DOCUMENTS",
						path: "/documents",
						imgBrown: require("../assets/images/CATEGORIES/documents.png"),
						imgWhite: require("../assets/images/CATEGORIES/documents(selected).png"),
						// imgBrown: require("../assets/images/CATEGORIES/projects-brown.png"),
						active: false
					},
					{
						title: "PROFILE",
						path: "/account",
						imgBrown: require("../assets/images/CATEGORIES/my-account.png"),
						imgWhite: require("../assets/images/CATEGORIES/my-account(selected).png"),

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
			signOut() {
				this.$router.push('/login')
				this.logout()
			},
			switchSection(index) {
				this.navbarList.forEach((item, i) => {
					item.active = i === index
				})
				// this.$router.push(this.navbarList[index].path)
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
			},
			setToken() {
				const vendorToken = this.$cookie.get("vendor")
				this.$store.commit("SET_TOKEN", vendorToken)
			}
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

  .vendor-portal {

    &__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #67573e;
      position: fixed;
      height: 40px;
      width: 100%;
      z-index: 10000;
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
      font-size: 22px;
      font-family: Myriad600;
    }

    &__account {
      display: flex;
      align-items: center;
      height: 40px;
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
      width: 35px;
      height: 35px;
      object-fit: cover;
    }

    &__account-block {
      width: 200px;
      background-color: #fff;
      box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
      position: absolute;
      top: 44px;
      right: -120px;
      border-radius: 4px;
      z-index: 5;
      overflow: hidden;
      box-sizing: border-box;
    }

    &__info {
      display: flex;
      justify-content: flex-start;
      border-bottom: 1px solid #c5bfb5;
      height: 36px;
      padding: 5px 0;
    }

    &__icon {
      width: 40px;
      text-align: center;
    }

    &__personal {
      color: #67573e;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    &__item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      border-bottom: 1px solid #c5bfb5;
      cursor: pointer;
      height: 36px;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #f4f2f1;
      }
    }

    &__list-label {
      color: #67573e;
    }

    &__arrow-block {
      width: 150px;
    }

    &__arrow {
      cursor: pointer;
      margin-left: 10px;
    }

    &__main {
      box-sizing: border-box;
      padding-top: 40px;
      padding-left: 135px;
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
      min-height: calc(100vh - 40px);
    }

    &__sidebar {
      padding: 25px 0;
      background-color: #948977;
      width: 135px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 0 10px rgba(104, 87, 62, 0.6);
      z-index: 2;
      overflow: hidden;
    }

    &__nav-menu {
      list-style: none;
      font-size: 14px;
      padding: 0;
      width: 155px;
      height: 77vh;
      margin-bottom: 0;
      overflow-y: scroll;
      font-family: Myriad900;

      a {
        text-decoration: none;
        display: block;
        margin-bottom: 20px;
      }

    }

    &__nav-item {
      padding-bottom: 10px;
      padding-top: 5px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-left: 0;
      margin-right: 0;
      cursor: pointer;

      &:hover {

      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__nav-title {
      /*font-family: Myriad900;*/
      color: #fff;
      padding: 0 20px;
      text-align: center;
    }

    &__image {
      img {
        filter: brightness(300%);
      }

      .navbar_no-filter {
        filter: none;
      }
    }

    &_active {
      background-color: white;

      .vendor-portal__nav-title {
        /*font-family: Myriad900;*/
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



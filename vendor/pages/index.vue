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
            img(v-if="!this.isAccountMenu" src="../assets/images/down-icon.png")
            img(v-else src="../assets/images/up-icon.png")


    .vendor-portal__main
      .vendor-portal__nav
        .vendor-portal__sidebar
          ul.vendor-portal__nav-menu
            router-link(:to="note.path" v-for="(note, index) in navbarList" :key="index")
              li.vendor-portal__nav-item(@click="switchSection(index)" :class="{'vendor-portal_active': note.active}")
                .vendor-portal__image
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
			}
		},
		methods: {
			...mapActions(["alertToggle", "setOriginallyUnits", "logout", "getVendorInfo"]),

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
				this.$router.push(this.navbarList[index].path)
			},
			showAccountMenu() {
				this.isAccountMenu = !this.isAccountMenu
			},
			showAccountInfo() {
				this.hideAccountMenu()
				this.$router.push('/account')
			},
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
				vendor: "getVendor"
			}),
			fullName() {
				if (this.vendor) {
					return this.vendor.firstName + " " + this.vendor.surname
				}
			}
		},
		async created() {
			await this.getOriginallyUnits()
		},
		mounted() {
			this.domain = process.env.domain
			this.setToken()
			this.getVendorInfo()
			this.mainPageRender()

		},
		updated() {
			this.toggleSideBar(false)
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
      height: 6vh;
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
      border-radius: 8px;
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
        background-color: #f2efeb;
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
      box-shadow: 0 0 10px rgba(104, 87, 62, 0.6);
      z-index: 2;
      overflow: hidden;
    }

    &__nav-menu {
      list-style: none;
      font-size: 14px;
      padding: 0;
      width: 167px;
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

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__nav-title {
      /*font-family: Myriad900;*/
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



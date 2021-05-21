<template lang="pug">
  .clientsportalWrapper
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
                .accountBlock__myaccount__wrapper(@click="showAccountInfo")
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
      .clientsNavbar
        .clientsNavbar__sideBar
          ul.navbar__ulist
            router-link(:to="note.path" v-for="(note, index) in navbarList" :key="index")
              li.navbar__ulist_item(@click="switchSection(index)" :class="{active: note.active}")
                .image
                  img.navbar_no-filter-image(v-if="!note.active && note.imgWhite" :src="note.imgWhite")
                  img.navbar__image(v-else :src="note.imgBrown")
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
        nuxt-child(:client='client' :user="user" :projects="projects" :requests="requests" @thankYou="thankYou" @thankProof='thankYou' @thankCopy="thankYou" @thankMark="thankYou" :thanksService="thanksService")
</template>

<script>
	import ClickOutside from "vue-click-outside"
	import { mapActions, mapGetters } from "vuex"

	export default {
		data() {
			return {
				companyName: "",
				clientPortal: "CLIENT PORTAL",
				navbarList: [
					{
						title: "DASHBOARD",
						path: "/dashboard",
						imgBrown: require("../assets/images/CATEGORIES/DASHBOARD.png"),
						active: true
					},
					{
						title: "PROJECTS",
						path: "/projects",
						imgBrown: require("../assets/images/CATEGORIES/PROJECTS.png"),
						active: false
					}
					// {
					// 	title: "INVOICES",
					// 	path: "/invoices",
					// 	imgBrown: require("../assets/images/CATEGORIES/INVOICES.png"),
					// 	active: false
					// },
					// {
					// 	title: "DOCUMENTS",
					// 	path: "/documents",
					// 	imgWhite: require("../assets/images/CATEGORIES/DOCUMENTS2.png"),
					// 	imgBrown: require("../assets/images/CATEGORIES/DOCUMENTS.png"),
					// 	active: false
					// }
				],
				openQuotes: true,
				openProjects: true,
				expander: false,
				accountMenuVisible: false,
				newProject: [
					{ title: "Compliance", path: "/compliance" }
					// { title: "Translation", path: "/translation" },
					// { title: "Copywriting", path: "/copywriting" },
					// { title: "Marketing", path: "/marketing" },
					// {title: "Proofing/QA", path: "/proofing"},
					// {title: "Graphic Localization", path: "/graphic-localization"}
				],
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

  body {
    margin: 0;
    font-family: Myriad400;
  }

  .projectsComponent,
  .quotesComponent {
    width: 1010px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .quotesComponent {
    margin-bottom: 40px;
  }

  .clientsTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #67573e;
    position: fixed;
    height: 40px;
    width: 100%;
    z-index: 1000;

    .company {
      span {
        font-size: 24px;
        font-weight: bold;
        color: darkslategray;
        font-style: italic;
      }
    }

    &__clientName {
      width: 35%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-left: 150px;

      a {
        text-decoration: none;
      }

      .clientsPortal {
        font-size: 22px;
        font-family: Myriad600;
        color: #fff;
        width: 100%;
      }

      .searchWrapper {
        display: flex;
        justify-content: flex-start;
        border: 2px solid #fff;

        img {
          padding-right: 514px;
        }
      }
    }

    .searchWrapper {
      display: flex;
      justify-content: flex-start;
      border: 2px solid #fff;
      width: 30%;
      visibility: hidden;
      /*@media screen and (max-width: 1520px) {*/
      /*  margin-right: 20px;*/
      /*}*/
      /*@media screen and (max-width: 1430px) {*/
      /*  margin-right: 40px;*/
      /*}*/
      /*@media screen and (max-width: 1380px) {*/
      /*  margin-right: 55px;*/
      /*}*/
      /*@media screen and (max-width: 1330px) {*/
      /*  margin-right: 85px;*/
      /*}*/

      img {
        padding-right: 514px;
      }
    }

    &__searchBlock {
      width: 35%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 40px;

      .account-menu {
        display: flex;
        align-items: center;
      }

      .dropdownWrapper {
        height: 32px;
        width: 239px;
        margin-right: 40px;
        z-index: 3;
        position: relative;

        .sel_project_block {
          margin-right: 150px;
          background-color: #D15F45;
          border-radius: 4px;
          width: 191px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;

          &__proj {
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

          &__imgWrapper {
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

        .clientsTop__dropdown {
          z-index: -1;
          position: absolute;
          right: 48px;
          top: 36px;
          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.20);

          .additional {
            color: #67573e;
            background-color: #fff;
            font-size: 14px;
            width: 191px;

            &__listItem {
              padding: 12px;
              cursor: pointer;
              border-bottom: 0.5px solid #f4f2f1;

              &:hover {
                background-color: #f4f2f1;
              }
            }

            .first {
              &:hover {
                background-color: #f4f2f1;
              }
            }
          }
        }
      }

      .womanWrapper {
        margin: 7px 5px 0px 0px;
        position: relative;

        &__photo {
          border-radius: 50%;
          background-color: white;
          width: 35px;
          height: 35px;
          object-fit: cover;
          cursor: default;
        }

        .accountMenuWrapper {
          .accountBlock {
            width: 230px;
            height: 124px;
            background-color: #fff;
            box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
            position: absolute;
            top: 44px;
            right: -115px;
            border-radius: 5px;
            z-index: 5;
            overflow: hidden;

            &__info {
              display: flex;
              justify-content: flex-start;
              border-bottom: 1px solid #998e7e;
              padding: 5px 0;

              .icon {
                margin-left: 10px;

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
                padding-top: 5px;
                margin-left: 10px;

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
              text-decoration: none;

              .human_icon {
                margin-left: 10px;

                img {
                  height: 32px;
                }
              }

              .my_account {
                font-size: 12px;
                color: #67573e;
                margin-left: 10px;
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
                margin-left: 12px;

                img {
                  height: 32px;
                }
              }

              .sign_out {
                font-size: 12px;
                color: #67573e;
                margin-left: 7px;
              }

              &:hover {
                background-color: #ddd3c8;
              }
            }
          }
        }
      }

      .chevronWrapper {
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
          transform: skew(0deg, 50deg);
        }

        .chevron:after {
          content: "";
          position: absolute;
          top: 15px;
          height: 8%;
          left: 8px;
          width: 29%;
          background: #fff;
          transform: skew(0deg, -50deg);
        }
      }
    }
  }

  .clientsMainWrapper {
    box-sizing: border-box;
    padding-top: 40px;
    padding-left: 135px;
    display: flex;
    height: 100%;
    position: relative;

    &__inner {
      box-sizing: border-box;
      padding: 20px 40px;
    }

    .maininfoWrapper {
      width: 100%;
    }

    .detailedInfoWrapper {
      max-width: 919px;
      margin: 0 auto;
      width: 100%;
    }

    .detailedProjectWrapper {
      max-width: 919px;
      margin: 0 auto;
      width: 100%;
    }

    .mainInfo {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin: 0 auto;

      .buttonPanel {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 5%;

        button {
          color: #fff;
          font-size: 15px;
          box-shadow: 0 5px 8px rgba(103, 87, 62, 0.5);
          background-color: #D15F45;
          border-radius: 18px;
          border: none;
          width: 180px;
          height: 43px;
          margin: 15px 18px 0;
          outline: none;
          cursor: pointer;
        }
      }
    }

    .clientsNavbar {
      font-family: Myriad400;
      position: fixed;
      left: 0;
      z-index: 999;
      display: flex;
      min-height: calc(100vh - 40px);

      &__sideBar {
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

      &__openHide {
        background: rgb(245, 135, 110);
        color: white;
        width: 27px;
        height: 38px;
        top: 0;
        right: 0;
        text-align: center;
        cursor: pointer;
        z-index: 1;

        .icon {
          font-size: 32px;
        }

        .openReverse {
          transform: rotate(180deg);
        }
      }

      .navbar__ulist {
        list-style: none;
        font-size: 14px;
        font-weight: 700;
        padding: 0;
        width: 150px;
        height: 77vh;
        margin-bottom: 0;
        overflow-y: scroll;

        a {
          text-decoration: none;
          display: block;
          margin-bottom: 20px;

          &:last-child {
            margin-bottom: 120px;
            @media (max-height: 768px) {
              margin-bottom: 57px;
            }
          }
        }

        &_item {
          padding-bottom: 10px;
          padding-top: 5px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;

          .intothelist {
            margin-bottom: 78%;
          }

          .title {
            opacity: 0;
            font-family: Myriad900;
            color: #fff;
          }

          .showTitle {
            opacity: 1;
          }

          .navbar__image {
            filter: brightness(300%);
          }
        }

        .active {
          background-color: white;

          .title {
            font-family: Myriad900;
            color: #978d7e;
          }

          .navbar__image {
            filter: none;
          }
        }

        .activeSecondLi {
          li {
            &:nth-child(2) {
              background-color: white;

              .title {
                color: #978d7e;
              }
            }
          }
        }
      }

      .logoImage {
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: url("../assets/images/logo_white.png");
        background-size: contain;
        background-repeat: no-repeat;
        width: 175px;
        height: 59px;
        padding-bottom: 61px;
      }

      .balloons {
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

    .clientsAll {
      display: flex;
      flex-direction: column;
      align-items: center;

      &__dropMenu {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        border-radius: 18px;
        box-shadow: 0 2px 4px 0 rgba(103, 87, 62, .3), 0 2px 16px 0 rgba(103, 87, 62, .2);
        margin-right: 36px;
        margin-bottom: 10px;
        padding: 0 14px;
        color: #67573e;

        &_select {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 1.5%;
          cursor: pointer;
        }

        &_item {
          width: 100%;
          padding: 1.5%;
        }

        .reverseImage {
          transform: rotate(180deg);
        }
      }
    }

    .borderAngle {
      border-radius: 0;
      border: none;
      margin-bottom: 0;
    }
  }

  /*.breadCrumbs {*/
  /*  max-height: 50px;*/
  /*  margin: 0px 0px 30px 0;*/
  /*  color: #67573e;*/
  /*  font-size: 22px;*/

  /*  .arrows {*/
  /*    font-size: 16px;*/
  /*    opacity: 0.6;*/
  /*    margin: 0 10px;*/
  /*  }*/
  /*}*/

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

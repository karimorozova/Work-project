<template lang="pug">
  .block
    .block__header
      .block__header-left
      .block__header-right

        .header__button

          //.dropdown(v-click-outside="closeRequestsMenu")
            .dropdown__block(@click="showDropdown")
              .dropdown__title
                span New Project
              //.dropdown__icon
                img(src="../../assets/images/open-arrow_white.png" :class="{rotate: dropdownVisible}")
            //.dropdown__dropbox(v-if="dropdownVisible")
              .dropdown__item(v-if="client.name === 'eToro (Europe) Limited'" v-for='(proj, ind) in newProjectOnlyComplianceOption' @click='dataForRequest(ind, "newProjectOnlyComplianceOption")')
                .dropdown__item-text {{ proj.title }}
              .dropdown__item(v-if="client.name !== 'eToro (Europe) Limited'" v-for='(proj, ind) in newProject' @click='dataForRequest(ind, "newProject")')
                .dropdown__item-text {{ proj.title }}
          Button(value="New Project" @clicked="dataForRequest")

        div(v-click-outside="clickOutside")
          .header__user(@click="toggleMenu")
            .user__name {{ client.name || '' }}
            .user__splitter(style="margin-right: 10px") |
            .user__name {{ user.firstName || '' }} {{ user.surname || '' }}
            .user__image
              img(v-if="!user.photo" src='../../assets/images/signin-background.jpg')
              img(v-else :src="domain+user.photo")

          .header__dropbox(v-if="isDropBox")
            .dropbox__item(@click="signOut()")
              .dropbox__item-icon
                i.fas.fa-power-off
              .dropbox__item-text Logout

</template>

<script>
	import Button from "./Button"
	import { mapActions, mapGetters } from "vuex"
	import ClickOutside from "vue-click-outside"

	export default {
		components: { Button },
		directives: {
			ClickOutside
		},
		data() {
			return {
				isDropBox: false,
				domain: '',
				// dropdownVisible: false,
        newProjectOnlyComplianceOption: [
	        { title: "Compliance", path: "/new-request" }
        ],
				newProject: [
					{ title: "Translation", path: "/translation" },
          { title: "Compliance", path: "/new-request" }

					// { title: "Copywriting", path: "/copywriting" },
					// { title: "Marketing", path: "/marketing" },
					// {title: "Proofing/QA", path: "/proofing"},
					// {title: "Graphic Localization", path: "/graphic-localization"}
				]
			}
		},
		created() {
			this.domain = process.env.domain
		},
		methods: {
			...mapActions([
				"logout"
			]),
			dataForRequest() {
				this.$router.push(`/client-request/new-request`)
			},
			// showDropdown() {
			// 	this.dropdownVisible = !this.dropdownVisible
			// },
			// closeRequestsMenu() {
			// 	this.dropdownVisible = false
			// },
			signOut() {
				this.logout()
				this.$router.push('/login')
			},
			clickOutside() {
				this.isDropBox = false
			},
			gotoRequestPage() {
				this.$router.push({ name: 'create-project' })
			},
			toggleMenu() {
				this.isDropBox = !this.isDropBox
			}
		},
		computed: {
			...mapGetters({
				user: "getUserInfo",
				client: "getClientInfo"
			})
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../assets/scss/colors";


  .dropdown {
    position: relative;

    &__block {
      background-color: $red;
      border-radius: 4px;
      display: flex;
      color: white;
      width: 140px;
      justify-content: space-between;
      padding: 8px 12px;
      cursor: pointer;
      letter-spacing: 0.2px;
      transition: .2s ease-out;

      &:hover {
        box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      }
    }

    &__item {
      display: flex;
      padding: 10px 14px;
      transition: 0.1s cubic-bezier(0.12, 0, 0.39, 0);
      align-items: center;

      &-icon {
        margin-right: 7px;
        font-size: 16px;
      }

      &:hover {
        cursor: pointer;
        background: $list-hover;
      }
    }

    &__dropbox {
      position: absolute;
      background: white;
      right: 0;
      top: 50px;
      width: 165px;
      z-index: 5555;
      border-radius: 4px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;

    }
  }

  .block {
    &__header {
      height: 50px;
      display: flex;
      justify-content: space-between;
      padding: 0 50px;
      background: white;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
      position: relative;
      z-index: 40;

      &-right {
        display: flex;
        align-items: center;
        position: relative;
      }

      &-left {
        display: flex;
        align-items: center;
        position: relative;
      }
    }
  }

  .header {
    &__button {
      margin-left: 40px;
    }

    &__user {
      cursor: pointer;
      margin-left: 30px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }

    &__dropbox {
      position: absolute;
      background: white;
      right: 0;
      top: 60px;
      width: 200px;
      z-index: 5555;
      border-radius: 4px;
      box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    }
  }

  .user {
    &__image {
      height: 32px;
      width: 32px;
      border-radius: 32px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 32px;
      }
    }

    &__name {
      margin-right: 10px;
      font-family: 'Myriad600';
    }

  }

  .dropbox {
    &__item {
      display: flex;
      padding: 10px 14px;
      transition: 0.1s cubic-bezier(0.12, 0, 0.39, 0);
      align-items: center;

      &-icon {
        margin-right: 7px;
        font-size: 16px;
      }

      &:hover {
        cursor: pointer;
        background: $list-hover;
      }
    }
  }
</style>
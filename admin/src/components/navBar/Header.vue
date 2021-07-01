<template lang="pug">
  .block
    .block__header
      .block__header-left
      .block__header-right

        .header__button
          Button(value="Add Project" @clicked="gotoRequestPage")

        div(v-click-outside="clickOutside")
          .header__user(@click="toggleMenu")
            .user__image
              img(v-if="!user.photo" src='../../assets/images/signin-background.jpg')
              img(v-else :src="user.photo")

            .user__name {{ user.firstName || '' }} {{ user.lastName || '' }}
            .user__chevron
              i.fas.fa-chevron-down(v-if="isDropBox")
              i.fas.fa-chevron-right(v-if="!isDropBox")

          .header__dropbox(v-if="isDropBox")
            .dropbox__item(@click="useDropBoxListMethod('My Account')")
              .dropbox__item-icon
                i.fas.fa-user-circle
              .dropbox__item-text My Account
            .dropbox__item(@click="useDropBoxListMethod('Logout')")
              .dropbox__item-icon
                i.fas.fa-power-off
              .dropbox__item-text Logout

</template>

<script>
	import Button from "../Button"
	import { mapGetters } from "vuex"
	import ClickOutside from "vue-click-outside"

	export default {
		components: { Button },
		directives: {
			ClickOutside
		},
		data() {
			return {
				isDropBox: false
			}
		},
		methods: {
			clickOutside() {
				this.isDropBox = false
			},
			gotoRequestPage() {
				this.$router.push({ name: 'create-project' })
			},
			toggleMenu() {
				this.isDropBox = !this.isDropBox
			},
			useDropBoxListMethod(key) {
				switch (key) {
					case 'My Account' :
						this.$router.push({ name: 'pangea-account' })
						break
					case 'Logout' :
						this.signOut()
						break
				}
				this.clickOutside()
			},
			async signOut() {
				try {
					localStorage.removeItem("token")
					this.$router.push('/login')
				} catch (err) {
					console.log(err, 'in signOut()')
				}
			}
		},
		computed: {
			...mapGetters({
				user: "getUser"
			})
		}
	}
</script>

<style lang="scss" scoped>
  .block {
    width: 100%;

    &__header {
      height: 50px;
      background-color: lightgrey;
      display: flex;
      justify-content: space-between;
      padding: 0 50px;

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
      margin-left: 30px;
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
      top: 50px;
      width: 200px;
      z-index: 5555;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;

    }
  }

  .user {
    &__image {
      height: 32px;
      width: 32px;
      border-radius: 32px;
      margin-right: 7px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 32px;
      }
    }

    &__name {
      margin-right: 15px;
      font-family: 'Myriad600';
    }

    &__chevron {
      font-size: 14px;
      margin-top: 3px;
      width: 15px;
    }
  }

  .dropbox {
    &__item {
      display: flex;
      padding: 10px 14px;
      transition: .2s cubic-bezier(0.22, 0.61, 0.36, 1);
      align-items: center;

      &-icon {
        margin-right: 7px;
        font-size: 16px;
      }

      &:hover {
        cursor: pointer;
        background: red;
      }
    }
  }
</style>
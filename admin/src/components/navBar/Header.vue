<template lang="pug">
  .block
    .block__header
      .block__header-left
      .block__header-right

        .header__button
          Button(value="Add Project" @clicked="gotoRequestPage")

        .header__user(@click="toggleMenu")
          .user__image
            img(src='../../assets/images/signin-background.jpg')
          .user__name
            span Maksym Knyazev
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

	export default {
		components: { Button },
		data() {
			return {
				isDropBox: false
			}
		},
		methods: {
			gotoRequestPage() {
				this.$router.push({ name: 'create-project' })
			},
			toggleMenu() {
				this.isDropBox = !this.isDropBox
			},
			useDropBoxListMethod(key) {
				switch (key) {
					case 'My Account' :
						this.$router.push('/account-info')
						break
					case 'Logout' :
						this.signOut()
						break
				}
			},
			async signOut() {
				try {
					localStorage.removeItem("token");
					this.$router.push('/login')
				} catch (err) {
					console.log(err, 'in signOut()')
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
  .block {
    width: -webkit-fill-available;

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
      background: #f4f2f1;
      right: 0;
      top: 50px;
      width: 200px;
      z-index: 5555;
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